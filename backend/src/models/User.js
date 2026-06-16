import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['USER', 'DRIVER', 'ADMIN'],
      default: 'USER',
    },
    isStudent: {
      type: Boolean,
      default: false,
    },
    collegeEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    collegeId: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalRides: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    refreshToken: {
      type: String,
      select: false,
    },
    // Driver verification
    isDriverVerified: {
      type: Boolean,
      default: false,
    },
    driverDocuments: {
      aadharFront: { type: String, default: '' },
      aadharBack: { type: String, default: '' },
      drivingLicense: { type: String, default: '' },
      vehicleRC: { type: String, default: '' },
      vehicleInsurance: { type: String, default: '' },
      vehiclePhotos: [{ type: String }],
    },
    driverStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    // Admin moderation
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedReason: {
      type: String,
      trim: true,
      default: '',
    },

    // Location for tracking
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date },
    },
    // Driver availability toggle
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Password reset OTP
    resetPasswordOTP: {
      type: String,
      select: false,
    },
    resetPasswordOTPExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Update rating
userSchema.methods.updateRating = function (newRating) {
  const totalSum = this.rating * this.totalRatings + newRating
  this.totalRatings += 1
  this.rating = Math.round((totalSum / this.totalRatings) * 10) / 10
}

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.refreshToken
  delete obj.__v
  return obj
}

const User = mongoose.model('User', userSchema)

export default User