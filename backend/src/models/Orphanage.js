import mongoose from 'mongoose';

/**
 * Institutional Types for Child Care Institutions
 */
export const OrphanageTypes = [
  "Children's Home / CCI",
  "Adoption Agency",
  "NGO / Trust",
  "Government Home",
];

/**
 * Institutional KYC Verification Status
 */
export const VerificationStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const orphanageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Orphanage name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: OrphanageTypes,
        message: '{VALUE} is not a valid institution type',
      },
      required: [true, 'Institution type is required'],
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    pincode: {
      type: String,
      trim: true,
      default: '',
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Official email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid official email address'],
      index: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    pan: {
      type: String,
      required: [true, 'PAN is required'],
      trim: true,
      uppercase: true,
    },
    cciJj: {
      type: String,
      required: [true, 'Juvenile Justice Act registration ID is required'],
      trim: true,
    },
    authorizedPerson: {
      type: String,
      required: [true, 'Authorized person name is required'],
      trim: true,
    },
    aadhaarNumberMasked: {
      type: String,
      required: [true, 'Masked Aadhaar is required'],
      trim: true,
    },
    aadhaarVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: {
        values: Object.values(VerificationStatus),
        message: '{VALUE} is not a valid verification status',
      },
      default: VerificationStatus.PENDING,
      index: true,
    },
    photoPreview: {
      type: String,
      default: null,
    },
    documents: {
      type: [String],
      default: [],
    },
    verifiedBadge: {
      type: Boolean,
      default: false,
      index: true,
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

// Compound and search indexes
orphanageSchema.index({ verificationStatus: 1, type: 1 });
orphanageSchema.index({ name: 'text', address: 'text', city: 'text' });

export const OrphanageSchema = orphanageSchema;
export const Orphanage = mongoose.models.Orphanage || mongoose.model('Orphanage', orphanageSchema);
export default Orphanage;
