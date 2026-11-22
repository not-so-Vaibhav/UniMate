import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole, requireOperatorService } from '../middleware/roleMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = Router();

// ==========================================
// 1. MENU ENDPOINTS
// ==========================================

// GET /api/v1/canteen/menu - Accessible to all authenticated users
router.get('/menu', authenticateToken, async (req, res, next) => {
  try {
    const { category, search, availableOnly } = req.query;
    let query = `SELECT id, name, category, price, description, is_available, created_at, updated_at 
                 FROM canteen_menu_items WHERE 1=1`;
    const params = [];

    if (availableOnly === 'true') {
      query += ` AND is_available = TRUE`;
    }

    if (category && typeof category === 'string' && category !== 'All') {
      query += ` AND LOWER(category) = LOWER(?)`;
      params.push(category.trim());
    }

    if (search && typeof search === 'string' && search.trim()) {
      query += ` AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))`;
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    query += ` ORDER BY category, name ASC`;

    const [items] = await pool.query(query, params);

    // Get categories list
    const [categories] = await pool.query(
      `SELECT DISTINCT category FROM canteen_menu_items ORDER BY category ASC`
    );

    res.status(200).json({
      success: true,
      data: {
        menuItems: items,
        categories: ['All', ...categories.map((c) => c.category)],
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/canteen/menu - Operator or Admin: Add Menu Item
router.post(
  '/menu',
  authenticateToken,
  requireRole('operator', 'admin'),
  requireOperatorService('canteen'),
  async (req, res, next) => {
    try {
      const { name, category, price, description, is_available } = req.body;

      if (!name || !category || price === undefined || price === null) {
        throw ApiError.badRequest('Name, category, and price are required.');
      }

      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        throw ApiError.badRequest('Price must be a valid non-negative number.');
      }

      const [result] = await pool.query(
        `INSERT INTO canteen_menu_items (name, category, price, description, is_available)
         VALUES (?, ?, ?, ?, ?)`,
        [name.trim(), category.trim().toLowerCase(), numPrice, description?.trim() || null, is_available !== undefined ? Boolean(is_available) : true]
      );

      const [created] = await pool.query('SELECT * FROM canteen_menu_items WHERE id = ?', [result.insertId]);

      res.status(201).json({
        success: true,
        message: 'Menu item created successfully.',
        data: { menuItem: created[0] },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/canteen/menu/:id - Operator or Admin: Update Menu Item
router.put(
  '/menu/:id',
  authenticateToken,
  requireRole('operator', 'admin'),
  requireOperatorService('canteen'),
  async (req, res, next) => {
    try {
      const { name, category, price, description, is_available } = req.body;

      const [existing] = await pool.query('SELECT id FROM canteen_menu_items WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        throw ApiError.notFound('Menu item not found.');
      }

      let numPrice = null;
      if (price !== undefined && price !== null) {
        numPrice = Number(price);
        if (isNaN(numPrice) || numPrice < 0) {
          throw ApiError.badRequest('Price must be a valid non-negative number.');
        }
      }

      await pool.query(
        `UPDATE canteen_menu_items
         SET name = COALESCE(?, name),
             category = COALESCE(?, category),
             price = COALESCE(?, price),
             description = COALESCE(?, description),
             is_available = COALESCE(?, is_available)
         WHERE id = ?`,
        [
          name?.trim(),
          category?.trim().toLowerCase(),
          numPrice,
          description?.trim(),
          is_available !== undefined ? Boolean(is_available) : null,
          req.params.id,
        ]
      );

      const [updated] = await pool.query('SELECT * FROM canteen_menu_items WHERE id = ?', [req.params.id]);

      res.status(200).json({
        success: true,
        message: 'Menu item updated successfully.',
        data: { menuItem: updated[0] },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/canteen/menu/:id/availability - Toggle availability
router.patch(
  '/menu/:id/availability',
  authenticateToken,
  requireRole('operator', 'admin'),
  requireOperatorService('canteen'),
  async (req, res, next) => {
    try {
      const { is_available } = req.body;
      if (is_available === undefined) {
        throw ApiError.badRequest('is_available boolean is required.');
      }

      const [existing] = await pool.query('SELECT id FROM canteen_menu_items WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        throw ApiError.notFound('Menu item not found.');
      }

      await pool.query('UPDATE canteen_menu_items SET is_available = ? WHERE id = ?', [Boolean(is_available), req.params.id]);

      res.status(200).json({
        success: true,
        message: `Menu item availability updated to ${Boolean(is_available)}.`,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 2. ORDER PLACEMENT (STUDENT WORKFLOW)
// ==========================================

// Helper: Generate unique order reference
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${seq}${rand}`;
}

// POST /api/v1/canteen/orders - Create Order (Database Transaction, Server-Side Pricing)
router.post('/orders', authenticateToken, async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { items, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw ApiError.badRequest('Order must contain at least one item.');
    }

    // Validate quantities
    for (const item of items) {
      if (!item.menuItemId || !item.quantity || parseInt(item.quantity, 10) <= 0) {
        throw ApiError.badRequest('Every order item must have a valid menuItemId and quantity > 0.');
      }
    }

    await connection.beginTransaction();

    // Query all requested items from DB to enforce verified server-side prices and availability
    const itemIds = items.map((i) => i.menuItemId);
    const [dbItems] = await connection.query(
      `SELECT id, name, price, is_available FROM canteen_menu_items WHERE id IN (?)`,
      [itemIds]
    );

    const dbItemMap = new Map();
    dbItems.forEach((d) => dbItemMap.set(d.id, d));

    let calculatedTotal = 0;
    const orderItemsToInsert = [];

    for (const requested of items) {
      const dbItem = dbItemMap.get(requested.menuItemId);
      if (!dbItem) {
        throw ApiError.badRequest(`Menu item with ID ${requested.menuItemId} does not exist.`);
      }
      if (!dbItem.is_available) {
        throw ApiError.badRequest(`'${dbItem.name}' is currently marked unavailable by the canteen operator.`);
      }

      const qty = parseInt(requested.quantity, 10);
      const unitPrice = Number(dbItem.price);
      const subtotal = unitPrice * qty;
      calculatedTotal += subtotal;

      orderItemsToInsert.push({
        menu_item_id: dbItem.id,
        item_name: dbItem.name,
        quantity: qty,
        unit_price: unitPrice,
        subtotal: subtotal,
      });
    }

    // Insert Order
    const orderNumber = generateOrderNumber();
    const [orderResult] = await connection.query(
      `INSERT INTO canteen_orders (order_number, user_id, status, total_amount, notes)
       VALUES (?, ?, 'placed', ?, ?)`,
      [orderNumber, req.user.id, calculatedTotal, notes?.trim() || null]
    );
    const orderId = orderResult.insertId;

    // Insert Order Items
    for (const oi of orderItemsToInsert) {
      await connection.query(
        `INSERT INTO canteen_order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, oi.menu_item_id, oi.item_name, oi.quantity, oi.unit_price, oi.subtotal]
      );
    }

    // Record initial status history
    await connection.query(
      `INSERT INTO status_history (entity_type, entity_id, previous_status, new_status, changed_by_user_id, comment)
       VALUES ('canteen_order', ?, NULL, 'placed', ?, 'Order placed by student')`,
      [orderId, req.user.id]
    );

    await connection.commit();

    // Fetch full created order with items using the active transaction connection
    const [createdOrder] = await connection.query(
      `SELECT id, order_number, user_id, status, total_amount, notes, created_at FROM canteen_orders WHERE id = ?`,
      [orderId]
    );
    const [createdItems] = await connection.query(
      `SELECT id, menu_item_id, item_name, quantity, unit_price, subtotal FROM canteen_order_items WHERE order_id = ?`,
      [orderId]
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: {
        order: {
          ...createdOrder[0],
          items: createdItems,
        },
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

// GET /api/v1/canteen/orders - Get Student's Order History
router.get('/orders', authenticateToken, async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT id, order_number, user_id, status, total_amount, notes, created_at, updated_at
       FROM canteen_orders
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    // Attach items to each order
    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const [allItems] = await pool.query(
        `SELECT id, order_id, menu_item_id, item_name, quantity, unit_price, subtotal 
         FROM canteen_order_items 
         WHERE order_id IN (?)`,
        [orderIds]
      );

      const itemsByOrderId = new Map();
      allItems.forEach((it) => {
        if (!itemsByOrderId.has(it.order_id)) {
          itemsByOrderId.set(it.order_id, []);
        }
        itemsByOrderId.get(it.order_id).push(it);
      });

      orders.forEach((o) => {
        o.items = itemsByOrderId.get(o.id) || [];
      });
    }

    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/canteen/orders/:id - Get Order Details (Ownership Enforced)
router.get('/orders/:id', authenticateToken, async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT id, order_number, user_id, status, total_amount, notes, created_at, updated_at
       FROM canteen_orders WHERE id = ?`,
      [req.params.id]
    );

    if (orders.length === 0) {
      throw ApiError.notFound('Order not found.');
    }

    const order = orders[0];
    const isOwner = order.user_id === req.user.id;
    const isAuthorizedOperator = req.user.role === 'admin' || (req.user.role === 'operator' && req.user.operator_service === 'canteen');

    if (!isOwner && !isAuthorizedOperator) {
      throw ApiError.forbidden('You do not have permission to view this order.');
    }

    const [items] = await pool.query(
      `SELECT id, menu_item_id, item_name, quantity, unit_price, subtotal FROM canteen_order_items WHERE order_id = ?`,
      [order.id]
    );
    order.items = items;

    // Get status history
    const [history] = await pool.query(
      `SELECT id, previous_status, new_status, comment, created_at 
       FROM status_history 
       WHERE entity_type = 'canteen_order' AND entity_id = ? 
       ORDER BY created_at ASC`,
      [order.id]
    );
    order.statusHistory = history;

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/canteen/orders/:id/cancel - Student Cancel Order (Allowed only when status == 'placed')
router.patch('/orders/:id/cancel', authenticateToken, async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT id, user_id, status FROM canteen_orders WHERE id = ?`,
      [req.params.id]
    );

    if (orders.length === 0) {
      throw ApiError.notFound('Order not found.');
    }

    const order = orders[0];
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      throw ApiError.forbidden('You can only cancel your own orders.');
    }

    if (order.status !== 'placed') {
      throw ApiError.badRequest(
        `Order cannot be cancelled because it is already '${order.status}'. Cancellation is only permitted while status is 'placed'.`
      );
    }

    await pool.query(`UPDATE canteen_orders SET status = 'cancelled' WHERE id = ?`, [order.id]);

    await pool.query(
      `INSERT INTO status_history (entity_type, entity_id, previous_status, new_status, changed_by_user_id, comment)
       VALUES ('canteen_order', ?, 'placed', 'cancelled', ?, 'Cancelled by student')`,
      [order.id, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Order has been successfully cancelled.',
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. CANTEEN OPERATOR QUEUE & WORKFLOWS
// ==========================================

// GET /api/v1/canteen/operator/orders - Operator Queue with filtering
router.get(
  '/operator/orders',
  authenticateToken,
  requireRole('operator', 'admin'),
  requireOperatorService('canteen'),
  async (req, res, next) => {
    try {
      const { status } = req.query;
      let query = `
        SELECT o.id, o.order_number, o.user_id, o.status, o.total_amount, o.notes, o.created_at, o.updated_at,
               u.full_name as student_name, u.student_id, u.email as student_email
        FROM canteen_orders o
        JOIN users u ON o.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (status && status !== 'all') {
        query += ` AND o.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY o.created_at DESC LIMIT 100`;

      const [orders] = await pool.query(query, params);

      // Attach items
      if (orders.length > 0) {
        const orderIds = orders.map((o) => o.id);
        const [items] = await pool.query(
          `SELECT id, order_id, menu_item_id, item_name, quantity, unit_price, subtotal 
           FROM canteen_order_items WHERE order_id IN (?)`,
          [orderIds]
        );
        const itemMap = new Map();
        items.forEach((it) => {
          if (!itemMap.has(it.order_id)) itemMap.set(it.order_id, []);
          itemMap.get(it.order_id).push(it);
        });
        orders.forEach((o) => {
          o.items = itemMap.get(o.id) || [];
        });
      }

      res.status(200).json({
        success: true,
        data: {
          operatorService: 'canteen',
          total: orders.length,
          orders,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Backward-compatible alias for existing queue tests
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

// PATCH /api/v1/canteen/operator/orders/:id/status - Update Order Status
router.patch(
  '/operator/orders/:id/status',
  authenticateToken,
  requireRole('operator', 'admin'),
  requireOperatorService('canteen'),
  async (req, res, next) => {
    try {
      const { status, comment } = req.body;
      const validStatuses = ['placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled', 'rejected'];

      if (!status || !validStatuses.includes(status)) {
        throw ApiError.badRequest(`Invalid order status. Must be one of [${validStatuses.join(', ')}].`);
      }

      const [existing] = await pool.query('SELECT id, status FROM canteen_orders WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        throw ApiError.notFound('Canteen order not found.');
      }

      const prevStatus = existing[0].status;

      // Validate logical state transitions
      if (prevStatus === 'completed' || prevStatus === 'cancelled' || prevStatus === 'rejected') {
        throw ApiError.badRequest(`Cannot modify order because it is already in terminal state '${prevStatus}'.`);
      }

      await pool.query('UPDATE canteen_orders SET status = ? WHERE id = ?', [status, req.params.id]);

      // Record audit history
      await pool.query(
        `INSERT INTO status_history (entity_type, entity_id, previous_status, new_status, changed_by_user_id, comment)
         VALUES ('canteen_order', ?, ?, ?, ?, ?)`,
        [req.params.id, prevStatus, status, req.user.id, comment?.trim() || `Status updated to ${status} by operator`]
      );

      res.status(200).json({
        success: true,
        message: `Order status updated to '${status}'.`,
        data: {
          orderId: req.params.id,
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
