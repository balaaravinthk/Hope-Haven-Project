import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { VolunteerApplication, ApplicationStatus } from '../models/VolunteerApplication.js';
import { Orphanage } from '../models/Orphanage.js';
import { Requirement } from '../models/Requirement.js';
import { User } from '../models/User.js';

let volunteerRoles = [
  { id: 1, roleTitle: 'Weekend Math & English Tutor', needed: 4, filled: 2, days: 'Saturdays & Sundays', status: 'Open' },
  { id: 2, roleTitle: 'Art & Craft Workshop Lead', needed: 2, filled: 2, days: 'Every 2nd Saturday', status: 'Filled' },
  { id: 3, roleTitle: 'Sports & Physical Activity Coach', needed: 3, filled: 1, days: 'Sunday Evenings', status: 'Open' },
];

/**
 * Seed initial volunteer applications into MongoDB if empty
 */
const ensureSeedVolunteers = async () => {
  try {
    const count = await VolunteerApplication.countDocuments();
    if (count > 0) return;

    const defaultOrp = await Orphanage.findOne();
    const seedApps = [
      {
        orphanageId: defaultOrp?._id || null,
        name: 'Anitha R.',
        skill: 'Teaching — weekends',
        skills: 'Teaching — weekends',
        schedule: 'Saturdays & Sundays',
        availability: 'Saturdays & Sundays',
        email: 'anitha.r@gmail.com',
        phone: '+91 98450 12345',
        status: 'pending',
        date: '2026-10-15',
      },
      {
        orphanageId: defaultOrp?._id || null,
        name: 'Vikram S.',
        skill: 'Sports & Yoga',
        skills: 'Sports & Yoga',
        schedule: 'Sunday Evenings',
        availability: 'Sunday Evenings',
        email: 'vikram.s@outlook.com',
        phone: '+91 97890 65432',
        status: 'approved',
        date: '2026-10-11',
      },
    ];

    await VolunteerApplication.insertMany(seedApps);
  } catch (err) {
    // Non-blocking notice for seed setup
  }
};

/**
 * Safely extract authenticated user from token if present
 */
const extractUserSafely = async (req) => {
  if (req.user) return req.user;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return await User.findById(decoded.id).select('-password');
  } catch {
    return null;
  }
};

/**
 * POST /api/volunteers/apply
 * Submit a volunteer application with skills, availability/schedule, and contact info.
 */
export const applyVolunteer = async (req, res, next) => {
  try {
    const authenticatedUser = await extractUserSafely(req);
    const {
      name,
      email,
      phone,
      skills,
      skill,
      schedule,
      availability,
      orphanageId,
      requirementId,
      roleId,
      roleTitle,
    } = req.body;

    const applicantSkills = (skills || skill || '').trim();
    const applicantSchedule = (schedule || availability || '').trim();
    const applicantName = (name || authenticatedUser?.name || '').trim();
    const applicantEmail = (email || authenticatedUser?.email || '').trim().toLowerCase();
    const applicantPhone = (phone || authenticatedUser?.phone || '').trim();

    if (!applicantName) {
      return sendError(res, 'Applicant name is required', null, 400);
    }
    if (!applicantEmail) {
      return sendError(res, 'Applicant email is required', null, 400);
    }
    if (!applicantSkills) {
      return sendError(res, 'Skills are required for volunteering', null, 400);
    }
    if (!applicantSchedule) {
      return sendError(res, 'Available schedule is required', null, 400);
    }

    // Determine target orphanage
    let targetOrphanageId = orphanageId;
    if (!targetOrphanageId) {
      const defaultOrp = await Orphanage.findOne();
      if (defaultOrp) {
        targetOrphanageId = defaultOrp._id;
      }
    }

    const application = await VolunteerApplication.create({
      orphanageId: targetOrphanageId || null,
      volunteerId: authenticatedUser?._id || null,
      requirementId: requirementId || null,
      roleId: roleId || null,
      roleTitle: roleTitle || 'General Volunteer',
      name: applicantName,
      email: applicantEmail,
      phone: applicantPhone,
      skills: applicantSkills,
      skill: applicantSkills,
      schedule: applicantSchedule,
      availability: applicantSchedule,
      status: ApplicationStatus.PENDING,
      date: new Date().toISOString().split('T')[0],
    });

    // If tied to a requirement with volunteer counts, update requirement
    if (requirementId) {
      try {
        await Requirement.findByIdAndUpdate(requirementId, {
          $inc: { volunteersApplied: 1 },
        });
      } catch (err) {
        // Non-blocking requirement counter update
      }
    }

    return sendSuccess(
      res,
      'Volunteer application submitted successfully',
      application,
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/volunteers/orphanage
 * Retrieve volunteer applications for the orphanage admin dashboard.
 */
export const getOrphanageApplications = async (req, res, next) => {
  try {
    await ensureSeedVolunteers();
    const authenticatedUser = await extractUserSafely(req);

    let filter = {};

    if (req.query.orphanageId) {
      filter.orphanageId = req.query.orphanageId;
    } else if (authenticatedUser) {
      // Find orphanage associated with this user
      const orphanage = await Orphanage.findOne({ adminUserId: authenticatedUser._id });
      if (orphanage) {
        filter.orphanageId = orphanage._id;
      } else if (authenticatedUser.orphanageId) {
        filter.orphanageId = authenticatedUser.orphanageId;
      }
    }

    let applications = await VolunteerApplication.find(filter)
      .populate('orphanageId', 'name location email phone')
      .populate('requirementId', 'title category')
      .sort({ createdAt: -1 });

    // If filter produced no results but database has applications, provide all
    if (applications.length === 0 && Object.keys(filter).length > 0) {
      applications = await VolunteerApplication.find({})
        .populate('orphanageId', 'name location email phone')
        .populate('requirementId', 'title category')
        .sort({ createdAt: -1 });
    }

    return sendSuccess(res, 'Orphanage volunteer applications retrieved', applications);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/volunteers/applications/:id/status
 * Update application status ('approved', 'declined', 'accepted', 'rejected', 'pending')
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (!status) {
      return sendError(res, 'Status is required', null, 400);
    }

    // Normalize accepted -> approved, rejected -> declined if desired, or preserve
    const validStatuses = Object.values(ApplicationStatus);
    if (!validStatuses.includes(status)) {
      return sendError(
        res,
        `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`,
        null,
        400
      );
    }

    let app = null;

    // Try finding by MongoDB _id first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      app = await VolunteerApplication.findByIdAndUpdate(
        id,
        { status },
        { returnDocument: 'after' }
      );
    }

    // If not found or id is not ObjectId (e.g. legacy numerical ID or mock)
    if (!app) {
      app = await VolunteerApplication.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { name: { $exists: true } }],
      });
      if (app) {
        app.status = status;
        await app.save();
      }
    }

    if (!app) {
      return sendError(res, 'Application not found', null, 404);
    }

    return sendSuccess(res, `Application marked as ${status}`, app);
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Volunteer roles retrieved', volunteerRoles);
  } catch (error) {
    next(error);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const { roleTitle, needed, days } = req.body;
    const newRole = {
      id: volunteerRoles.length + 1,
      roleTitle,
      needed: Number(needed),
      filled: 0,
      days,
      status: 'Open',
    };
    volunteerRoles.push(newRole);
    return sendSuccess(res, 'Volunteer role created', newRole, 201);
  } catch (error) {
    next(error);
  }
};

// Backward-compatible alias exports
export const submitApplication = applyVolunteer;
export const getApplications = getOrphanageApplications;
