import pool from '../config/db.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { assertOwnershipOrAdmin } from '../middleware/roleMiddleware.js';

export class UserService {
  /**
   * List users with pagination and filtering (Admin only)
   */
  static async listUsers({ role, search, page = 1, limit = 20 }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));

    let query = `
      SELECT id, email, full_name, role, operator_service, student_id, phone, is_active, created_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (role && ['student', 'operator', 'admin'].includes(role)) {
      query += ` AND role = ?`;
      params.push(role);
    }

    if (search && typeof search === 'string') {
      query += ` AND (full_name LIKE ? OR email LIKE ? OR student_id LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(safeLimit, offset);

    const [rows] = await pool.query(query, params);

    // Count total matching
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const countParams = [];
    if (role && ['student', 'operator', 'admin'].includes(role)) {
      countQuery += ` AND role = ?`;
      countParams.push(role);
    }
    if (search && typeof search === 'string') {
      countQuery += ` AND (full_name LIKE ? OR email LIKE ? OR student_id LIKE ?)`;
      const term = `%${search.trim()}%`;
      countParams.push(term, term, term);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      users: rows.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        operatorService: u.operator_service,
        studentId: u.student_id,
        phone: u.phone,
        isActive: Boolean(u.is_active),
        createdAt: u.created_at,
      })),
      pagination: {
        page: parseInt(page, 10),
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  /**
   * Get single user with ownership enforcement
   */
  static async getUserProfile(targetUserId, currentUser) {
    if (!assertOwnershipOrAdmin(targetUserId, currentUser)) {
      throw ApiError.forbidden('You do not have permission to view this profile.');
    }

    const [users] = await pool.query(
      `SELECT id, email, full_name, role, operator_service, student_id, phone, is_active, created_at
       FROM users WHERE id = ?`,
      [targetUserId]
    );

    if (users.length === 0) {
      throw ApiError.notFound('User not found.');
    }

    const u = users[0];
    return {
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      role: u.role,
      operatorService: u.operator_service,
      studentId: u.student_id,
      phone: u.phone,
      isActive: Boolean(u.is_active),
      createdAt: u.created_at,
    };
  }
}
