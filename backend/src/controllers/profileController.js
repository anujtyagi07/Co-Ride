import { User, Trip, Booking, WalletTransaction } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'
import { sendWelcomeEmail, sendOTPEmail } from '../utils/email.js'
import crypto from 'crypto'

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken')
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  // Get stats
  const bookings = await Booking.countDocuments({ user: user._id })
  const completedBookings = await Booking.countDocuments({ user: user._id, status: 'COMPLETED' })
  const tripsAsDriver = await Trip.countDocuments({ driver: user._id })

  res.status(200).json({
    success: true,
    data: {
      user,
      stats: {
        totalBookings: bookings,
        completedBookings,
        tripsAsDriver,
        walletBalance: user.walletBalance,
      },
    },
  })
})

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body

  const updateFields = {}
  if (name && name.trim().length >= 2) updateFields.name = name.trim()
  if (phone !== undefined) updateFields.phone = phone.trim()
  if (avatar !== undefined) updateFields.avatar = avatar

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select('-password -refreshToken')

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  })
})

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current and new password are required',
    })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters',
    })
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password')

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    })
  }

  user.password = newPassword
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  })
})

// @desc    Upload avatar
// @route   POST /api/profile/avatar
// @access  Private
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.body.avatar) {
    return res.status(400).json({ success: false, message: 'Avatar data required' })
  }

  // Accept base64 data URL
  const avatar = req.body.avatar

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true }
  ).select('-password -refreshToken')

  res.status(200).json({
    success: true,
    message: 'Avatar updated',
    data: user,
  })
})

// @desc    Get trip history for current user
// @route   GET /api/profile/history
// @access  Private
export const getTripHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query

  // As passenger
  const bookings = await Booking.find({ user: req.user._id })
    .populate({
      path: 'trip',
      select: 'from to departureTime pricePerSeat status vehicleType',
    })
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))

  const total = await Booking.countDocuments({ user: req.user._id })

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: bookings,
  })
})

// @desc    Delete account (soft delete)
// @route   DELETE /api/profile
// @access  Private
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body

  const user = await User.findById(req.user._id).select('+password')
  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Password is incorrect' })
  }

  // Soft delete
  user.isSuspended = true
  user.suspendedReason = 'Account deleted by user'
  user.refreshToken = ''
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  })
})
