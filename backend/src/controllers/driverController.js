import { User, Trip, Booking } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

/**
 * @desc    Get driver dashboard stats
 * @route   GET /api/driver/dashboard
 * @access  Private/Driver
 */
export const getDriverDashboard = asyncHandler(async (req, res) => {
  const driverId = req.user._id

  // Get driver's trips
  const trips = await Trip.find({ driver: driverId })
  const activeTrips = trips.filter(t => t.status === 'ACTIVE')
  const completedTrips = trips.filter(t => t.status === 'COMPLETED')

  // Get all bookings for driver's trips
  const tripIds = trips.map(t => t._id)
  const bookings = await Booking.find({ trip: { $in: tripIds } })
    .populate('user', 'name avatar phone')
    .populate('trip')

  // Calculate stats
  const totalEarnings = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.driverEarnings ?? Math.round(b.totalPrice * 0.75)), 0)

  const pendingBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED')
  const activeBookings = bookings.filter(b => b.status === 'IN_PROGRESS')

  res.json({
    success: true,
    data: {
      stats: {
        totalTrips: trips.length,
        activeTrips: activeTrips.length,
        completedTrips: completedTrips.length,
        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        activeBookings: activeBookings.length,
        totalEarnings,
      },
      recentBookings: bookings.slice(0, 10),
      upcomingTrips: activeTrips.sort((a, b) => 
        new Date(a.departureTime) - new Date(b.departureTime)
      ).slice(0, 5),
    },
  })
})

/**
 * @desc    Get driver bookings (passengers for driver's trips)
 * @route   GET /api/driver/bookings
 * @access  Private/Driver
 */
export const getDriverBookings = asyncHandler(async (req, res) => {
  const driverId = req.user._id

  // Get all trips for driver
  const trips = await Trip.find({ driver: driverId }).select('_id')
  const tripIds = trips.map(t => t._id)

  // Get all bookings for those trips
  const bookings = await Booking.find({ trip: { $in: tripIds } })
    .populate('user', 'name avatar phone email isStudent')
    .populate('trip', 'from to departureTime pricePerSeat vehicleType')
    .sort({ createdAt: -1 })

  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  })
})

/**
 * @desc    Update booking status (confirm/start trip/end trip)
 * @route   PUT /api/driver/bookings/:id/status
 * @access  Private/Driver
 */
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, otp } = req.body
  const bookingId = req.params.id

  const booking = await Booking.findById(bookingId)
    .populate('trip')
    .populate('user', 'name phone')

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    })
  }

  // Verify driver owns this booking's trip
  if (booking.trip.driver.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    })
  }

  // Handle different status updates
  switch (status) {
    case 'CONFIRMED':
      if (booking.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Booking cannot be confirmed',
        })
      }
      booking.status = 'CONFIRMED'
      break

    case 'IN_PROGRESS':
      if (booking.status !== 'CONFIRMED') {
        return res.status(400).json({
          success: false,
          message: 'Booking must be confirmed first',
        })
      }
      // Verify OTP before starting
      // TODO: Integrate with OTP system
      booking.status = 'IN_PROGRESS'
      booking.startTime = new Date()
      break

    case 'COMPLETED':
      if (booking.status !== 'IN_PROGRESS') {
        return res.status(400).json({
          success: false,
          message: 'Trip must be in progress',
        })
      }
      booking.status = 'COMPLETED'
      booking.endTime = new Date()

      // Update driver stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalRides: 1 },
      })
      break

    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      })
  }

  await booking.save()

  res.json({
    success: true,
    message: `Booking ${status.toLowerCase()}`,
    data: booking,
  })
})

/**
 * @desc    Update driver profile with verification documents
 * @route   PUT /api/driver/profile
 * @access  Private/Driver
 */
export const updateDriverProfile = asyncHandler(async (req, res) => {
  const { 
    aadharFront, 
    aadharBack, 
    drivingLicense, 
    vehicleRC, 
    vehicleInsurance, 
    vehiclePhotos,
    isStudent,
    collegeEmail,
  } = req.body

  const updates = {
    'driverDocuments.aadharFront': aadharFront,
    'driverDocuments.aadharBack': aadharBack,
    'driverDocuments.drivingLicense': drivingLicense,
    'driverDocuments.vehicleRC': vehicleRC,
    'driverDocuments.vehicleInsurance': vehicleInsurance,
    'driverDocuments.vehiclePhotos': vehiclePhotos,
  }

  // Handle student verification
  if (isStudent !== undefined) {
    updates.isStudent = isStudent
    if (isStudent && collegeEmail) {
      updates.collegeEmail = collegeEmail
      // Verify college email domain
      const emailDomain = collegeEmail.split('@')[1]
      const { verifyCollegeEmail } = await import('../utils/colleges.js')
      const verification = verifyCollegeEmail(collegeEmail)
      
      if (verification.valid) {
        updates.isVerified = true
        updates.collegeId = verification.college.name
      }
    }
  }

  const driver = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  )

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: driver,
  })
})

/**
 * @desc    Upload driver document
 * @route   POST /api/driver/upload
 * @access  Private/Driver
 */
export const uploadDriverDocument = asyncHandler(async (req, res) => {
  const { documentType, fileUrl } = req.body

  if (!fileUrl) {
    return res.status(400).json({
      success: false,
      message: 'File URL is required',
    })
  }

  const validDocumentTypes = [
    'aadharFront', 
    'aadharBack', 
    'drivingLicense', 
    'vehicleRC', 
    'vehicleInsurance'
  ]

  if (!validDocumentTypes.includes(documentType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid document type',
    })
  }

  const updateField = `driverDocuments.${documentType}`
  const driver = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { [updateField]: fileUrl } },
    { new: true }
  )

  res.json({
    success: true,
    message: 'Document uploaded successfully',
    data: {
      documentType,
      fileUrl,
    },
  })
})

/**
 * @desc    Get driver's trips
 * @route   GET /api/driver/trips
 * @access  Private/Driver
 */
export const getDriverTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ driver: req.user._id })
    .populate('passengers.user', 'name avatar phone')
    .populate('passengers.bookingId')
    .sort({ departureTime: -1 })

  res.json({
    success: true,
    count: trips.length,
    data: trips,
  })
})

/**
 * @desc    Update driver location (for real-time tracking)
 * @route   PUT /api/driver/location
 * @access  Private/Driver
 */
export const updateDriverLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required',
    })
  }

  await User.findByIdAndUpdate(req.user._id, {
    currentLocation: {
      lat,
      lng,
      updatedAt: new Date(),
    },
  })

  res.json({
    success: true,
    message: 'Location updated',
  })
})

/**
 * @desc    Get driver's verification status
 * @route   GET /api/driver/verification-status
 * @access  Private/Driver
 */
export const getVerificationStatus = asyncHandler(async (req, res) => {
  const driver = await User.findById(req.user._id)
    .select('isDriverVerified driverStatus driverDocuments isStudent isVerified isAvailable')

  const hasAllDocuments = 
    driver.driverDocuments?.aadharFront &&
    driver.driverDocuments?.aadharBack &&
    driver.driverDocuments?.drivingLicense &&
    driver.driverDocuments?.vehicleRC

  res.json({
    success: true,
    data: {
      isVerified: driver.isDriverVerified,
      status: driver.driverStatus,
      hasAllDocuments,
      documents: {
        aadharFront: !!driver.driverDocuments?.aadharFront,
        aadharBack: !!driver.driverDocuments?.aadharBack,
        drivingLicense: !!driver.driverDocuments?.drivingLicense,
        vehicleRC: !!driver.driverDocuments?.vehicleRC,
        vehicleInsurance: !!driver.driverDocuments?.vehicleInsurance,
      },
      isStudent: driver.isStudent,
      studentVerified: driver.isVerified,
      isAvailable: driver.isAvailable,
    },
  })
})

/**
 * @desc    Toggle driver availability (online/offline)
 * @route   PUT /api/driver/availability
 * @access  Private/Driver
 */
export const toggleAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body

  const driver = await User.findByIdAndUpdate(
    req.user._id,
    { isAvailable: isAvailable !== undefined ? isAvailable : !req.user.isAvailable },
    { new: true }
  ).select('name isAvailable currentLocation')

  res.json({
    success: true,
    message: driver.isAvailable ? 'You are now online' : 'You are now offline',
    data: driver,
  })
})

/**
 * @desc    Get driver trip history + analytics
 * @route   GET /api/driver/analytics
 * @access  Private/Driver
 */
export const getDriverAnalytics = asyncHandler(async (req, res) => {
  const driverId = req.user._id
  const { startDate, endDate } = req.query

  const dateFilter = {}
  if (startDate || endDate) {
    dateFilter.createdAt = {}
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate)
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate)
  }

  const trips = await Trip.find({ driver: driverId, ...dateFilter })
  const tripIds = trips.map(t => t._id)
  const bookings = await Booking.find({ trip: { $in: tripIds } })

  // Analytics calculations
  const totalEarnings = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.driverEarnings ?? Math.round(b.totalPrice * 0.75)), 0)

  const totalPassengers = bookings.filter(b => b.status === 'COMPLETED').reduce((sum, b) => sum + b.seatsBooked, 0)

  const completedTrips = trips.filter(t => t.status === 'COMPLETED')
  const avgRating = req.user.rating || 0

  // Monthly breakdown
  const monthlyEarnings = {}
  bookings.filter(b => b.status === 'COMPLETED').forEach(b => {
    const month = new Date(b.createdAt).toISOString().slice(0, 7)
    const earning = b.driverEarnings ?? Math.round(b.totalPrice * 0.75)
    monthlyEarnings[month] = (monthlyEarnings[month] || 0) + earning
  })

  res.json({
    success: true,
    data: {
      totalTrips: trips.length,
      completedTrips: completedTrips.length,
      cancelledTrips: trips.filter(t => t.status === 'CANCELLED').length,
      activeTrips: trips.filter(t => t.status === 'ACTIVE').length,
      totalEarnings,
      totalPassengers,
      avgRating,
      totalRatings: req.user.totalRatings,
      monthlyEarnings,
      avgEarningsPerTrip: completedTrips.length > 0 ? Math.round(totalEarnings / completedTrips.length) : 0,
    },
  })
})