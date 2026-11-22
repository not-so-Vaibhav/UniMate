import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole, requireOperatorService } from '../middleware/roleMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = Router();

// GET /api/v1/canteen/menu - Accessible to all authenticated users
router.get('/menu', authenticateToken, async (req, res, next) => {
  try {
    const [items] = await pool.query(
      `SELECT id, name, category, price, description, is_available FROM canteen_menu_items ORDER BY category, name`
    );
    res.status(200).json({
      success: true,
      data: { menuItems: items },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/canteen/operator/queue - Canteen Operator or Admin oversight ONLY
router.get(
  '/operator/queue',
  authenticateToken,
  requireRole('operator', 'admin'),
  requireOperatorService('canteen'),
  async (req, res, next) => {
    try {
      const [orders] = await pool.query(
        `SELECT id, order_number, user_id, status, total_amount, notes, created_at
         FROM canteen_orders
         ORDER BY created_at DESC
         LIMIT 50`
      );
      res.status(200).json({
        success: true,
        data: {
          operatorService: 'canteen',
          queueCount: orders.length,
          orders,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/canteen/operator/orders/:id/status - Canteen Operator or Admin oversight ONLY
router.patch(
  '/operator/orders/:id/status',
  authenticateToken,
  requireRole('operator', 'admin'),
  requireOperatorService('canteen'),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const validStatuses = ['placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        throw ApiError.badRequest(`Invalid order status. Must be one of [${validStatuses.join(', ')}].`);
      }

      const [existing] = await pool.query('SELECT id, status FROM canteen_orders WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        throw ApiError.notFound('Canteen order not found.');
      }

      await pool.query('UPDATE canteen_orders SET status = ? WHERE id = ?', [status, req.params.id]);

      // Record audit history
      await pool.query(
        `INSERT INTO status_history (entity_type, entity_id, previous_status, new_status, changed_by_user_id)
         VALUES ('canteen_order', ?, ?, ?, ?)`,
        [req.params.id, existing[0].status, status, req.user.id]
      );

      res.status(200).json({
        success: true,
        message: `Order status updated to '${status}'.`,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
