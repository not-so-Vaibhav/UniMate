import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/v1/locations - Accessible to all authenticated users
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = `SELECT id, name, code, category, building, floor, description FROM campus_locations WHERE is_active = TRUE`;
    const params = [];

    if (category && typeof category === 'string' && category !== 'All') {
      query += ` AND category = ?`;
      params.push(category.toLowerCase());
    }

    if (search && typeof search === 'string') {
      query += ` AND (name LIKE ? OR building LIKE ? OR code LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY name ASC`;

    const [locations] = await pool.query(query, params);
    res.status(200).json({
      success: true,
      data: { locations },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
