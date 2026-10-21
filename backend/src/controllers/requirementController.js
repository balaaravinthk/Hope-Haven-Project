import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { Requirement, RequirementCategories, UrgencyLevels, RequirementStatus } from '../models/Requirement.js';
import { VolunteerRole } from '../models/VolunteerRole.js';
import { Orphanage, OrphanageTypes, VerificationStatus } from '../models/Orphanage.js';

/**
 * Urgency Weight Definition for Primary Feed Sorting
 * Critical (4) > High (3) > Medium (2) > Low (1)
 */
const URGENCY_WEIGHTS = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

/**
 * Seeds initial demo orphanages and requirements if the database is empty
 */
export const ensureSeedData = async () => {
  try {
    const requirementCount = await Requirement.countDocuments();
    if (requirementCount > 0) return;

    // Ensure at least one verified orphanage exists to reference
    let orphanage1 = await Orphanage.findOne({ email: 'hopechildren@hopehaven.org' });
    if (!orphanage1) {
      orphanage1 = await Orphanage.create({
        name: "Hope Children's Home",
        type: "Children's Home / CCI",
        address: "12, Green Park Road, Saravanampatti, Coimbatore, Tamil Nadu 641035",
        city: "Coimbatore",
        state: "Tamil Nadu",
        contact: "+91 98765 43210",
        email: "hopechildren@hopehaven.org",
        registrationNumber: "TN/CBE/2018/00492",
        pan: "AAATH1234F",
        cciJj: "JJ-ACT-2015-CCI-8842",
        authorizedPerson: "Dr. Revathi Sundaram",
        aadhaarNumberMasked: "XXXX XXXX 1234",
        aadhaarVerified: true,
        verificationStatus: VerificationStatus.APPROVED,
        verifiedBadge: true,
      });
    }

    let orphanage2 = await Orphanage.findOne({ email: 'sunrise.home@hopehaven.org' });
    if (!orphanage2) {
      orphanage2 = await Orphanage.create({
        name: "Sunrise Orphanage",
        type: "Children's Home / CCI",
        address: "45, Gandhi Street, Anna Nagar, Chennai, Tamil Nadu 600040",
        city: "Chennai",
        state: "Tamil Nadu",
        contact: "+91 87654 32109",
        email: "sunrise.home@hopehaven.org",
        registrationNumber: "TN/CHN/2019/00881",
        pan: "BBBTC5678G",
        cciJj: "JJ-ACT-2015-CCI-5511",
        authorizedPerson: "M. Ramanathan",
        aadhaarNumberMasked: "XXXX XXXX 5678",
        aadhaarVerified: true,
        verificationStatus: VerificationStatus.APPROVED,
        verifiedBadge: true,
      });
    }

    const defaultRequirements = [
      {
        orphanageId: orphanage2._id,
        title: "Emergency Medical Funds for Dengue Treatment",
        category: "Healthcare",
        amountNeeded: 25000,
        amountRaised: 5000,
        urgency: UrgencyLevels.CRITICAL,
        status: RequirementStatus.ACTIVE,
        description: "Two of our young children have contracted acute dengue and require emergency IV fluid therapy, medications, and hospitalization care.",
        datePosted: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        orphanageId: orphanage1._id,
        title: "Clean Drinking Water RO Filter Plant Overhaul",
        category: "Facility & Infrastructure",
        amountNeeded: 40000,
        amountRaised: 6000,
        urgency: UrgencyLevels.CRITICAL,
        status: RequirementStatus.ACTIVE,
        description: "Our main central reverse osmosis membrane failed, affecting safe drinking water supply for 54 resident children and caretakers.",
        datePosted: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        orphanageId: orphanage1._id,
        title: "Winter Blankets & Sweaters for Toddlers",
        category: "Clothing",
        amountNeeded: 12000,
        amountRaised: 1800,
        urgency: UrgencyLevels.HIGH,
        status: RequirementStatus.ACTIVE,
        description: "With dropping winter night temperatures, we urgently need 30 warm thermal blankets and fleece jackets for our toddlers.",
        datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        orphanageId: orphanage2._id,
        title: "Monthly Grocery & Nutrition Staples Ration",
        category: "Food & Nutrition",
        amountNeeded: 35000,
        amountRaised: 14000,
        urgency: UrgencyLevels.HIGH,
        status: RequirementStatus.ACTIVE,
        description: "Running low on essential kitchen provisions: rice sacks, toor dal, cooking groundnut oil, milk formula, and vegetables.",
        datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        orphanageId: orphanage1._id,
        title: "Board Exam Books & Science Kit Supplies",
        category: "Education",
        amountNeeded: 22000,
        amountRaised: 11000,
        urgency: UrgencyLevels.MEDIUM,
        status: RequirementStatus.ACTIVE,
        description: "Preparing 18 students for upcoming state board secondary examinations with reference guides, stationery, and geometry sets.",
        datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        orphanageId: orphanage2._id,
        title: "School Uniforms & Sturdy Shoes for 30 Children",
        category: "Clothing",
        amountNeeded: 45000,
        amountRaised: 30000,
        urgency: UrgencyLevels.MEDIUM,
        status: RequirementStatus.ACTIVE,
        description: "Annual school reopening replacement of tailored uniform sets and sports canvas shoes for the academic term.",
        datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    await Requirement.insertMany(defaultRequirements);
    console.log('✅ Seeded initial requirements and orphanages successfully.');
  } catch (err) {
    console.error('⚠️  Failed to seed default requirements:', err.message);
  }
};

/**
 * GET /api/requirements
 * 
 * Retrieves all requirements sorted by:
 * 1. Critical/High urgency first (Critical > High > Medium > Low)
 * 2. Lowest percent raised (amountRaised / amountNeeded ascending)
 * 
 * Returns populated orphanage details (name, address, contact, verification status)
 */
export const getRequirements = async (req, res, next) => {
  try {
    // Seed initial demo data if database is fresh
    await ensureSeedData();

    const { status, category, urgency, search } = req.query;

    const query = {};

    // Filter by status (default to active if requested or show all)
    if (status) {
      query.status = status.toLowerCase();
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by urgency
    if (urgency) {
      query.urgency = urgency;
    }

    // Text / keyword search across title or description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    // Query requirements and populate referenced orphanage details
    const rawRequirements = await Requirement.find(query)
      .populate({
        path: 'orphanageId',
        select: 'name type address city state contact email verifiedBadge verificationStatus photoPreview',
      })
      .lean();

    // Query active volunteer roles to include volunteer needs in the unified donor feed
    const roleQuery = { status: 'Open' };
    if (urgency) {
      roleQuery.urgency = urgency;
    }
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      roleQuery.$or = [
        { roleTitle: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }
    if (category && category !== 'All') {
      roleQuery.category = category;
    }

    const rawRoles = await VolunteerRole.find(roleQuery)
      .populate({
        path: 'orphanageId',
        select: 'name type address city state contact email verifiedBadge verificationStatus photoPreview',
      })
      .lean();

    // Format funding requirements
    const formattedRequirements = rawRequirements.map((r) => {
      const orph = r.orphanageId || {};
      const amountNeeded = Number(r.amountNeeded) || 0;
      const amountRaised = Number(r.amountRaised) || 0;
      const percentRaised = amountNeeded > 0 ? Math.min(100, Math.round((amountRaised / amountNeeded) * 100)) : 0;

      return {
        ...r,
        id: r._id?.toString() || r.id,
        type: 'fund',
        amountNeeded,
        amountRaised,
        percentRaised,
        percentageRaised: percentRaised,
        remainingAmount: Math.max(0, amountNeeded - amountRaised),
        orphanage: {
          id: orph._id?.toString() || null,
          name: orph.name || "Orphanage Partner",
          address: orph.address || `${orph.city || ''}, ${orph.state || 'India'}`,
          contact: orph.contact || "",
          email: orph.email || "",
          verified: orph.verifiedBadge ?? (orph.verificationStatus === 'Approved' || orph.verificationStatus === 'Verified'),
          verificationStatus: orph.verificationStatus || 'Pending',
        },
      };
    });

    // Format volunteer roles
    const formattedRoles = rawRoles.map((role) => {
      const orph = role.orphanageId || {};
      const needed = Number(role.needed) || 1;
      const applied = Number(role.applied) || 0;
      const filled = Number(role.filled) || 0;
      const percentFilled = Math.min(100, Math.round((applied / needed) * 100));

      return {
        _id: role._id,
        id: role._id.toString(),
        type: 'volunteer',
        roleId: role._id.toString(),
        title: role.roleTitle,
        category: role.category || 'Education',
        description: role.description || `Seeking ${needed} volunteer(s) for ${role.days}.`,
        urgency: role.urgency || 'Medium',
        volunteersNeeded: needed,
        volunteersApplied: applied,
        volunteersFilled: filled,
        days: role.days,
        schedule: role.days,
        status: 'active',
        datePosted: role.createdAt,
        orphanageId: orph._id?.toString() || null,
        orphanage: {
          id: orph._id?.toString() || null,
          name: orph.name || "Orphanage Partner",
          address: orph.address || `${orph.city || ''}, ${orph.state || 'India'}`,
          contact: orph.contact || "",
          email: orph.email || "",
          verified: orph.verifiedBadge ?? (orph.verificationStatus === 'Approved' || orph.verificationStatus === 'Verified'),
          verificationStatus: orph.verificationStatus || 'Pending',
        },
      };
    });

    // Combine all feed items and Double-Sort by:
    // 1. Urgency: Critical (4) > High (3) > Medium (2) > Low (1)
    // 2. Need completion progress
    const combinedNeeds = [...formattedRequirements, ...formattedRoles].sort((a, b) => {
      const weightA = URGENCY_WEIGHTS[a.urgency] || 0;
      const weightB = URGENCY_WEIGHTS[b.urgency] || 0;

      if (weightB !== weightA) {
        return weightB - weightA;
      }

      const pctA = a.type === 'volunteer'
        ? (a.volunteersApplied || 0) / (a.volunteersNeeded || 1)
        : a.amountNeeded > 0 ? (a.amountRaised || 0) / a.amountNeeded : 1;
      const pctB = b.type === 'volunteer'
        ? (b.volunteersApplied || 0) / (b.volunteersNeeded || 1)
        : b.amountNeeded > 0 ? (b.amountRaised || 0) / b.amountNeeded : 1;
      return pctA - pctB;
    });

    return sendSuccess(res, 'Requirements fetched successfully', combinedNeeds);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/requirements/feed
 * Live prioritized active needs feed
 */
export const getLiveFeed = async (req, res, next) => {
  try {
    req.query.status = 'active';
    return getRequirements(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/requirements
 * Create a new need
 */
export const createRequirement = async (req, res, next) => {
  try {
    const { orphanageId, title, category, amountNeeded, urgency, description } = req.body;

    if (!title || !category || !amountNeeded) {
      return sendError(res, 'Title, category, and amount needed are required.', null, 400);
    }

    // Resolve an orphanage ID if not passed directly (use logged-in user or first available)
    let assignedOrphanageId = orphanageId;
    if (!assignedOrphanageId) {
      const firstOrphanage = await Orphanage.findOne();
      assignedOrphanageId = firstOrphanage?._id;
    }

    if (!assignedOrphanageId) {
      return sendError(res, 'No orphanage found to link this requirement with.', null, 400);
    }

    const newReq = await Requirement.create({
      orphanageId: assignedOrphanageId,
      title: title.trim(),
      category,
      amountNeeded: Number(amountNeeded),
      amountRaised: 0,
      urgency: urgency || UrgencyLevels.MEDIUM,
      status: RequirementStatus.ACTIVE,
      description: description ? description.trim() : '',
      datePosted: new Date(),
    });

    const populated = await Requirement.findById(newReq._id).populate('orphanageId');

    return sendSuccess(res, 'Requirement created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/requirements/:id
 */
export const updateRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If marking as fulfilled, ensure amountRaised fulfills amountNeeded
    if (updateData.status === 'fulfilled') {
      const existing = await Requirement.findById(id);
      if (existing && (!updateData.amountRaised || updateData.amountRaised < existing.amountNeeded)) {
        updateData.amountRaised = existing.amountNeeded;
      }
    }

    const updated = await Requirement.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    }).populate('orphanageId');

    if (!updated) {
      return sendError(res, 'Requirement not found', null, 404);
    }

    const formatted = {
      ...updated.toObject(),
      id: updated._id.toString(),
    };

    return sendSuccess(res, 'Requirement updated successfully', formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/requirements/:id
 */
export const deleteRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Requirement.findByIdAndDelete(id);

    if (!deleted) {
      return sendError(res, 'Requirement not found', null, 404);
    }

    return sendSuccess(res, 'Requirement deleted successfully');
  } catch (error) {
    next(error);
  }
};
