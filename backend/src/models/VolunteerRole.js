/**
 * Volunteer Role Model / Schema Definition
 * Represents volunteer openings created by an orphanage.
 */

export const RoleStatus = {
  OPEN: 'Open',
  FILLED: 'Filled',
};

export const VolunteerRoleSchema = {
  id: 'String / Number (Auto-increment)',
  orphanageId: 'Reference to Orphanage',
  roleTitle: { type: 'String', required: true },  // e.g., "Weekend Math & English Tutor"
  needed: { type: 'Number', required: true, min: 1 },
  filled: { type: 'Number', default: 0 },
  days: { type: 'String', required: true },       // e.g., "Saturdays & Sundays"
  status: { 
    type: 'String', 
    enum: Object.values(RoleStatus), 
    default: RoleStatus.OPEN 
  },
  createdAt: 'Date',
  updatedAt: 'Date',
};
