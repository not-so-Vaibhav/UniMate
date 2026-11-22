import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole, requireOperatorService } from '../middleware/roleMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = Router();

// ==========================================
// SECURE FILE STORAGE CONFIGURATION
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/printing');

// Ensure private upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configurable limit (default 10 MB)
const MAX_FILE_SIZE_BYTES = (parseInt(process.env.PRINT_MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/png',
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate safe, unguessable filename without path traversal risks
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    cb(null, `${safeBase}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        ApiError.badRequest(
          `Unsupported file type '${file.mimetype}'. Allowed types: PDF, DOCX, JPG, PNG.`
        )
      );
    }
    cb(null, true);
  },
});

// Helper: Generate unique request reference
function generateRequestNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PRT-${dateStr}-${seq}${rand}`;
}

// ==========================================
// 1. SPECIFICATIONS ENDPOINT
// ==========================================

// GET /api/v1/printing/specs - Accessible to all authenticated users
router.get('/specs', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      supportedTypes: ['pdf', 'docx', 'jpg', 'png'],
      maxFileSizeMb: parseInt(process.env.PRINT_MAX_FILE_SIZE_MB, 10) || 10,
      colorModes: ['bw', 'color'],
      printTypes: ['single_sided', 'double_sided'],
      pricing: {
        bw_per_page: 1.0,
        color_per_page: 5.0,
      },
      counterLocation: 'East Wing Ground Floor (XRX-01)',
      serviceHours: '09:00 AM – 06:00 PM (Mon-Sat)',
    },
  });
});

// ==========================================
// 2. STUDENT PRINT REQUEST WORKFLOWS
// ==========================================

// POST /api/v1/printing/requests - Submit a print request with file upload
router.post(
  '/requests',
  authenticateToken,
  upload.single('document'),
  async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
      if (!req.file) {
        throw ApiError.badRequest('A document file (PDF, DOCX, JPG, PNG) is required.');
      }

      const {
        documentName,
        pagesCount = 1,
        copiesCount = 1,
        colorMode = 'bw',
        printType = 'double_sided',
        notes,
      } = req.body;

      const numPages = parseInt(pagesCount, 10);
      const numCopies = parseInt(copiesCount, 10);

      if (isNaN(numPages) || numPages <= 0) {
        throw ApiError.badRequest('pagesCount must be a positive integer.');
      }
      if (isNaN(numCopies) || numCopies <= 0) {
        throw ApiError.badRequest('copiesCount must be a positive integer.');
      }
      if (!['bw', 'color'].includes(colorMode)) {
        throw ApiError.badRequest("colorMode must be either 'bw' or 'color'.");
      }
      if (!['single_sided', 'double_sided'].includes(printType)) {
        throw ApiError.badRequest("printType must be either 'single_sided' or 'double_sided'.");
      }

      await connection.beginTransaction();

      // 1. Register file in uploaded_files
      const [fileResult] = await connection.query(
        `INSERT INTO uploaded_files (user_id, original_name, stored_filename, mime_type, file_size_bytes, storage_path, purpose)
         VALUES (?, ?, ?, ?, ?, ?, 'printing')`,
        [
          req.user.id,
          req.file.originalname,
          req.file.filename,
          req.file.mimetype,
          req.file.size,
          req.file.path,
        ]
      );
      const fileId = fileResult.insertId;

      // 2. Insert print_requests record
      const requestNumber = generateRequestNumber();
      const docDisplayName = documentName?.trim() || req.file.originalname;

      const [printResult] = await connection.query(
        `INSERT INTO print_requests (request_number, user_id, file_id, document_name, pages_count, copies_count, color_mode, print_type, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)`,
        [
          requestNumber,
          req.user.id,
          fileId,
          docDisplayName,
          numPages,
          numCopies,
          colorMode,
          printType,
          notes?.trim() || null,
        ]
      );
      const requestId = printResult.insertId;

      // 3. Record audit history
      await connection.query(
        `INSERT INTO status_history (entity_type, entity_id, previous_status, new_status, changed_by_user_id, comment)
         VALUES ('print_request', ?, NULL, 'submitted', ?, 'Print job submitted by student')`,
        [requestId, req.user.id]
      );

      await connection.commit();

      const [created] = await connection.query(
        `SELECT r.*, f.original_name, f.file_size_bytes, f.mime_type
         FROM print_requests r
         JOIN uploaded_files f ON r.file_id = f.id
         WHERE r.id = ?`,
        [requestId]
      );

      res.status(201).json({
        success: true,
        message: 'Print request submitted successfully.',
        data: { request: created[0] },
      });
    } catch (error) {
      await connection.rollback();
      // Clean up uploaded file on failure
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error('[Printing] Failed to remove abandoned upload:', unlinkErr);
        }
      }
      next(error);
    } finally {
      connection.release();
    }
  }
);

// GET /api/v1/printing/requests - Student: List my print requests
router.get('/requests', authenticateToken, async (req, res, next) => {
  try {
    const [requests] = await pool.query(
      `SELECT r.id, r.request_number, r.document_name, r.pages_count, r.copies_count,
              r.color_mode, r.print_type, r.status, r.notes, r.created_at, r.updated_at,
              f.original_name, f.file_size_bytes, f.mime_type
       FROM print_requests r
       LEFT JOIN uploaded_files f ON r.file_id = f.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/printing/requests/:id - Student/Operator: Request detail
router.get('/requests/:id', authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, f.original_name, f.file_size_bytes, f.mime_type,
              u.full_name as student_name, u.student_id, u.email as student_email
       FROM print_requests r
       LEFT JOIN uploaded_files f ON r.file_id = f.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      throw ApiError.notFound('Print request not found.');
    }

    const request = rows[0];
    const isOwner = request.user_id === req.user.id;
    const isAuthorizedOperator =
      req.user.role === 'admin' ||
      (req.user.role === 'operator' && req.user.operator_service === 'printing');

    if (!isOwner && !isAuthorizedOperator) {
      throw ApiError.forbidden('You do not have permission to view this print request.');
    }

    // Get audit history
    const [history] = await pool.query(
      `SELECT id, previous_status, new_status, comment, created_at
       FROM status_history
       WHERE entity_type = 'print_request' AND entity_id = ?
       ORDER BY created_at ASC`,
      [request.id]
    );
    request.statusHistory = history;

    res.status(200).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/printing/requests/:id/download - Secure Document Access
router.get('/requests/:id/download', authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.user_id, r.document_name, f.stored_filename, f.original_name, f.storage_path, f.mime_type
       FROM print_requests r
       JOIN uploaded_files f ON r.file_id = f.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      throw ApiError.notFound('Print document not found.');
    }

    const fileMeta = rows[0];
    const isOwner = fileMeta.user_id === req.user.id;
    const isAuthorizedOperator =
      req.user.role === 'admin' ||
      (req.user.role === 'operator' && req.user.operator_service === 'printing');

    if (!isOwner && !isAuthorizedOperator) {
      throw ApiError.forbidden('You do not have permission to access this document.');
    }

    if (!fs.existsSync(fileMeta.storage_path)) {
      throw ApiError.notFound('Physical document file is not found on server.');
    }

    res.setHeader('Content-Type', fileMeta.mime_type);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileMeta.original_name)}"`
    );

    const fileStream = fs.createReadStream(fileMeta.storage_path);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/printing/requests/:id/cancel - Student: Cancel print request
router.patch('/requests/:id/cancel', authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, status FROM print_requests WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      throw ApiError.notFound('Print request not found.');
    }

    const request = rows[0];
    if (request.user_id !== req.user.id && req.user.role !== 'admin') {
      throw ApiError.forbidden('You can only cancel your own print requests.');
    }

    if (request.status !== 'submitted') {
      throw ApiError.badRequest(
        `Print request cannot be cancelled because it is already '${request.status}'. Cancellation is only permitted while status is 'submitted'.`
      );
    }

    await pool.query(`UPDATE print_requests SET status = 'cancelled' WHERE id = ?`, [request.id]);

    await pool.query(
      `INSERT INTO status_history (entity_type, entity_id, previous_status, new_status, changed_by_user_id, comment)
       VALUES ('print_request', ?, 'submitted', 'cancelled', ?, 'Cancelled by student')`,
      [request.id, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Print request cancelled successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. OPERATOR QUEUE & WORKFLOWS
// ==========================================

// GET /api/v1/printing/operator/queue - Operator Queue with filtering
router.get(
  '/operator/queue',
  authenticateToken,
  requireRole('operator', 'admin'),
  requireOperatorService('printing'),
  async (req, res, next) => {
    try {
      const { status } = req.query;
      let query = `
        SELECT r.id, r.request_number, r.user_id, r.document_name, r.pages_count, r.copies_count,
               r.color_mode, r.print_type, r.status, r.notes, r.created_at, r.updated_at,
               f.original_name, f.file_size_bytes, f.mime_type,
               u.full_name as student_name, u.student_id, u.email as student_email
        FROM print_requests r
        LEFT JOIN uploaded_files f ON r.file_id = f.id
        JOIN users u ON r.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (status && status !== 'all') {
        query += ` AND r.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY r.created_at DESC LIMIT 100`;

      const [requests] = await pool.query(query, params);

      res.status(200).json({
        success: true,
        data: {
          operatorService: 'printing',
          queueCount: requests.length,
          requests,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/printing/operator/requests/:id/status - Operator status advance
router.patch(
  '/operator/requests/:id/status',
  authenticateToken,
  requireRole('operator', 'admin'),
  requireOperatorService('printing'),
  async (req, res, next) => {
    try {
      const { status, comment } = req.body;
      const validStatuses = [
        'submitted',
        'accepted',
        'in_progress',
        'ready',
        'collected',
        'completed',
        'cancelled',
        'rejected',
      ];

      if (!status || !validStatuses.includes(status)) {
        throw ApiError.badRequest(`Invalid print status. Must be one of [${validStatuses.join(', ')}].`);
      }

      const [existing] = await pool.query('SELECT id, status FROM print_requests WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        throw ApiError.notFound('Print request not found.');
      }

      const prevStatus = existing[0].status;

      if (['collected', 'completed', 'cancelled', 'rejected'].includes(prevStatus)) {
        throw ApiError.badRequest(`Cannot modify print request because it is already in terminal state '${prevStatus}'.`);
      }

      await pool.query(
        'UPDATE print_requests SET status = ?, operator_id = ? WHERE id = ?',
        [status, req.user.id, req.params.id]
      );

      // Record audit history
      await pool.query(
        `INSERT INTO status_history (entity_type, entity_id, previous_status, new_status, changed_by_user_id, comment)
         VALUES ('print_request', ?, ?, ?, ?, ?)`,
        [req.params.id, prevStatus, status, req.user.id, comment?.trim() || `Status updated to ${status} by print operator`]
      );

      res.status(200).json({
        success: true,
        message: `Print request status updated to '${status}'.`,
        data: {
          requestId: req.params.id,
          previousStatus: prevStatus,
          newStatus: status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
