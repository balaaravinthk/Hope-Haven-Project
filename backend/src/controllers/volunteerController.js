import { sendSuccess, sendError } from '../utils/apiResponse.js';

let volunteerRoles = [
  { id: 1, roleTitle: 'Weekend Math & English Tutor', needed: 4, filled: 2, days: 'Saturdays & Sundays', status: 'Open' },
  { id: 2, roleTitle: 'Art & Craft Workshop Lead', needed: 2, filled: 2, days: 'Every 2nd Saturday', status: 'Filled' },
  { id: 3, roleTitle: 'Sports & Physical Activity Coach', needed: 3, filled: 1, days: 'Sunday Evenings', status: 'Open' },
];

let volunteerApplications = [
  { id: 1, name: 'Anitha R.', skill: 'Teaching — weekends', email: 'anitha.r@gmail.com', phone: '+91 98450 12345', status: 'pending', date: '2026-10-15' },
  { id: 2, name: 'Vikram S.', skill: 'Sports & Yoga', email: 'vikram.s@outlook.com', phone: '+91 97890 65432', status: 'accepted', date: '2026-10-11' },
];

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

export const getApplications = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Volunteer applications retrieved', volunteerApplications);
  } catch (error) {
    next(error);
  }
};

export const submitApplication = async (req, res, next) => {
  try {
    const { name, email, phone, skill } = req.body;
    const newApp = {
      id: volunteerApplications.length + 1,
      name,
      skill,
      email,
      phone,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    };
    volunteerApplications.unshift(newApp);
    return sendSuccess(res, 'Volunteer application submitted successfully', newApp, 201);
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' | 'rejected'
    const app = volunteerApplications.find((a) => a.id === Number(id));
    if (!app) {
      return sendError(res, 'Application not found', null, 404);
    }
    app.status = status;
    return sendSuccess(res, `Application marked as ${status}`, app);
  } catch (error) {
    next(error);
  }
};
