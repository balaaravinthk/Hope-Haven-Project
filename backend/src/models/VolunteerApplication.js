import mongoose from 'mongoose';

/**
 * Volunteer Application Lifecycle Status
 */
export const ApplicationStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  REJECTED: 'rejected',
};

const volunteerApplicationSchema = new mongoose.Schema(
  {
    orphanageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Orphanage',
      default: null,
      index: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VolunteerRole',
      default: null,
    },
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      default: null,
    },
    roleTitle: {
      type: String,
      default: 'General Volunteer',
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Volunteer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: String,
      default: '',
      trim: true,
    },
    skill: {
      type: String,
      default: '',
      trim: true,
    },
    schedule: {
      type: String,
      default: '',
      trim: true,
    },
    availability: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ApplicationStatus),
        message: '{VALUE} is not a valid application status',
      },
      default: ApplicationStatus.PENDING,
      index: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
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

// Virtual id matching MongoDB _id
volunteerApplicationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Sync skills/skill and schedule/availability before save
volunteerApplicationSchema.pre('save', function () {
  if (this.skills && !this.skill) {
    this.skill = this.skills;
  } else if (this.skill && !this.skills) {
    this.skills = this.skill;
  }

  if (this.schedule && !this.availability) {
    this.availability = this.schedule;
  } else if (this.availability && !this.schedule) {
    this.schedule = this.availability;
  }

  if (!this.date) {
    this.date = new Date().toISOString().split('T')[0];
  }
});

// Useful indexes for querying applications
volunteerApplicationSchema.index({ orphanageId: 1, status: 1 });
volunteerApplicationSchema.index({ email: 1, orphanageId: 1 });
volunteerApplicationSchema.index({ createdAt: -1 });

export const VolunteerApplicationSchema = volunteerApplicationSchema;
export const VolunteerApplication =
  mongoose.models.VolunteerApplication ||
  mongoose.model('VolunteerApplication', volunteerApplicationSchema);

export default VolunteerApplication;
