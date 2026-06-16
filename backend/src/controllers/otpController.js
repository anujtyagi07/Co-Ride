import { OTP, Booking, Trip, User, WalletTransaction, Notification } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'
import { sendOTPEmail } from '../utils/email.js'

// Generate OTP for trip operations
const generateOTPForTrip = async (userId, tripId, bookingId, type) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  
  const otp = await OTP.create({
    user: userId,
    type,
    code,
    trip: tripId,
    booking: bookingId,
    expiresAt,
  })
  
  return otp
}

// @desc    Generate OTP for trip start (driver side)
// @route   POST /api/otp/trip-start
// @access  Private/Driver
export const requestTripStartOTP = asyncHandler(async (req, res) => {
  const { bookingId, tripId } = req.body
  
  const booking = await Booking.findById(bookingId)
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    })
  }
  
  const trip = await Trip.findById(booking.trip)
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found',
    })
  }
  
  // Verify the driver owns this trip
  if (trip.driver.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to start this trip',
    })
  }
  
  // Generate OTP
  const otp = await generateOTPForTrip(req.user._id, trip._id, booking._id, 'TRIP_START')
  
  // Send OTP via email (don't block response)
  sendOTPEmail(req.user.email, otp.code, 'trip_start')

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    data: {
      expiresAt: otp.expiresAt,
    },
  })
})

// @desc    Verify OTP and start trip
// @route   POST /api/otp/verify-trip-start
// @access  Private/Driver (only the trip's driver may start it)
export const verifyTripStartOTP = asyncHandler(async (req, res) => {
  const { bookingId, code } = req.body

  const booking = await Booking.findById(bookingId)
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    })
  }

  // Find valid OTP for this booking
  const otpRecord = await OTP.findOne({
    booking: bookingId,
    type: 'TRIP_START',
    used: false,
  })

  if (!otpRecord) {
    return res.status(400).json({
      success: false,
      message: 'No active OTP found for this booking',
    })
  }

  // Verify OTP
  if (otpRecord.code !== code) {
    otpRecord.attempts += 1
    await otpRecord.save()
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP',
    })
  }

  if (new Date() > otpRecord.expiresAt) {
    return res.status(400).json({
      success: false,
      message: 'OTP expired',
    })
  }

  // Enforce: only the driver who owns the trip may start it.
  const trip = await Trip.findById(booking.trip)
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found',
    })
  }
  if (trip.driver.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the trip driver may start this trip',
    })
  }

  // Mark OTP as used
  otpRecord.used = true
  await otpRecord.save()

  // Update booking status
  booking.status = 'IN_PROGRESS'
  booking.startTime = new Date()
  await booking.save()

  // NOTE: availableSeats was already decremented in createBooking — do NOT decrement again here.

  res.status(200).json({
    success: true,
    message: 'Trip started successfully',
    data: { booking },
  })
})

// @desc    Request OTP for completing trip
// @route   POST /api/otp/trip-end
// @access  Private/Driver
export const requestTripEndOTP = asyncHandler(async (req, res) => {
  const { bookingId } = req.body
  
  const booking = await Booking.findById(bookingId)
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    })
  }
  
  if (booking.status !== 'IN_PROGRESS') {
    return res.status(400).json({
      success: false,
      message: 'Trip is not in progress',
    })
  }
  
  const trip = await Trip.findById(booking.trip)
  if (trip.driver.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    })
  }
  
  // Generate OTP
  const otp = await generateOTPForTrip(req.user._id, trip._id, booking._id, 'TRIP_END')
  
  res.status(200).json({
    success: true,
    message: 'OTP sent to passenger',
    data: {
      expiresAt: otp.expiresAt,
      passengerId: booking.user,
    },
  })
})

// @desc    Verify OTP and end trip
// @route   POST /api/otp/verify-trip-end
// @access  Private/Driver
export const verifyTripEndOTP = asyncHandler(async (req, res) => {
  const { bookingId, code } = req.body

  const booking = await Booking.findById(bookingId)
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    })
  }

  // Enforce driver-only — fetch trip once and reuse below.
  const trip = await Trip.findById(booking.trip)
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found',
    })
  }
  if (trip.driver.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the trip driver may end this trip',
    })
  }

  const otpRecord = await OTP.findOne({
    booking: bookingId,
    type: 'TRIP_END',
    used: false,
  })

  if (!otpRecord || otpRecord.code !== code) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP',
    })
  }
  
  if (new Date() > otpRecord.expiresAt) {
    return res.status(400).json({
      success: false,
      message: 'OTP expired',
    })
  }
  
  // Mark OTP as used
  otpRecord.used = true
  await otpRecord.save()

  // Complete the booking
  booking.status = 'COMPLETED'
  booking.endTime = new Date()
  await booking.save()

  // ── Driver payout: credit 75% (driverEarnings) to driver wallet ──
  // `trip` was already loaded above for the driver-only check.
  const driverEarnings = booking.driverEarnings ?? Math.round(booking.totalPrice * 0.75)
  await User.findByIdAndUpdate(trip.driver, {
    $inc: { walletBalance: driverEarnings },
  })
  const updatedDriver = await User.findById(trip.driver)
  await WalletTransaction.create({
    user: trip.driver,
    amount: driverEarnings,
    type: 'CREDIT',
    balanceAfter: updatedDriver.walletBalance,
    description: `Trip earnings (75%): ${trip.from} → ${trip.to}`,
    booking: booking._id,
  })

  // Notify passenger
  try {
    const passenger = await User.findById(booking.user)
    await Notification.create({
      user: booking.user,
      type: 'TRIP_COMPLETED',
      title: 'Trip Completed',
      message: `Your trip ${trip.from} → ${trip.to} has been completed. Rate your driver!`,
      link: `/bookings`,
      icon: 'check-circle',
    })
  } catch (e) { console.error('Notification error:', e.message) }

  res.status(200).json({
    success: true,
    message: 'Trip completed successfully',
    data: { booking },
  })
})

// @desc    Cancel booking (user)
// @route   POST /api/otp/cancel-booking
// @access  Private
export const requestCancelBooking = asyncHandler(async (req, res) => {
  const { bookingId, reason } = req.body
  
  const booking = await Booking.findById(bookingId)
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    })
  }
  
  // Verify ownership
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    })
  }
  
  // Check if can be cancelled
  if (['COMPLETED', 'CANCELLED', 'IN_PROGRESS'].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      message: 'This booking cannot be cancelled',
    })
  }
  
  // Generate cancellation OTP
  const otp = await generateOTPForTrip(req.user._id, booking.trip, booking._id, 'BOOKING_CANCEL')
  
  res.status(200).json({
    success: true,
    message: 'Cancellation OTP sent',
    data: { expiresAt: otp.expiresAt },
  })
})

// @desc    Verify cancellation
// @route   POST /api/otp/verify-cancel-booking
// @access  Private
export const verifyCancelBooking = asyncHandler(async (req, res) => {
  const { bookingId, code } = req.body
  
  const booking = await Booking.findById(bookingId)
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    })
  }
  
  const otpRecord = await OTP.findOne({
    booking: bookingId,
    type: 'BOOKING_CANCEL',
    used: false,
  })
  
  if (!otpRecord || otpRecord.code !== code) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP',
    })
  }
  
  if (new Date() > otpRecord.expiresAt) {
    return res.status(400).json({
      success: false,
      message: 'OTP expired',
    })
  }
  
  // Mark OTP as used
  otpRecord.used = true
  await otpRecord.save()
  
  // Cancel booking and refund
  booking.status = 'CANCELLED'
  booking.cancellationReason = req.body.reason || 'User requested cancellation'
  await booking.save()
  
  // Refund to wallet (simplified)
  const user = await User.findById(booking.user)
  user.walletBalance += booking.totalPrice
  await user.save()
  
  res.status(200).json({
    success: true,
    message: 'Booking cancelled and refund initiated',
    data: { booking },
  })
})

// @desc    Cancel trip (driver)
// @route   POST /api/otp/cancel-trip
// @access  Private/Driver
export const requestCancelTrip = asyncHandler(async (req, res) => {
  const { tripId, reason } = req.body
  
  const trip = await Trip.findById(tripId)
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found',
    })
  }
  
  // Verify ownership
  if (trip.driver.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    })
  }
  
  // Generate cancellation OTP
  const otp = await generateOTPForTrip(req.user._id, trip._id, null, 'TRIP_CANCEL')
  
  res.status(200).json({
    success: true,
    message: 'Trip cancellation OTP sent',
    data: { expiresAt: otp.expiresAt },
  })
})

// @desc    Verify trip cancellation
// @route   POST /api/otp/verify-cancel-trip
// @access  Private/Driver
export const verifyCancelTrip = asyncHandler(async (req, res) => {
  const { tripId, code } = req.body

  const trip = await Trip.findById(tripId)
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found',
    })
  }

  // Driver-only — must own the trip to cancel it.
  if (trip.driver.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the trip driver may cancel this trip',
    })
  }
  
  const otpRecord = await OTP.findOne({
    trip: tripId,
    type: 'TRIP_CANCEL',
    used: false,
  })
  
  if (!otpRecord || otpRecord.code !== code) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP',
    })
  }
  
  if (new Date() > otpRecord.expiresAt) {
    return res.status(400).json({
      success: false,
      message: 'OTP expired',
    })
  }
  
  // Mark OTP as used
  otpRecord.used = true
  await otpRecord.save()
  
  // Cancel trip
  trip.status = 'CANCELLED'
  trip.cancellationReason = req.body.reason || 'Driver requested cancellation'
  await trip.save()
  
  // Cancel all pending bookings for this trip
  await Booking.updateMany(
    { trip: tripId, status: 'PENDING' },
    { 
      status: 'CANCELLED',
      cancellationReason: 'Trip cancelled by driver',
    }
  )
  
  res.status(200).json({
    success: true,
    message: 'Trip cancelled successfully',
    data: { trip },
  })
})