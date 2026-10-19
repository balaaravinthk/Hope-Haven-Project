/**
 * User Model / Schema Definition
 * Represents supporters (Donors / Volunteers) and platform administrators.
 */

export const UserRoles = {
  SUPPORTER: 'supporter',
  ORPHANAGE_ADMIN: 'orphanage',
  SUPER_ADMIN: 'admin',
};

export const UserSchema = {
  id: 'String (UUID / ObjectId / Auto-increment)',
  name: { type: 'String', required: true, trim: true },
  email: { type: 'String', required: true, unique: true, lowercase: true },
  password: { type: 'String', required: true }, // Hashed using bcryptjs
  role: { 
    type: 'String', 
    enum: Object.values(UserRoles), 
    default: UserRoles.SUPPORTER 
  },
  phone: { type: 'String', default: null },
  impact: {
    totalDonated: { type: 'Number', default: 0 },
    livesTouched: { type: 'Number', default: 0 },
    hoursVolunteered: { type: 'Number', default: 0 },
  },
  trophies: { type: 'Array', default: [] },
  createdAt: 'Date',
  updatedAt: 'Date',
};
