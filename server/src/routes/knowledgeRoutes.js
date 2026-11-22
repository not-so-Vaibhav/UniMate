import { Router } from 'express';
import pool from '../config/db.js';
import { env } from '../config/env.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = Router();

// ==========================================
// 1. DATA AUDIT & STATS (REAL DB COUNTS)
// ==========================================

// GET /api/v1/knowledge/stats - Admin Data Management Console metrics
router.get('/stats', authenticateToken, requireRole('admin'), async (req, res, next) => {
  try {
    // 1. Knowledge Document counts
    const [docCounts] = await pool.query(`
      SELECT classification, COUNT(*) as count 
      FROM knowledge_documents 
      GROUP BY classification
    `);

    // 2. Campus Locations counts
    const [locCounts] = await pool.query(`
      SELECT classification, COUNT(*) as count 
      FROM campus_locations 
      GROUP BY classification
    `);

    // 3. Canteen Menu counts
    const [menuCounts] = await pool.query(`
      SELECT classification, COUNT(*) as count 
      FROM canteen_menu_items 
      GROUP BY classification
    `);

    const formatCounts = (rows) => {
      const summary = {
        DEVELOPMENT_SAMPLE: 0,
        PENDING_VERIFICATION: 0,
        OFFICIAL_VERIFIED: 0,
        RETIRED: 0,
        TOTAL: 0,
        total: 0,
      };
      rows.forEach((r) => {
        if (summary[r.classification] !== undefined) {
          summary[r.classification] = Number(r.count);
        }
        summary.TOTAL += Number(r.count);
        summary.total += Number(r.count);
      });
      return summary;
    };

    res.status(200).json({
      success: true,
      data: {
        documents: formatCounts(docCounts),
        locations: formatCounts(locCounts),
        menuItems: formatCounts(menuCounts),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. DOCUMENT REGISTRY & VERIFICATION
// ==========================================

// GET /api/v1/knowledge/documents - List documents with provenance filters
router.get('/documents', authenticateToken, async (req, res, next) => {
  try {
    const { classification, category, search, publishedOnly } = req.query;

    let query = `
      SELECT kd.id, kd.title, kd.category, kd.source_reference, kd.summary,
             kd.key_points, kd.keywords, kd.classification, kd.is_published,
             kd.version, kd.verified_at, kd.created_at, kd.updated_at,
             u.full_name as verifier_name
      FROM knowledge_documents kd
      LEFT JOIN users u ON kd.verified_by_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (publishedOnly === 'true') {
      query += ` AND kd.is_published = TRUE`;
    }

    if (classification && classification !== 'ALL') {
      query += ` AND kd.classification = ?`;
      params.push(classification);
    }

    if (category && category !== 'ALL') {
      query += ` AND LOWER(kd.category) = LOWER(?)`;
      params.push(category.trim());
    }

    if (search && search.trim()) {
      query += ` AND (LOWER(kd.title) LIKE LOWER(?) OR LOWER(kd.summary) LIKE LOWER(?) OR LOWER(kd.source_reference) LIKE LOWER(?))`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY kd.created_at DESC`;

    const [documents] = await pool.query(query, params);

    const parsedDocs = documents.map((doc) => {
      let keyPoints = [];
      let keywords = [];
      try {
        keyPoints = typeof doc.key_points === 'string' ? JSON.parse(doc.key_points) : doc.key_points || [];
      } catch {
        keyPoints = [];
      }
      try {
        keywords = typeof doc.keywords === 'string' ? JSON.parse(doc.keywords) : doc.keywords || [];
      } catch {
        keywords = [];
      }
      return {
        ...doc,
        key_points: keyPoints,
        keywords: keywords,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        total: parsedDocs.length,
        documents: parsedDocs,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/knowledge/documents/:id - Single document detail with revision history
router.get('/documents/:id', authenticateToken, async (req, res, next) => {
  try {
    const docId = parseInt(req.params.id, 10);
    if (isNaN(docId)) {
      throw ApiError.badRequest('Invalid document ID');
    }

    const [rows] = await pool.query(
      `SELECT kd.*, u.full_name as verifier_name
       FROM knowledge_documents kd
       LEFT JOIN users u ON kd.verified_by_user_id = u.id
       WHERE kd.id = ?`,
      [docId]
    );

    if (rows.length === 0) {
      throw ApiError.notFound('Knowledge document not found');
    }

    const doc = rows[0];
    let keyPoints = [];
    let keywords = [];
    try {
      keyPoints = typeof doc.key_points === 'string' ? JSON.parse(doc.key_points) : doc.key_points || [];
      keywords = typeof doc.keywords === 'string' ? JSON.parse(doc.keywords) : doc.keywords || [];
    } catch {
      keyPoints = [];
      keywords = [];
    }

    // Fetch revision history
    const [revisions] = await pool.query(
      `SELECT r.id, r.version, r.title, r.change_reason, r.created_at, u.full_name as editor_name
       FROM knowledge_document_revisions r
       JOIN users u ON r.changed_by_user_id = u.id
       WHERE r.document_id = ?
       ORDER BY r.version DESC`,
      [docId]
    );

    res.status(200).json({
      success: true,
      data: {
        document: {
          ...doc,
          key_points: keyPoints,
          keywords: keywords,
        },
        revisions,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/knowledge/documents - Admin only: Onboard a new institutional document
router.post('/documents', authenticateToken, requireRole('admin'), async (req, res, next) => {
  try {
    const title = req.body.title;
    const category = req.body.category;
    const sourceReference = req.body.source_reference || req.body.sourceReference;
    const summary = req.body.summary;
    const keyPoints = req.body.key_points || req.body.keyPoints || [];
    const keywords = req.body.keywords || [];
    const classification = req.body.classification;

    if (!title || !title.trim()) throw ApiError.badRequest('Document title is required.');
    if (!category || !category.trim()) throw ApiError.badRequest('Document category is required.');
    if (!sourceReference || !sourceReference.trim()) throw ApiError.badRequest('Source document reference is required.');
    if (!summary || !summary.trim()) throw ApiError.badRequest('Document summary or policy excerpt is required.');

    const docClassification = ['DEVELOPMENT_SAMPLE', 'PENDING_VERIFICATION', 'OFFICIAL_VERIFIED'].includes(classification)
      ? classification
      : 'PENDING_VERIFICATION';

    const isPublished = docClassification === 'OFFICIAL_VERIFIED';
    const verifiedBy = isPublished ? req.user.id : null;
    const verifiedAt = isPublished ? new Date() : null;

    const [result] = await pool.query(
      `INSERT INTO knowledge_documents (
        title, category, source_reference, summary, key_points, keywords,
        classification, is_published, verified_by_user_id, verified_at, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        title.trim(),
        category.trim().toLowerCase(),
        sourceReference.trim(),
        summary.trim(),
        JSON.stringify(keyPoints),
        JSON.stringify(keywords),
        docClassification,
        isPublished,
        verifiedBy,
        verifiedAt,
      ]
    );

    // Initial revision record
    await pool.query(
      `INSERT INTO knowledge_document_revisions (document_id, version, title, summary, key_points, changed_by_user_id, change_reason)
       VALUES (?, 1, ?, ?, ?, ?, 'Initial document onboarding')`,
      [result.insertId, title.trim(), summary.trim(), JSON.stringify(keyPoints), req.user.id]
    );

    const [created] = await pool.query('SELECT * FROM knowledge_documents WHERE id = ?', [result.insertId]);

    // If published, sync with AI retriever
    if (isPublished) {
      await syncActiveCorpusToAiService();
    }

    res.status(201).json({
      success: true,
      message: 'Knowledge document onboarded successfully.',
      data: { document: created[0] },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/knowledge/documents/:id/verify - Admin: Approve & Publish, Reject, or Retire
router.patch('/documents/:id/verify', authenticateToken, requireRole('admin'), async (req, res, next) => {
  try {
    const docId = parseInt(req.params.id, 10);
    const { action, notes } = req.body;

    if (isNaN(docId)) throw ApiError.badRequest('Invalid document ID');
    if (!['approve', 'reject', 'retire'].includes(action)) {
      throw ApiError.badRequest("Action must be one of ['approve', 'reject', 'retire'].");
    }

    const [existing] = await pool.query('SELECT * FROM knowledge_documents WHERE id = ?', [docId]);
    if (existing.length === 0) throw ApiError.notFound('Document not found');

    const doc = existing[0];
    let newClassification = doc.classification;
    let newPublished = doc.is_published;
    let verifierId = doc.verified_by_user_id;
    let verifiedAt = doc.verified_at;

    if (action === 'approve') {
      newClassification = 'OFFICIAL_VERIFIED';
      newPublished = true;
      verifierId = req.user.id;
      verifiedAt = new Date();
    } else if (action === 'reject' || action === 'retire') {
      newClassification = 'RETIRED';
      newPublished = false;
    }

    await pool.query(
      `UPDATE knowledge_documents 
       SET classification = ?, is_published = ?, verified_by_user_id = ?, verified_at = ?
       WHERE id = ?`,
      [newClassification, newPublished, verifierId, verifiedAt, docId]
    );

    // Record revision
    const nextVersion = doc.version + 1;
    const keyPointsStr = typeof doc.key_points === 'object' && doc.key_points !== null 
      ? JSON.stringify(doc.key_points) 
      : (doc.key_points || '[]');

    await pool.query(
      `INSERT INTO knowledge_document_revisions (document_id, version, title, summary, key_points, changed_by_user_id, change_reason)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [docId, nextVersion, doc.title, doc.summary, keyPointsStr, req.user.id, notes || `Action: ${action}`]
    );

    await pool.query(`UPDATE knowledge_documents SET version = ? WHERE id = ?`, [nextVersion, docId]);

    // Sync active corpus to FastAPI AI service
    await syncActiveCorpusToAiService();

    res.status(200).json({
      success: true,
      message: `Document status updated to '${newClassification}'.`,
      data: {
        documentId: docId,
        classification: newClassification,
        is_published: newPublished,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Helper: Synchronize active published documents to FastAPI AI service
async function syncActiveCorpusToAiService() {
  try {
    const [docs] = await pool.query(`
      SELECT id, title, category, source_reference as source, summary, key_points, keywords
      FROM knowledge_documents
      WHERE is_published = TRUE
    `);

    const formattedCorpus = docs.map((d) => ({
      id: `doc_${d.id}`,
      title: d.title,
      category: d.category,
      source: d.source,
      summary: d.summary,
      key_points: typeof d.key_points === 'string' ? JSON.parse(d.key_points) : d.key_points || [],
      keywords: typeof d.keywords === 'string' ? JSON.parse(d.keywords) : d.keywords || [],
    }));

    const response = await fetch(`${env.AI_SERVICE.URL}/api/v1/assistant/corpus/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documents: formattedCorpus }),
    });

    if (response.ok) {
      console.log(`[Knowledge] Synced ${formattedCorpus.length} verified documents to FastAPI service.`);
    }
  } catch (err) {
    console.warn('[Knowledge] Could not sync corpus to AI service:', err.message);
  }
}

export default router;
