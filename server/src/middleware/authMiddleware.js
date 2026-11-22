import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import pool from '../config/db.js';
import { ApiError } from './errorMiddleware.js';

/**
 * Authentication Middleware
 * Validates JWT in Authorization: Bearer <token>
 * Attaches sanitized user record to req.user
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing or invalid format.');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT.SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Session has expired. Please sign in again.');
      }
      throw ApiError.unauthorized('Invalid authentication token.');
    }

    // Verify user still exists and is active in database
    const [rows] = await pool.query(
      'SELECT id, email, full_name, role, operator_service, student_id, phone, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0 || !rows[0].is_active) {
      throw ApiError.unauthorized('User account is invalid or deactivated.');
    }

    req.user = rows[0];
    next();
  } catch (error) {
    next(error);
  }
}
