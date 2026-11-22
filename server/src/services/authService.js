import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { env } from '../config/env.js';
import { ApiError } from '../middleware/errorMiddleware.js';

export class AuthService {
  /**
   * Authenticate user credentials and return sanitized user + JWT
   */
  static async login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.query(
      `SELECT id, email, password_hash, full_name, role, operator_service, student_id, phone, is_active
       FROM users WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const user = users[0];

    if (!user.is_active) {
      throw ApiError.unauthorized('This account has been deactivated. Please contact campus admin.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        operatorService: user.operator_service,
      },
      env.JWT.SECRET,
      { expiresIn: env.JWT.EXPIRES_IN }
    );

    // Sanitize user object (exclude sensitive password_hash)
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      operatorService: user.operator_service,
      studentId: user.student_id,
      phone: user.phone,
    };

    return { user: sanitizedUser, token };
  }

  /**
   * Register a new student account
   */
  static async register({ email, password, full_name, student_id = null, phone = null }) {
    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert new student user
    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, student_id, phone)
       VALUES (?, ?, ?, 'student', ?, ?)`,
      [normalizedEmail, passwordHash, full_name.trim(), student_id ? student_id.trim() : null, phone ? phone.trim() : null]
    );

    const newUserId = result.insertId;

    const token = jwt.sign(
      {
        userId: newUserId,
        email: normalizedEmail,
        role: 'student',
        operatorService: null,
      },
      env.JWT.SECRET,
      { expiresIn: env.JWT.EXPIRES_IN }
    );

    const sanitizedUser = {
      id: newUserId,
      email: normalizedEmail,
      fullName: full_name.trim(),
      role: 'student',
      operatorService: null,
      studentId: student_id ? student_id.trim() : null,
      phone: phone ? phone.trim() : null,
    };

    return { user: sanitizedUser, token };
  }

  /**
   * Get user by ID (sanitized)
   */
  static async getUserById(userId) {
    const [users] = await pool.query(
      `SELECT id, email, full_name, role, operator_service, student_id, phone, is_active, created_at
       FROM users WHERE id = ?`,
      [userId]
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
