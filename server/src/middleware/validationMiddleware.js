import { ApiError } from './errorMiddleware.js';

/**
 * Simple, robust input validation helpers without extra dependencies
 */

export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push({ field: 'email', message: 'Email address is required.' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push({ field: 'email', message: 'Invalid email address format.' });
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required.' });
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest('Validation failed.', errors));
  }

  next();
}

export function validateRegister(req, res, next) {
  const { email, password, full_name, student_id } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push({ field: 'email', message: 'Email is required.' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push({ field: 'email', message: 'Invalid email address format.' });
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required.' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long.' });
  }

  if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
    errors.push({ field: 'full_name', message: 'Full name is required (minimum 2 characters).' });
  }

  if (student_id && typeof student_id !== 'string') {
    errors.push({ field: 'student_id', message: 'Student ID must be a string.' });
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest('Validation failed.', errors));
  }

  next();
}
