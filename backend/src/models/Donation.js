import mongoose from 'mongoose';

/**
 * Donation Lifecycle Status
 */
export const DonationStatus = {
  COMPLETED: 'Completed',
  PENDING: 'Pending',
  FAILED: 'Failed',
};

/**
 * Supported Payment Methods
 */
export const PaymentMethods = [
  'UPI / PhonePe',
  'UPI / GPay',
  'Net Banking',
  'Credit Card',
];

const donationSchema = new mongoose.Schema(
  {
    receiptId: {
      type: String,
      required: [true, 'Receipt identifier is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    orphanageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Orphanage',
      required: [true, 'Orphanage reference is required'],
      index: true,
    },
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      default: null,
      index: true,
    },
    donorName: {
      type: String,
      default: 'Anonymous',
      trim: true,
    },
    donorEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid donor email address'],
    },
    amount: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [1, 'Donation amount must be at least 1'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(DonationStatus),
        message: '{VALUE} is not a valid donation status',
      },
      default: DonationStatus.COMPLETED,
      index: true,
    },
    showDonor: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PaymentMethods,
        message: '{VALUE} is not a supported payment method',
      },
      required: [true, 'Payment method is required'],
    },
    transactionId: {
      type: String,
      default: null,
      trim: true,
    },
    taxPan: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
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

// High-performance compound indexes for reports, ledgers and dashboards
donationSchema.index({ orphanageId: 1, date: -1 });
donationSchema.index({ donorId: 1, date: -1 });
donationSchema.index({ status: 1, date: -1 });
donationSchema.index({ requirementId: 1, status: 1 });

export const DonationSchema = donationSchema;
export const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);
export default Donation;
