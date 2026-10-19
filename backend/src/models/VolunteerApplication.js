/**
 * Volunteer Application Model / Schema Definition
 * Represents a supporter's application to volunteer at an orphanage.
 */

export const ApplicationStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

export const VolunteerApplicationSchema = {
  id: 'String / Number (Auto-increment)',
  orphanageId: 'Reference to Orphanage',
  volunteerId: 'Reference to User',
  roleId: 'Reference to VolunteerRole (optional)',
  name: { type: 'String', required: true },
  skill: { type: 'String', required: true },
  email: { type: 'String', required: true },
  phone: { type: 'String', required: true },
  status: { 
    type: 'String', 
    enum: Object.values(ApplicationStatus), 
    default: ApplicationStatus.PENDING 
  },
  appliedDate: { type: 'Date', default: 'Date.now' },
  createdAt: 'Date',
  updatedAt: 'Date',
};
