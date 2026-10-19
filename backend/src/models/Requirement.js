/**
 * Requirement Model / Schema Definition
 * Represents urgent needs posted by orphanages (funds or supplies).
 */

export const RequirementCategories = [
  'Food & Nutrition',
  'Healthcare',
  'Education',
  'Clothing',
  'Facility & Infrastructure',
  'Other',
];

export const UrgencyLevels = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const RequirementStatus = {
  ACTIVE: 'active',
  FULFILLED: 'fulfilled',
};

export const RequirementSchema = {
  id: 'String / Number (Auto-increment)',
  orphanageId: 'Reference to Orphanage',
  title: { type: 'String', required: true },
  category: { type: 'String', enum: RequirementCategories, required: true },
  description: { type: 'String', default: '' },
  amountNeeded: { type: 'Number', required: true },
  amountRaised: { type: 'Number', default: 0 },
  urgency: { 
    type: 'String', 
    enum: Object.values(UrgencyLevels), 
    default: UrgencyLevels.MEDIUM 
  },
  status: { 
    type: 'String', 
    enum: Object.values(RequirementStatus), 
    default: RequirementStatus.ACTIVE 
  },
  datePosted: { type: 'Date', default: 'Date.now' },
  createdAt: 'Date',
  updatedAt: 'Date',
};
