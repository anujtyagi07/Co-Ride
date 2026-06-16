import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    seatsBooked: {
      type: Number,
      required: [true, 'Number of seats is required'],
      min: [1, 'At least 1 seat must be booked'],
    },
    basePrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      default: 0, // 25% of totalPrice — collected as website revenue
    },
    driverEarnings: {
      type: Number,
      default: 0, // 75% of totalPrice — credited to driver on completion
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    pickupPoint: {
      type: String,
      trim: true,
    },
    dropPoint: {
      type: String,
      trim: true,
    },
    chatId: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: String,
      enum: ['USER', 'DRIVER', 'ADMIN'],
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
bookingSchema.index({ trip: 1 })
bookingSchema.index({ user: 1 })
bookingSchema.index({ status: 1 })
bookingSchema.index({ createdAt: -1 })

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking