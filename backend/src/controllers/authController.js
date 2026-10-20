import path from 'path';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { hashPassword, comparePassword, generateTokens } from '../services/authService.js';
import { initiateAadhaarKyc, verifyAadhaarOtp } from '../services/kycService.js';
import { User, UserRoles } from '../models/User.js';
import { Orphanage, OrphanageTypes, VerificationStatus } from '../models/Orphanage.js';

/**
 * Register a new user:
 * - Supporter (Donor / Volunteer)
 * - Orphanage (with institutional details & multipart file uploads for buildingPhoto & registrationDoc)
 */
export const register = async (req, res, next) => {
  try {
    const role = req.body.role || UserRoles.SUPPORTER;

    // ----------------------------------------------------
    // Case 1: Orphanage Institutional Registration
    // ----------------------------------------------------
    if (role === UserRoles.ORPHANAGE_ADMIN || role === 'orphanage') {
      const orgName = (req.body.organizationName || req.body.name || '').trim();
      const orgEmail = (req.body.orgEmail || req.body.email || '').toLowerCase().trim();
      const password = req.body.password;
      const contact = (req.body.contactNumber || req.body.phone || req.body.contact || '').trim();
      const address = (req.body.address || '').trim();
      const registrationNumber = (req.body.registrationNumber || '').trim();
      const pan = (req.body.panNumber || req.body.pan || '').trim().toUpperCase();
      const cciJj = (req.body.cciJjNumber || req.body.cciJj || '').trim();
      const authorizedPerson = (req.body.authorizedPersonName || req.body.authorizedPerson || orgName).trim();
      const aadhaarRaw = (req.body.aadhaarNumber || '').replace(/\s/g, '');
      const isAadhaarVerified = req.body.aadhaarVerified === true || req.body.aadhaarVerified === 'true';

      if (!orgName || !orgEmail || !password) {
        return sendError(res, 'Organization name, official email, and password are required.', null, 400);
      }

      if (password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters long.', null, 400);
      }

      // Check user and orphanage email uniqueness
      const existingUser = await User.findOne({ email: orgEmail });
      if (existingUser) {
        return sendError(res, 'An account with this email address already exists.', null, 409);
      }

      const existingOrphanage = await Orphanage.findOne({ email: orgEmail });
      if (existingOrphanage) {
        return sendError(res, 'An orphanage with this official email is already registered.', null, 409);
      }

      // Extract uploaded files: buildingPhoto and registrationDoc(s)
      const photoFile =
        req.files?.buildingPhoto?.[0] ||
        req.files?.frontPicture?.[0] ||
        req.files?.photo?.[0];

      const docFiles = [
        ...(req.files?.registrationDoc || []),
        ...(req.files?.documents || []),
        ...(req.files?.registrationCertificate || []),
        ...(req.files?.idProof || []),
        ...(req.files?.addressProof || []),
      ];

      // Formulate web-accessible URL paths
      const buildingPhotoPath = photoFile
        ? `/uploads/${photoFile.destination.includes('photos') ? 'photos/' : ''}${photoFile.filename}`
        : null;

      const registrationDocPaths = docFiles.map(
        (f) => `/uploads/${f.destination.includes('documents') ? 'documents/' : ''}${f.filename}`
      );

      // Mask Aadhaar for privacy compliance
      const aadhaarMasked = aadhaarRaw.length >= 4
        ? `XXXX XXXX ${aadhaarRaw.slice(-4)}`
        : 'XXXX XXXX 1234';

      // 1. Create Auth User account for Orphanage Admin
      const hashedPassword = await hashPassword(password);
      const newUser = await User.create({
        name: orgName,
        email: orgEmail,
        password: hashedPassword,
        role: UserRoles.ORPHANAGE_ADMIN,
        phone: contact || null,
      });

      // 2. Create Orphanage institution record with saved file paths
      const newOrphanage = await Orphanage.create({
        userId: newUser._id,
        name: orgName,
        type: req.body.organizationType || req.body.type || "Children's Home / CCI",
        address: address || "Not provided",
        city: req.body.city?.trim() || "",
        state: req.body.state?.trim() || "",
        pincode: req.body.pincode?.trim() || "",
        contact: contact || "Not provided",
        email: orgEmail,
        registrationNumber: registrationNumber || `REG-${Date.now()}`,
        pan: pan || "AAATH1234F",
        cciJj: cciJj || "JJ-ACT-PENDING",
        authorizedPerson: authorizedPerson || orgName,
        aadhaarNumberMasked: aadhaarMasked,
        aadhaarVerified: isAadhaarVerified,
        verificationStatus: VerificationStatus.PENDING,
        photoPreview: buildingPhotoPath,
        documents: registrationDocPaths,
        verifiedBadge: false,
      });

      // Issue JWT tokens
      const tokens = generateTokens({
        id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      const userResponse = newUser.toJSON ? newUser.toJSON() : newUser.toObject();
      delete userResponse.password;

      return sendSuccess(
        res,
        'Orphanage registered successfully and submitted for verification',
        {
          user: userResponse,
          orphanage: newOrphanage,
          ...tokens,
        },
        201
      );
    }

    // ----------------------------------------------------
    // Case 2: Supporter / Donor / Volunteer Registration
    // ----------------------------------------------------
    const { name, email, password, phone } = req.body;

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

    // Validate role
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
