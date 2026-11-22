import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = Router();

// ==========================================
// 1. REGISTRY BROWSING & SEARCH
// ==========================================

// GET /api/v1/lost-found - Browse and search listings
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { item_type, category, search, status, myItemsOnly } = req.query;

    let query = `
      SELECT lf.id, lf.item_type, lf.title, lf.category, lf.description,
             lf.location_id, lf.location_detail, lf.date_occurred, lf.status,
             lf.created_at, lf.updated_at,
             cl.name as location_name, cl.building as location_building,
             u.full_name as reporter_name, u.role as reporter_role,
             lf.reported_by_user_id
      FROM lost_found_items lf
      LEFT JOIN campus_locations cl ON lf.location_id = cl.id
      JOIN users u ON lf.reported_by_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (myItemsOnly === 'true') {
      query += ` AND lf.reported_by_user_id = ?`;
      params.push(req.user.id);
    }

    if (item_type && ['lost', 'found'].includes(item_type)) {
      query += ` AND lf.item_type = ?`;
      params.push(item_type);
    }

    if (category && category !== 'All') {
      query += ` AND LOWER(lf.category) = LOWER(?)`;
      params.push(category.trim());
    }

    if (status && status !== 'All') {
      query += ` AND lf.status = ?`;
      params.push(status.trim());
    }

    if (search && typeof search === 'string' && search.trim()) {
      query += ` AND (LOWER(lf.title) LIKE LOWER(?) OR LOWER(lf.description) LIKE LOWER(?) OR LOWER(lf.location_detail) LIKE LOWER(?))`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY lf.created_at DESC LIMIT 100`;

    const [items] = await pool.query(query, params);

    // Get categories list
    const categories = [
      'All',
      'Electronics & Devices',
      'Cards & Student IDs',
      'Books & Materials',
      'Personal Belongings',
      'Valuables',
      'Other',
    ];

    res.status(200).json({
      success: true,
      data: {
        total: items.length,
        categories,
        items: items.map((item) => ({
          ...item,
          isOwner: item.reported_by_user_id === req.user.id,
          // Privacy protection: Do not expose raw contact info unless user is owner or admin
          contact_info:
            item.reported_by_user_id === req.user.id || req.user.role === 'admin'
              ? item.contact_info
              : 'Protected by Campus Security Desk Protocol',
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/lost-found/:id - Single listing detail
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT lf.*, cl.name as location_name, cl.building as location_building,
              u.full_name as reporter_name, u.role as reporter_role
       FROM lost_found_items lf
       LEFT JOIN campus_locations cl ON lf.location_id = cl.id
       JOIN users u ON lf.reported_by_user_id = u.id
       WHERE lf.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      throw ApiError.notFound('Lost & Found listing not found.');
    }

    const item = rows[0];
    const isOwner = item.reported_by_user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Privacy protection
    if (!isOwner && !isAdmin) {
      item.contact_info = 'Protected. Submit a verification claim to contact reporter.';
    }

    res.status(200).json({
      success: true,
      data: {
        item: {
          ...item,
          isOwner,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. REPORTING WORKFLOWS
// ==========================================

// POST /api/v1/lost-found - Report Lost or Found Item
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const {
      item_type,
      title,
      category,
      description,
      location_id,
      location_detail,
      date_occurred,
      contact_info,
    } = req.body;

    if (!item_type || !['lost', 'found'].includes(item_type)) {
      throw ApiError.badRequest("item_type must be either 'lost' or 'found'.");
    }
    if (!title || !title.trim()) {
      throw ApiError.badRequest('Item title is required.');
    }
    if (!category || !category.trim()) {
      throw ApiError.badRequest('Category is required.');
    }
    if (!description || !description.trim()) {
      throw ApiError.badRequest('Description is required.');
    }
    if (!date_occurred) {
      throw ApiError.badRequest('Date occurred is required.');
    }

    let parsedLocId = null;
    if (location_id) {
      const parsed = parseInt(location_id, 10);
      if (!isNaN(parsed) && parsed > 0) {
        parsedLocId = parsed;
      }
    }

    const [result] = await pool.query(
      `INSERT INTO lost_found_items (
        item_type, title, category, description, location_id,
        location_detail, date_occurred, contact_info, status, reported_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'reported', ?)`,
      [
        item_type,
        title.trim(),
        category.trim(),
        description.trim(),
        parsedLocId,
        location_detail?.trim() || null,
        date_occurred,
        contact_info?.trim() || null,
        req.user.id,
      ]
    );

    const [created] = await pool.query(
      `SELECT lf.*, u.full_name as reporter_name 
       FROM lost_found_items lf 
       JOIN users u ON lf.reported_by_user_id = u.id 
       WHERE lf.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: `Item reported as ${item_type} successfully.`,
      data: { item: created[0] },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/lost-found/:id - Update Listing (Owner or Admin)
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      `SELECT id, reported_by_user_id FROM lost_found_items WHERE id = ?`,
      [req.params.id]
    );

    if (existing.length === 0) {
      throw ApiError.notFound('Listing not found.');
    }

    if (existing[0].reported_by_user_id !== req.user.id && req.user.role !== 'admin') {
      throw ApiError.forbidden('You can only edit your own listings.');
    }

    const { title, category, description, location_id, location_detail, date_occurred, contact_info } = req.body;

    let parsedLocId = null;
    if (location_id) {
      const parsed = parseInt(location_id, 10);
      if (!isNaN(parsed) && parsed > 0) parsedLocId = parsed;
    }

    await pool.query(
      `UPDATE lost_found_items
       SET title = COALESCE(?, title),
           category = COALESCE(?, category),
           description = COALESCE(?, description),
           location_id = COALESCE(?, location_id),
           location_detail = COALESCE(?, location_detail),
           date_occurred = COALESCE(?, date_occurred),
           contact_info = COALESCE(?, contact_info)
       WHERE id = ?`,
      [
        title?.trim(),
        category?.trim(),
        description?.trim(),
        parsedLocId,
        location_detail?.trim(),
        date_occurred,
        contact_info?.trim(),
        req.params.id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM lost_found_items WHERE id = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully.',
      data: { item: updated[0] },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/lost-found/:id/status - Update Status (Owner or Admin)
router.patch('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const { status, resolution_notes } = req.body;
    const validStatuses = ['reported', 'under_review', 'claimed', 'resolved', 'closed'];

    if (!status || !validStatuses.includes(status)) {
      throw ApiError.badRequest(`Invalid status. Must be one of [${validStatuses.join(', ')}].`);
    }

    const [existing] = await pool.query(
      `SELECT id, status, reported_by_user_id FROM lost_found_items WHERE id = ?`,
      [req.params.id]
    );

    if (existing.length === 0) {
      throw ApiError.notFound('Listing not found.');
    }

    const item = existing[0];
    const isOwner = item.reported_by_user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to update the status of this listing.');
    }

    await pool.query(`UPDATE lost_found_items SET status = ? WHERE id = ?`, [status, req.params.id]);

    // Record audit history
    await pool.query(
      `INSERT INTO status_history (entity_type, entity_id, previous_status, new_status, changed_by_user_id, comment)
       VALUES ('lost_found_item', ?, ?, ?, ?, ?)`,
      [req.params.id, item.status, status, req.user.id, resolution_notes?.trim() || `Status updated to ${status}`]
    );

    res.status(200).json({
      success: true,
      message: `Listing status updated to '${status}'.`,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/lost-found/:id/claim - Submit a privacy-conscious ownership claim
router.post('/:id/claim', authenticateToken, async (req, res, next) => {
  try {
    const { verificationProof, contactPreference } = req.body;

    if (!verificationProof || !verificationProof.trim()) {
      throw ApiError.badRequest('Please describe identifying marks or verification proof of ownership.');
    }

    const [existing] = await pool.query(
      `SELECT id, title, reported_by_user_id, status FROM lost_found_items WHERE id = ?`,
      [req.params.id]
    );

    if (existing.length === 0) {
      throw ApiError.notFound('Listing not found.');
    }

    // Record claim inquiry in audit history
    await pool.query(
      `INSERT INTO status_history (entity_type, entity_id, previous_status, new_status, changed_by_user_id, comment)
       VALUES ('lost_found_item', ?, ?, 'under_review', ?, ?)`,
      [
        req.params.id,
        existing[0].status,
        req.user.id,
        `Claim submitted by user ${req.user.id} (${req.user.fullName}). Proof: ${verificationProof.trim()}. Contact preference: ${contactPreference || 'In-person Security Desk'}`,
      ]
    );

    // Update status to 'under_review' if it was 'reported'
    if (existing[0].status === 'reported') {
      await pool.query(`UPDATE lost_found_items SET status = 'under_review' WHERE id = ?`, [req.params.id]);
    }

    res.status(200).json({
      success: true,
      message: 'Claim submitted successfully. Campus Security will verify your ownership proof at the central desk.',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/lost-found/:id - Remove listing (Owner or Admin)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      `SELECT id, reported_by_user_id FROM lost_found_items WHERE id = ?`,
      [req.params.id]
    );

    if (existing.length === 0) {
      throw ApiError.notFound('Listing not found.');
    }

    if (existing[0].reported_by_user_id !== req.user.id && req.user.role !== 'admin') {
      throw ApiError.forbidden('You can only delete your own listings.');
    }

    await pool.query(`DELETE FROM lost_found_items WHERE id = ?`, [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Listing removed successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
