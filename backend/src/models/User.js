import mongoose from 'mongoose';

/**
 * User Roles Enum
 */
export const UserRoles = {
  SUPPORTER: 'supporter',
  ORPHANAGE_ADMIN: 'orphanage',
  SUPER_ADMIN: 'admin',
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRoles),
        message: '{VALUE} is not a valid user role',
      },
      default: UserRoles.SUPPORTER,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    impact: {
      totalDonated: {
        type: Number,
        default: 0,
        min: [0, 'Total donated cannot be negative'],
      },
      livesTouched: {
        type: Number,
        default: 0,
        min: [0, 'Lives touched cannot be negative'],
      },
      hoursVolunteered: {
        type: Number,
        default: 0,
        min: [0, 'Hours volunteered cannot be negative'],
      },
    },
    trophies: {
      type: [
        {
          id: { type: String },
          title: { type: String },
          description: { type: String },
          icon: { type: String },
          unlockedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for optimized searching and role filtering
userSchema.index({ role: 1, createdAt: -1 });

export const UserSchema = userSchema;
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
