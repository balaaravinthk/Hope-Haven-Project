import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { hashPassword, comparePassword, generateTokens } from '../services/authService.js';
import { initiateAadhaarKyc, verifyAadhaarOtp } from '../services/kycService.js';
import { User, UserRoles } from '../models/User.js';

/**
 * Register a new user (Donor / Supporter, Orphanage Admin, or Platform Admin)
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required.', null, 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long.', null, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check email uniqueness in MongoDB
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', null, 409);
    }

    // Role validation
    const validRoles = Object.values(UserRoles);
    const userRole = role && validRoles.includes(role) ? role : UserRoles.SUPPORTER;

    // Hash password with bcryptjs
    const hashedPassword = await hashPassword(password);

    // Persist new user in MongoDB
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
      phone: phone ? phone.trim() : null,
    });

    // Issue JWT access and refresh tokens
    const tokens = generateTokens({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    const userResponse = newUser.toJSON ? newUser.toJSON() : newUser.toObject();
    delete userResponse.password;

    return sendSuccess(
      res,
      'User registered successfully',
      {
        user: userResponse,
        ...tokens,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user with email, password, and role verification
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required.', null, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return sendError(res, 'Invalid email or password.', null, 401);
    }

    // Compare provided password with bcryptjs hashed password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password.', null, 401);
    }

    // Verify role if a specific role login was requested/expected
    if (role && user.role !== role) {
      return sendError(
        res,
        `Access denied. This account is registered as '${user.role}', but '${role}' login was requested.`,
        null,
        403
      );
    }

    // Issue JWT access and refresh tokens
    const tokens = generateTokens({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userResponse = user.toJSON ? user.toJSON() : user.toObject();
    delete userResponse.password;

    return sendSuccess(res, 'Login successful', {
      user: userResponse,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send simulated Aadhaar OTP for institutional KYC verification
 */
export const requestAadhaarOtp = async (req, res, next) => {
  try {
    const { aadhaarNumber, mobile } = req.body;
    const result = initiateAadhaarKyc(aadhaarNumber, mobile);
    return sendSuccess(res, result.message, result);
  } catch (error) {
    return sendError(res, error.message, null, 400);
  }
};

/**
 * Verify Aadhaar OTP for institutional KYC
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { aadhaarNumber, otp } = req.body;
    verifyAadhaarOtp(aadhaarNumber, otp);
    return sendSuccess(res, 'Aadhaar verified successfully via OTP', { verified: true });
  } catch (error) {
    return sendError(res, error.message, null, 400);
  }
};

/**
 * Get profile for authenticated user
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Not authenticated.', null, 401);
    }

    // Return the authenticated user (populated by authMiddleware)
    const userResponse = req.user.toJSON ? req.user.toJSON() : req.user;
    if (userResponse.password) {
      delete userResponse.password;
    }

    return sendSuccess(res, 'Current user profile retrieved', { user: userResponse });
  } catch (error) {
    next(error);
  }
};
