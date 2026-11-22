import { AuthService } from '../services/authService.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Sign in successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const result = await AuthService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to UniMate.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await AuthService.getUserById(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  // In JWT client-managed session, the client discards the token.
  // This endpoint provides explicit backend confirmation and status for logging.
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}
