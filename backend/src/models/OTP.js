import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['TRIP_START', 'TRIP_END', 'BOOKING_CONFIRM', 'PAYMENT', 'VERIFICATION'],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
otpSchema.index({ user: 1, type: 1 })
otpSchema.index({ code: 1 })
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index - auto delete expired

// Generate 6-digit OTP
otpSchema.statics.generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Static method to create OTP for trip start
otpSchema.statics.createTripStartOTP = async function (userId, tripId, bookingId) {
  const code = this.generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  const otp = await this.create({
    user: userId,
    type: 'TRIP_START',
    code,
    trip: tripId,
    booking: bookingId,
    expiresAt,
  })

  return otp
}

// Verify OTP
otpSchema.methods.verify = function (code) {
  if (this.used) return { valid: false, message: 'OTP already used' }
  if (new Date() > this.expiresAt) return { valid: false, message: 'OTP expired' }
  if (this.attempts >= 3) return { valid: false, message: 'Too many attempts' }
  if (this.code !== code) {
    this.attempts += 1
    this.save()
    return { valid: false, message: 'Invalid OTP' }
  }
  return { valid: true }
}

const OTP = mongoose.model('OTP', otpSchema)

export default OTP