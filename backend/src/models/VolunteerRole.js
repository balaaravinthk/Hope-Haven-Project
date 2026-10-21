import mongoose from 'mongoose';

/**
 * Volunteer Role Model / Schema Definition
 * Represents volunteer openings created by an orphanage.
 */
export const RoleStatus = {
  OPEN: 'Open',
  FILLED: 'Filled',
};

const volunteerRoleSchema = new mongoose.Schema(
  {
    orphanageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Orphanage',
      required: false,
    },
    roleTitle: {
      type: String,
      required: true,
      trim: true,
    },
    needed: {
      type: Number,
      required: true,
      min: 1,
    },
    filled: {
      type: Number,
      default: 0,
      min: 0,
    },
    days: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(RoleStatus),
      default: RoleStatus.OPEN,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const VolunteerRole = mongoose.models.VolunteerRole || mongoose.model('VolunteerRole', volunteerRoleSchema);
