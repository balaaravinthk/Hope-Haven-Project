import mongoose from 'mongoose';

/**
 * Notification Types
 */
export const NotificationTypes = {
  VOLUNTEER_STATUS: 'volunteer_status',
  DONATION: 'donation',
  SYSTEM: 'system',
};

const notificationSchema = new mongoose.Schema(
  {
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationTypes),
      default: NotificationTypes.SYSTEM,
    },
    status: {
      type: String,
      enum: ['approved', 'rejected', 'pending', 'info', 'success'],
      default: 'info',
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    read: {
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
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Notification =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
