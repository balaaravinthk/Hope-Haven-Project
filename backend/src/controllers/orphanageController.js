import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { Orphanage, VerificationStatus } from '../models/Orphanage.js';
import { Requirement } from '../models/Requirement.js';

/**
 * Register a new orphanage directly
 */
export const registerOrphanage = async (req, res, next) => {
  try {
    const {
      name,
      type,
      address,
      contact,
      email,
      registrationNumber,
      pan,
      cciJj,
      authorizedPerson,
      aadhaarNumber,
    } = req.body;

    const photo = req.files?.photo ? `/uploads/photos/${req.files.photo[0].filename}` : null;
    const documents = req.files?.documents
      ? req.files.documents.map((f) => `/uploads/documents/${f.filename}`)
      : [];

    const orphanageProfile = await Orphanage.create({
      userId: req.user?._id || null,
      name,
      type,
      address,
      contact,
      email,
      registrationNumber,
      pan: (pan || '').toUpperCase(),
      cciJj,
      authorizedPerson,
      aadhaarNumberMasked: aadhaarNumber ? `XXXX XXXX ${aadhaarNumber.slice(-4)}` : 'XXXX XXXX 1234',
      verificationStatus: VerificationStatus.PENDING,
      photoPreview: photo,
      documents,
    });

    return sendSuccess(
      res,
      'Orphanage submitted for verification successfully',
      orphanageProfile,
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orphanages/me & GET /api/orphanages/profile
 * Retrieves active institutional profile for the logged-in orphanage admin
 */
export const getProfile = async (req, res, next) => {
  try {
    let orphanage = null;

    // 1. Try finding by logged in user account ID
    if (req.user?._id || req.user?.id) {
      orphanage = await Orphanage.findOne({ userId: req.user._id || req.user.id });
    }

    // 2. Try finding by logged in user email
    if (!orphanage && req.user?.email) {
      orphanage = await Orphanage.findOne({ email: req.user.email });
    }

    // 3. If query param specified (e.g. ?id=...)
    if (!orphanage && req.query.id) {
      orphanage = await Orphanage.findById(req.query.id);
    }

    // 4. If logged in but no orphanage profile exists yet, create one tied to this real user
    if (!orphanage && req.user) {
      orphanage = await Orphanage.create({
        userId: req.user._id,
        name: req.user.name || "My Organization",
        type: "Children's Home / CCI",
        address: "Address pending registration",
        contact: req.user.phone || "+91 00000 00000",
        email: req.user.email,
        registrationNumber: `PENDING-${Date.now().toString().slice(-6)}`,
        pan: "PENDING000",
        cciJj: "PENDING",
        authorizedPerson: req.user.name || "Authorized Representative",
        aadhaarNumberMasked: "XXXX XXXX 0000",
        verificationStatus: VerificationStatus.PENDING,
        verifiedBadge: false,
        documents: [],
      });
    }

    // 5. Fallback for public viewing when no user logged in
    if (!orphanage) {
      orphanage = await Orphanage.findOne();
    }

    if (!orphanage) {
      return sendError(res, 'No orphanage profile found', null, 404);
    }

    return sendSuccess(res, 'Profile fetched successfully', orphanage);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orphanages/me & PUT /api/orphanages/profile
 * Updates institutional profile information
 */
export const updateProfile = async (req, res, next) => {
  try {
    let orphanage = null;

    if (req.user?._id || req.user?.id) {
      orphanage = await Orphanage.findOne({
        $or: [{ userId: req.user._id || req.user.id }, { email: req.user.email }],
      });
    }

    if (!orphanage) {
      orphanage = await Orphanage.findOne();
    }

    if (!orphanage) {
      return sendError(res, 'Orphanage profile not found', null, 404);
    }

    const fieldsToUpdate = [
      'name',
      'type',
      'address',
      'city',
      'state',
      'pincode',
      'contact',
      'email',
      'registrationNumber',
      'pan',
      'cciJj',
      'authorizedPerson',
      'verificationStatus',
      'verifiedBadge',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        orphanage[field] = req.body[field];
      }
    });

    if (req.body.documents && Array.isArray(req.body.documents)) {
      orphanage.documents = req.body.documents;
    }

    await orphanage.save();

    return sendSuccess(res, 'Profile updated successfully', orphanage);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orphanages/me/requirements
 * Retrieves all requirements posted by this orphanage
 */
export const getMyRequirements = async (req, res, next) => {
  try {
    let orphanage = null;

    if (req.user?._id || req.user?.id) {
      orphanage = await Orphanage.findOne({
        $or: [{ userId: req.user._id || req.user.id }, { email: req.user.email }],
      });
    }

    if (!orphanage && req.query.orphanageId) {
      orphanage = await Orphanage.findById(req.query.orphanageId);
    }

    if (!orphanage && !req.user) {
      orphanage = await Orphanage.findOne();
    }

    const query = orphanage ? { orphanageId: orphanage._id } : { _id: null };
    const requirements = await Requirement.find(query).sort({ createdAt: -1 }).lean();

    const formatted = requirements.map((r) => {
      const amountNeeded = Number(r.amountNeeded) || 0;
      const amountRaised = Number(r.amountRaised) || 0;
      return {
        ...r,
        id: r._id?.toString() || r.id,
        amountNeeded,
        amountRaised,
        percentageRaised: amountNeeded > 0 ? Math.min(100, Math.round((amountRaised / amountNeeded) * 100)) : 0,
        remainingAmount: Math.max(0, amountNeeded - amountRaised),
      };
    });

    return sendSuccess(res, 'Orphanage requirements fetched successfully', formatted);
  } catch (error) {
    next(error);
  }
};
