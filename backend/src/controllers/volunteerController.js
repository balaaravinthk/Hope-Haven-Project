import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { VolunteerApplication, ApplicationStatus } from '../models/VolunteerApplication.js';
import { VolunteerRole } from '../models/VolunteerRole.js';
import { Orphanage } from '../models/Orphanage.js';
import { Requirement } from '../models/Requirement.js';
import { User } from '../models/User.js';
import { Notification, NotificationTypes } from '../models/Notification.js';

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
    if (!targetOrphanageId && roleId) {
      const targetRole = await VolunteerRole.findById(roleId);
      if (targetRole && targetRole.orphanageId) {
        targetOrphanageId = targetRole.orphanageId;
      }
    }

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

    // Increment applied counter on VolunteerRole
    if (roleId) {
      try {
        await VolunteerRole.findByIdAndUpdate(roleId, {
          $inc: { applied: 1 },
        });
      } catch (err) {
        // Non-blocking
      }
    }

    // If tied to a requirement with volunteer counts, update requirement
    if (requirementId) {
      try {
        await Requirement.findByIdAndUpdate(requirementId, {
          $inc: { volunteersApplied: 1 },
        });
      } catch (err) {
        // Non-blocking
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
    const authenticatedUser = await extractUserSafely(req);

    let filter = {};

    if (req.query.orphanageId) {
      filter.orphanageId = req.query.orphanageId;
    } else if (authenticatedUser) {
      // Find orphanage associated with this user
      const orphanage = await Orphanage.findOne({
        $or: [{ userId: authenticatedUser._id }, { email: authenticatedUser.email }],
      });
      if (orphanage) {
        filter.orphanageId = orphanage._id;
      }
    }

    const applications = await VolunteerApplication.find(filter)
      .populate('orphanageId', 'name location email phone')
      .populate('requirementId', 'title category')
      .populate('roleId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Orphanage volunteer applications retrieved', applications);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/volunteers/my-applications
 * Retrieve volunteer applications submitted by the current authenticated user.
 */
export const getMyVolunteerApplications = async (req, res, next) => {
  try {
    const authenticatedUser = await extractUserSafely(req);
    const userQuery = [];

    if (authenticatedUser?._id) {
      userQuery.push({ volunteerId: authenticatedUser._id });
    }
    if (authenticatedUser?.email) {
      userQuery.push({ email: authenticatedUser.email.toLowerCase().trim() });
    }
    if (req.query.email) {
      userQuery.push({ email: req.query.email.toLowerCase().trim() });
    }

    if (userQuery.length === 0) {
      return sendSuccess(res, 'User volunteer applications', []);
    }

    const applications = await VolunteerApplication.find({ $or: userQuery })
      .populate('orphanageId', 'name address contact email')
      .populate('roleId')
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const formatted = applications.map((a) => ({
      ...a,
      id: a._id.toString(),
      orphanageName: a.orphanageId?.name || "Orphanage Partner",
      orphanageAddress: a.orphanageId?.address || "",
      orphanageContact: a.orphanageId?.contact || "",
    }));

    return sendSuccess(res, 'User volunteer applications retrieved', formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/volunteers/applications/:id/status
 * Update application status ('approved', 'declined', 'accepted', 'rejected', 'pending')
 * Creates notification for applicant user and updates role fill counts.
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (!status) {
      return sendError(res, 'Status is required', null, 400);
    }

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

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      app = await VolunteerApplication.findByIdAndUpdate(
        id,
        { status },
        { returnDocument: 'after' }
      );
    }

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

    // 1. Update filled count on VolunteerRole if approved
    if (app.roleId && (status === 'approved' || status === 'accepted')) {
      try {
        const role = await VolunteerRole.findById(app.roleId);
        if (role) {
          const newFilled = (role.filled || 0) + 1;
          const newStatus = newFilled >= role.needed ? 'Filled' : role.status;
          await VolunteerRole.findByIdAndUpdate(app.roleId, {
            filled: newFilled,
            status: newStatus,
          });
        }
      } catch (err) {
        // Non-blocking
      }
    }

    // 2. Dispatch real notification to applicant user
    try {
      const orph = app.orphanageId ? await Orphanage.findById(app.orphanageId) : null;
      const orphanageName = orph?.name || 'the orphanage';
      const isApproved = status === 'approved' || status === 'accepted';
      const notifStatus = isApproved ? 'approved' : 'rejected';
      const title = isApproved
        ? `Volunteer Application Approved! 🎉`
        : `Volunteer Application Update`;
      const message = isApproved
        ? `Congratulations! Your volunteer application for "${app.roleTitle}" has been approved by ${orphanageName}. They may reach out to you via ${app.phone || app.email}.`
        : `Thank you for your interest. Your volunteer application for "${app.roleTitle}" at ${orphanageName} was not accepted at this time.`;

      if (app.email) {
        await Notification.create({
          recipientUserId: app.volunteerId || null,
          recipientEmail: app.email.toLowerCase().trim(),
          title,
          message,
          type: NotificationTypes.VOLUNTEER_STATUS,
          status: notifStatus,
          relatedId: app._id,
        });
      }
    } catch (notifErr) {
      console.warn('Could not persist notification for volunteer status:', notifErr.message);
    }

    return sendSuccess(res, `Application marked as ${status}`, app);
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.orphanageId) {
      filter.orphanageId = req.query.orphanageId;
    }
    const roles = await VolunteerRole.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, 'Volunteer roles retrieved', roles);
  } catch (error) {
    next(error);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const { roleTitle, needed, days, orphanageId, urgency, category, description } = req.body;
    const authenticatedUser = await extractUserSafely(req);

    let targetOrphanage = null;
    if (orphanageId) {
      targetOrphanage = await Orphanage.findById(orphanageId);
    }
    if (!targetOrphanage && authenticatedUser) {
      targetOrphanage = await Orphanage.findOne({
        $or: [{ userId: authenticatedUser._id }, { email: authenticatedUser.email }],
      });
    }
    if (!targetOrphanage) {
      targetOrphanage = await Orphanage.findOne();
    }

    if (!targetOrphanage) {
      return sendError(res, 'No orphanage found for this request.', null, 404);
    }

    if (targetOrphanage.verificationStatus !== 'Approved') {
      return sendError(
        res,
        'Your orphanage must be approved by an administrator before posting volunteer requests.',
        null,
        403
      );
    }

    const newRole = await VolunteerRole.create({
      orphanageId: targetOrphanage._id,
      roleTitle: (roleTitle || '').trim(),
      needed: Number(needed) || 1,
      filled: 0,
      applied: 0,
      days: (days || 'Weekends').trim(),
      urgency: urgency || 'Medium',
      category: category || 'Education',
      description: (description || '').trim(),
      status: 'Open',
    });

    return sendSuccess(res, 'Volunteer role created', newRole, 201);
  } catch (error) {
    next(error);
  }
};

// Backward-compatible alias exports
export const submitApplication = applyVolunteer;
export const getApplications = getOrphanageApplications;
