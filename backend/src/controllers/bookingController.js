import { Booking, Trip, User, WalletTransaction, Payment, Notification } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'
import { v4 as uuidv4 } from 'uuid'
import mongoose from 'mongoose'

// @desc    Get all bookings for user
// @route   GET /api/bookings
// @access  Private
export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate({
      path: 'trip',
      populate: { path: 'driver', select: 'name rating totalRatings avatar isStudent' },
    })
    .populate('payment')
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  })
})

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate({
      path: 'trip',
      populate: { path: 'driver', select: 'name rating totalRatings avatar isStudent' },
    })
    .populate('payment')

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    })
  }

  // Check ownership — use .toString() for ObjectId comparison since driver may be unpopulated
  if (!booking.user.equals(req.user._id) &&
      req.user.role !== 'ADMIN' &&
      booking.trip.driver?.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this booking',
    })
  }

  res.status(200).json({
    success: true,
    data: booking,
  })
})

// Helper to create booking with optional session
const createBookingWithSession = async (req, tripId, seatsBooked, pickupPoint, dropPoint, session) => {
  const trip = session ? await Trip.findById(tripId).session(session) : await Trip.findById(tripId)

  if (!trip) {
    throw new Error('Trip not found')
  }

  if (trip.status !== 'ACTIVE') {
    throw new Error('This trip is no longer available')
  }

  if (trip.availableSeats < seatsBooked) {
    throw new Error(`Only ${trip.availableSeats} seats available`)
  }

  const user = session ? await User.findById(req.user._id).session(session) : await User.findById(req.user._id)

  const basePrice = trip.pricePerSeat * seatsBooked
  let discount = 0

  if (user.isStudent && user.isVerified) {
    discount = Math.round(basePrice * 0.3)
  }

  const totalPrice = basePrice - discount
  const platformFee = Math.round(totalPrice * 0.25)
  const driverEarnings = totalPrice - platformFee

  if (user.walletBalance < totalPrice) {
    throw new Error('Insufficient wallet balance')
  }

  const chatId = uuidv4()
  const createOptions = session ? { session } : undefined

  const [newBooking] = await Booking.create([{
    trip: tripId,
    user: req.user._id,
    seatsBooked,
    basePrice,
    discount,
    totalPrice,
    platformFee,
    driverEarnings,
    status: 'PENDING',
    pickupPoint,
    dropPoint,
    chatId,
  }], createOptions)

  trip.availableSeats -= seatsBooked
  trip.passengers.push({
    user: req.user._id,
    seats: seatsBooked,
    bookingId: newBooking._id,
  })
  await (session ? trip.save({ session }) : trip.save())

  user.walletBalance -= totalPrice
  await (session ? user.save({ session, validateBeforeSave: false }) : user.save({ validateBeforeSave: false }))

  await WalletTransaction.create([{
    user: req.user._id,
    amount: totalPrice,
    type: 'DEBIT',
    balanceAfter: user.walletBalance,
    description: `Booking for ${trip.from} to ${trip.to}`,
    booking: newBooking._id,
  }], createOptions)

  const [payment] = await Payment.create([{
    user: req.user._id,
    amount: totalPrice,
    type: 'DEBIT',
    status: 'SUCCESS',
    transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    booking: newBooking._id,
    description: `Booking payment for trip ${tripId}`,
  }], createOptions)

  newBooking.payment = payment._id
  await (session ? newBooking.save({ session }) : newBooking.save())

  return newBooking
}

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
  const { tripId, seatsBooked, pickupPoint, dropPoint } = req.body

  let booking

  // Try transactional booking first; fall back to non-transactional for standalone MongoDB
  const session = await mongoose.startSession()
  try {
    booking = await session.withTransaction(async () => {
      return await createBookingWithSession(req, tripId, seatsBooked, pickupPoint, dropPoint, session)
    })
    await session.endSession()
  } catch (error) {
    await session.endSession()
    if (error.message && error.message.includes('replica set')) {
      try {
        booking = await createBookingWithSession(req, tripId, seatsBooked, pickupPoint, dropPoint, null)
      } catch (fallbackError) {
        return res.status(400).json({
          success: false,
          message: fallbackError.message || 'Failed to create booking',
        })
      }
    } else {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create booking',
      })
    }
  }

  await booking.populate('trip')
  await booking.populate('payment')

  res.status(201).json({
    success: true,
    message: 'Booking confirmed successfully',
    data: booking,
  })

  // Create notification for driver (outside transaction)
  try {
    const trip = await Trip.findById(tripId)
    await Notification.create({
      user: trip.driver,
      type: 'BOOKING_CONFIRMED',
      title: 'New Booking!',
      message: `${req.user.name} booked ${seatsBooked} seat(s) for your trip ${trip.from} → ${trip.to}`,
      link: `/trips/${tripId}`,
      icon: 'user-plus',
    })
  } catch (e) { console.error('Notification error:', e.message) }
})

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body

  const booking = await Booking.findById(req.params.id)
    .populate('trip')

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    })
  }

  // Check ownership
  if (!booking.user.equals(req.user._id) && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this booking',
    })
  }

  // Check if can be cancelled
  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel booking with status: ${booking.status}`,
    })
  }

  const trip = booking.trip

  // Refund to wallet (minus cancellation fee if within 24 hours)
  const hoursUntilDeparture = (new Date(trip.departureTime) - new Date()) / (1000 * 60 * 60)
  const cancellationFee = hoursUntilDeparture < 24 ? Math.round(booking.totalPrice * 0.1) : 0
  const refundAmount = booking.totalPrice - cancellationFee

  await User.findByIdAndUpdate(booking.user, {
    $inc: { walletBalance: refundAmount },
  })

  // Create refund transaction
  await WalletTransaction.create({
    user: booking.user,
    amount: refundAmount,
    type: 'CREDIT',
    balanceAfter: (await User.findById(booking.user)).walletBalance,
    description: cancellationFee > 0 
      ? `Booking refund (${cancellationFee} cancellation fee deducted)`
      : 'Booking refund',
    booking: booking._id,
  })

  // Update trip seats
  await Trip.findByIdAndUpdate(booking.trip._id, {
    $inc: { availableSeats: booking.seatsBooked },
    $pull: { passengers: { user: booking.user } },
  })

  // Update booking status
  booking.status = 'CANCELLED'
  booking.cancellationReason = reason || 'Cancelled by user'
  booking.cancelledBy = req.user.role
  await booking.save()

  res.status(200).json({
    success: true,
    message: `Booking cancelled. Refund of Rs. ${refundAmount} credited to wallet.`,
    data: booking,
  })

  // Notify driver
  try {
    await Notification.create({
      user: trip.driver,
      type: 'BOOKING_CANCELLED',
      title: 'Booking Cancelled',
      message: `${req.user.name} cancelled their booking for ${trip.from} → ${trip.to}`,
      link: `/trips/${trip._id}`,
      icon: 'x-circle',
    })
  } catch (e) { console.error('Notification error:', e.message) }
})

// @desc    Rate completed booking
// @route   PUT /api/bookings/:id/rate
// @access  Private
export const rateBooking = asyncHandler(async (req, res) => {
  const { rating, review } = req.body

  const booking = await Booking.findById(req.params.id)

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    })
  }

  if (booking.status !== 'COMPLETED') {
    return res.status(400).json({
      success: false,
      message: 'Can only rate completed bookings',
    })
  }

  // Check if booking belongs to user
  if (!booking.user.equals(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to rate this booking',
    })
  }

  booking.rating = rating
  booking.review = review
  await booking.save()

  // Update driver rating
  const trip = await Trip.findById(booking.trip)
  if (trip) {
    const driver = await User.findById(trip.driver)
    const totalRating = driver.rating * driver.totalRatings + rating
    driver.totalRatings += 1
    driver.rating = Math.round((totalRating / driver.totalRatings) * 10) / 10
    driver.totalRides += 1
    await driver.save()
  }

  res.status(200).json({
    success: true,
    message: 'Rating submitted successfully',
    data: booking,
  })
})

// @desc    Get my bookings as driver
// @route   GET /api/bookings/my
// @access  Private/Driver
export const getMyBookings = asyncHandler(async (req, res) => {
  // Get trips where user is driver
  const trips = await Trip.find({ driver: req.user._id })
  
  const bookings = await Booking.find({ trip: { $in: trips.map(t => t._id) } })
    .populate('trip')
    .populate('user', 'name avatar phone')
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  })
})