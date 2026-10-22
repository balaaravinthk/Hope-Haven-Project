import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { User, UserRoles } from '../models/User.js';
import { Orphanage, VerificationStatus } from '../models/Orphanage.js';
import { comparePassword, generateTokens } from '../services/authService.js';
import { ALLOWED_ADMINS } from '../config/seedAdmins.js';

const ALLOWED_ADMIN_EMAILS = ALLOWED_ADMINS.map((a) => a.email.toLowerCase());

/**
 * Admin Login - strictly restricted to the 4 designated admin accounts
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Admin email and password are required.', null, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if the provided email is one of the 4 designated admin accounts
    if (!ALLOWED_ADMIN_EMAILS.includes(normalizedEmail)) {
      return sendError(
        res,
        'Access denied. This email is not authorized for administrative access.',
        null,
        403
      );
    }

    // Locate admin user in DB
    const adminUser = await User.findOne({ email: normalizedEmail });
    if (!adminUser) {
      return sendError(res, 'Admin user account not found.', null, 404);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, adminUser.password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid admin password.', null, 401);
    }

    // Issue admin tokens
    const tokens = generateTokens({
      id: adminUser._id.toString(),
      email: adminUser.email,
      role: UserRoles.SUPER_ADMIN,
    });

    const userResponse = adminUser.toJSON ? adminUser.toJSON() : adminUser.toObject();
    delete userResponse.password;

    return sendSuccess(res, 'Admin login successful', {
      user: {
        ...userResponse,
        role: UserRoles.SUPER_ADMIN,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregate statistics for registered orphanages
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Orphanage.countDocuments(),
      Orphanage.countDocuments({ verificationStatus: VerificationStatus.PENDING }),
      Orphanage.countDocuments({ verificationStatus: VerificationStatus.APPROVED }),
      Orphanage.countDocuments({ verificationStatus: VerificationStatus.REJECTED }),
    ]);

    return sendSuccess(res, 'Admin stats retrieved successfully', {
      total,
      pending,
      approved,
      rejected,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all registered orphanages with optional status filtering and search
 */
export const getAllOrphanages = async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const filter = {};

    if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
      filter.verificationStatus = status;
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { registrationNumber: searchRegex },
        { city: searchRegex },
        { authorizedPerson: searchRegex },
        { contact: searchRegex },
      ];
    }

    const orphanages = await Orphanage.find(filter)
      .populate('userId', 'name email phone createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 'Registered orphanages retrieved successfully', orphanages);
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed information for a single orphanage
 */
export const getOrphanageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orphanage = await Orphanage.findById(id).populate('userId', 'name email phone');

    if (!orphanage) {
      return sendError(res, 'Orphanage record not found', null, 404);
    }

    return sendSuccess(res, 'Orphanage record retrieved successfully', orphanage);
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or Reject an orphanage registration
 */
export const updateOrphanageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || ![VerificationStatus.APPROVED, VerificationStatus.REJECTED, VerificationStatus.PENDING].includes(status)) {
      return sendError(
        res,
        `Invalid status. Status must be one of: ${Object.values(VerificationStatus).join(', ')}`,
        null,
        400
      );
    }

    const orphanage = await Orphanage.findById(id);
    if (!orphanage) {
      return sendError(res, 'Orphanage not found', null, 404);
    }

    orphanage.verificationStatus = status;
    orphanage.verifiedBadge = status === VerificationStatus.APPROVED;

    await orphanage.save();

    const actionText =
      status === VerificationStatus.APPROVED
        ? 'approved'
        : status === VerificationStatus.REJECTED
        ? 'rejected / cancelled'
        : 'reset to pending';

    return sendSuccess(res, `Orphanage has been ${actionText} successfully`, orphanage);
  } catch (error) {
    next(error);
  }
};
