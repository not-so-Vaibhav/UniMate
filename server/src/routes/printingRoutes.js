import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole, requireOperatorService } from '../middleware/roleMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = Router();

// GET /api/v1/printing/specs - Accessible to all authenticated users
router.get('/specs', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      supportedTypes: ['pdf', 'docx', 'jpg', 'png'],
      maxFileSizeMb: 10,
      colorModes: ['bw', 'color'],
      printTypes: ['single_sided', 'double_sided'],
      counterLocation: 'East Wing Ground Floor (XRX-01)',
      serviceHours: '09:00 AM – 06:00 PM (Mon-Sat)',
    },
  });
});

// GET /api/v1/printing/operator/queue - Xerox/Printing Operator or Admin oversight ONLY
router.get(
  '/operator/queue',
  authenticateToken,
  requireRole('operator', 'admin'),
  requireOperatorService('printing'),
  async (req, res, next) => {
    try {
      const [requests] = await pool.query(
        `SELECT id, request_number, user_id, document_name, pages_count, copies_count,
                color_mode, print_type, status, notes, created_at
         FROM print_requests
         ORDER BY created_at DESC
         LIMIT 50`
      );
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

// PATCH /api/v1/printing/operator/requests/:id/status - Printing Operator or Admin oversight ONLY
router.patch(
  '/operator/requests/:id/status',
  authenticateToken,
  requireRole('operator', 'admin'),
  requireOperatorService('printing'),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const validStatuses = ['submitted', 'in_progress', 'ready', 'collected', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        throw ApiError.badRequest(`Invalid print request status. Must be one of [${validStatuses.join(', ')}].`);
      }

      const [existing] = await pool.query('SELECT id, status FROM print_requests WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        throw ApiError.notFound('Print request not found.');
      }

      await pool.query('UPDATE print_requests SET status = ?, operator_id = ? WHERE id = ?', [
        status,
        req.user.id,
        req.params.id,
      ]);

      // Record audit history
      await pool.query(
        `INSERT INTO status_history (entity_type, entity_id, previous_status, new_status, changed_by_user_id)
         VALUES ('print_request', ?, ?, ?, ?)`,
        [req.params.id, existing[0].status, status, req.user.id]
      );

      res.status(200).json({
        success: true,
        message: `Print request status updated to '${status}'.`,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
