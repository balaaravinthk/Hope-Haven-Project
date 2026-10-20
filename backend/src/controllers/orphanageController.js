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

    // 3. Fallback to first orphanage in DB (or create demo default)
    if (!orphanage) {
      orphanage = await Orphanage.findOne();
    }

    if (!orphanage) {
      orphanage = await Orphanage.create({
        name: "Hope Children's Home",
        type: "Children's Home / CCI",
        address: "12, Green Park Road, Saravanampatti, Coimbatore, Tamil Nadu 641035",
        city: "Coimbatore",
        state: "Tamil Nadu",
        contact: "+91 98765 43210",
        email: req.user?.email || "hopechildren@hopehaven.org",
        registrationNumber: "TN/CBE/2018/00492",
        pan: "AAATH1234F",
        cciJj: "JJ-ACT-2015-CCI-8842",
        authorizedPerson: "Dr. Revathi Sundaram",
        aadhaarNumberMasked: "XXXX XXXX 1234",
        aadhaarVerified: true,
        verificationStatus: VerificationStatus.APPROVED,
        verifiedBadge: true,
        documents: ["Registration_Certificate_2018.pdf", "JJ_Act_Compliance_Approval.pdf", "FCRA_Tax_Exemption_80G.pdf"],
      });
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

    if (!orphanage) {
      orphanage = await Orphanage.findOne();
    }

    const query = orphanage ? { orphanageId: orphanage._id } : {};
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
