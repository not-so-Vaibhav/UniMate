import { UserService } from '../services/userService.js';

export async function getProfile(req, res, next) {
  try {
    const profile = await UserService.getUserProfile(req.user.id, req.user);
    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const targetUserId = req.params.id;
    const profile = await UserService.getUserProfile(targetUserId, req.user);
    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req, res, next) {
  try {
    const result = await UserService.listUsers(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
