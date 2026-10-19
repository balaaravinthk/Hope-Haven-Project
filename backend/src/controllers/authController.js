import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { hashPassword, comparePassword, generateTokens } from '../services/authService.js';
import { initiateAadhaarKyc, verifyAadhaarOtp } from '../services/kycService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required.', null, 400);
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role || 'supporter';

    // Placeholder response until integrated with persistent DB
    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email,
      role: userRole,
      createdAt: new Date().toISOString(),
    };

    const tokens = generateTokens({ id: newUser.id, email: newUser.email, role: newUser.role });

    return sendSuccess(res, 'User registered successfully', { user: newUser, ...tokens }, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return sendError(res, 'Email and password are required.', null, 400);
    }

    // Role-aware login authentication placeholder
    const user = {
      id: 'usr_demo_101',
      name: role === 'orphanage' ? 'Hope Children Home Admin' : 'Demo Supporter',
      email,
      role: role || 'supporter',
    };

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

    return sendSuccess(res, 'Login successful', { user, ...tokens });
  } catch (error) {
    next(error);
  }
};

export const requestAadhaarOtp = async (req, res, next) => {
  try {
    const { aadhaarNumber, mobile } = req.body;
    const result = initiateAadhaarKyc(aadhaarNumber, mobile);
    return sendSuccess(res, result.message, result);
  } catch (error) {
    return sendError(res, error.message, null, 400);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { aadhaarNumber, otp } = req.body;
    verifyAadhaarOtp(aadhaarNumber, otp);
    return sendSuccess(res, 'Aadhaar verified successfully via OTP', { verified: true });
  } catch (error) {
    return sendError(res, error.message, null, 400);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Current user profile retrieved', { user: req.user });
  } catch (error) {
    next(error);
  }
};
