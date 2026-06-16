import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'BOOKING_CONFIRMED',
        'BOOKING_CANCELLED',
        'TRIP_STARTED',
        'TRIP_COMPLETED',
        'TRIP_CANCELLED',
        'PAYMENT_RECEIVED',
        'PAYMENT_DEBITED',
        'CHAT_MESSAGE',
        'RATING_RECEIVED',
        'VERIFICATION_APPROVED',
        'VERIFICATION_REJECTED',
        'SYSTEM',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'bell',
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
)

notificationSchema.index({ user: 1, read: 1 })
notificationSchema.index({ user: 1, createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
