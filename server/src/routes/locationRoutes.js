import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = Router();

// GET /api/v1/locations - Accessible to all authenticated users
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { category, search, includeInactive } = req.query;
    
    // Only admins can see inactive locations
    const showInactive = includeInactive === 'true' && req.user.role === 'admin';
    let query = `SELECT id, name, code, category, building, floor, description, is_active, created_at, updated_at 
                 FROM campus_locations WHERE 1=1`;
    const params = [];

    if (!showInactive) {
      query += ` AND is_active = TRUE`;
    }

    if (category && typeof category === 'string' && category !== 'All') {
      query += ` AND LOWER(category) = LOWER(?)`;
      params.push(category.trim());
    }

    if (search && typeof search === 'string' && search.trim()) {
      query += ` AND (LOWER(name) LIKE LOWER(?) OR LOWER(building) LIKE LOWER(?) OR LOWER(code) LIKE LOWER(?))`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY name ASC`;

    const [locations] = await pool.query(query, params);

    // Also get distinct categories for dynamic filtering
    const [categoryRows] = await pool.query(
      `SELECT DISTINCT category FROM campus_locations WHERE is_active = TRUE ORDER BY category ASC`
    );
    const categories = ['All', ...categoryRows.map((r) => r.category)];

    res.status(200).json({
      success: true,
      data: {
        locations,
        categories,
        total: locations.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/locations/:id - Single location details
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, code, category, building, floor, description, is_active, created_at, updated_at 
       FROM campus_locations WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      throw ApiError.notFound('Campus location not found.');
    }

    res.status(200).json({
      success: true,
      data: { location: rows[0] },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/locations - Admin only: Create a new location
router.post('/', authenticateToken, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, code, category, building, floor, description } = req.body;

    if (!name || !code || !category || !building) {
      throw ApiError.badRequest('Name, code, category, and building are required.');
    }

    // Check unique code
    const [existing] = await pool.query(
      'SELECT id FROM campus_locations WHERE LOWER(code) = LOWER(?)',
      [code.trim()]
    );
    if (existing.length > 0) {
      throw ApiError.conflict(`Location with code '${code}' already exists.`);
    }

    const [result] = await pool.query(
      `INSERT INTO campus_locations (name, code, category, building, floor, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [name.trim(), code.trim().toUpperCase(), category.trim().toLowerCase(), building.trim(), floor?.trim() || null, description?.trim() || null]
    );

    const [newLocation] = await pool.query(
      'SELECT id, name, code, category, building, floor, description, is_active FROM campus_locations WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Campus location created successfully.',
      data: { location: newLocation[0] },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/locations/:id - Admin only: Update location
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, code, category, building, floor, description, is_active } = req.body;

    const [existing] = await pool.query('SELECT id, code FROM campus_locations WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      throw ApiError.notFound('Campus location not found.');
    }

    if (code && code.trim().toUpperCase() !== existing[0].code) {
      const [duplicate] = await pool.query(
        'SELECT id FROM campus_locations WHERE LOWER(code) = LOWER(?) AND id != ?',
        [code.trim(), req.params.id]
      );
      if (duplicate.length > 0) {
        throw ApiError.conflict(`Location with code '${code}' already exists.`);
      }
    }

    await pool.query(
      `UPDATE campus_locations 
       SET name = COALESCE(?, name),
           code = COALESCE(?, code),
           category = COALESCE(?, category),
           building = COALESCE(?, building),
           floor = COALESCE(?, floor),
           description = COALESCE(?, description),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name?.trim(),
        code?.trim().toUpperCase(),
        category?.trim().toLowerCase(),
        building?.trim(),
        floor?.trim(),
        description?.trim(),
        is_active !== undefined ? Boolean(is_active) : null,
        req.params.id,
      ]
    );

    const [updated] = await pool.query(
      'SELECT id, name, code, category, building, floor, description, is_active FROM campus_locations WHERE id = ?',
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Campus location updated successfully.',
      data: { location: updated[0] },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/locations/:id/status - Admin only: Toggle active/inactive
router.patch('/:id/status', authenticateToken, requireRole('admin'), async (req, res, next) => {
  try {
    const { is_active } = req.body;
    if (is_active === undefined) {
      throw ApiError.badRequest('is_active boolean is required.');
    }

    const [existing] = await pool.query('SELECT id FROM campus_locations WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      throw ApiError.notFound('Campus location not found.');
    }

    await pool.query('UPDATE campus_locations SET is_active = ? WHERE id = ?', [Boolean(is_active), req.params.id]);

    res.status(200).json({
      success: true,
      message: `Location ${is_active ? 'activated' : 'deactivated'} successfully.`,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/locations/:id - Admin only: Soft-deactivate or delete
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res, next) => {
  try {
    const [existing] = await pool.query('SELECT id FROM campus_locations WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      throw ApiError.notFound('Campus location not found.');
    }

    // Soft-delete to preserve foreign key integrity with lost_found_items
    await pool.query('UPDATE campus_locations SET is_active = FALSE WHERE id = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Campus location deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
