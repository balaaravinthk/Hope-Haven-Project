import mongoose from 'mongoose';

/**
 * Requirement Categories
 */
export const RequirementCategories = [
  'Food & Nutrition',
  'Healthcare',
  'Education',
  'Clothing',
  'Facility & Infrastructure',
  'Other',
];

/**
 * Urgency Priority Levels
 */
export const UrgencyLevels = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

/**
 * Requirement Lifecycle Status
 */
export const RequirementStatus = {
  ACTIVE: 'active',
  FULFILLED: 'fulfilled',
};

const requirementSchema = new mongoose.Schema(
  {
    orphanageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Orphanage',
      required: [true, 'Orphanage ID reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Requirement title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: {
        values: RequirementCategories,
        message: '{VALUE} is not a valid requirement category',
      },
      required: [true, 'Category is required'],
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    amountNeeded: {
      type: Number,
      required: [true, 'Amount needed is required'],
      min: [1, 'Amount needed must be greater than zero'],
    },
    amountRaised: {
      type: Number,
      default: 0,
      min: [0, 'Amount raised cannot be negative'],
    },
    urgency: {
      type: String,
      enum: {
        values: Object.values(UrgencyLevels),
        message: '{VALUE} is not a valid urgency level',
      },
      default: UrgencyLevels.MEDIUM,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(RequirementStatus),
        message: '{VALUE} is not a valid status',
      },
      default: RequirementStatus.ACTIVE,
      index: true,
    },
    datePosted: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Virtual: percentage of requirement funded
requirementSchema.virtual('percentageRaised').get(function () {
  if (!this.amountNeeded || this.amountNeeded <= 0) return 0;
  return Math.min(100, Math.round((this.amountRaised / this.amountNeeded) * 100));
});

// Virtual: remaining amount needed to fulfill requirement
requirementSchema.virtual('remainingAmount').get(function () {
  return Math.max(0, this.amountNeeded - this.amountRaised);
});

// Compound indexes for performant feeds and filtering
requirementSchema.index({ orphanageId: 1, status: 1 });
requirementSchema.index({ status: 1, urgency: 1, createdAt: -1 });
requirementSchema.index({ category: 1, status: 1 });
requirementSchema.index({ title: 'text', description: 'text' });

export const RequirementSchema = requirementSchema;
export const Requirement = mongoose.models.Requirement || mongoose.model('Requirement', requirementSchema);
export default Requirement;
