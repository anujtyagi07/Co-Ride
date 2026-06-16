import { Trip, Booking } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
export const getTrips = asyncHandler(async (req, res) => {
  const { from, to, date, vehicleType, minPrice, maxPrice, page = 1, limit = 20 } = req.query

  // Build query
  const query = { status: 'ACTIVE' }

  // Text search for from/to
  if (from) {
    query.from = { $regex: from, $options: 'i' }
  }
  if (to) {
    query.to = { $regex: to, $options: 'i' }
  }

  // Date filter
  if (date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    query.departureTime = { $gte: startOfDay, $lte: endOfDay }
  } else {
    // Default: only show future trips
    query.departureTime = { $gte: new Date() }
  }

  // Vehicle type filter
  if (vehicleType) {
    query.vehicleType = vehicleType
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.pricePerSeat = {}
    if (minPrice) query.pricePerSeat.$gte = Number(minPrice)
    if (maxPrice) query.pricePerSeat.$lte = Number(maxPrice)
  }

  // Execute query with pagination
  const skip = (Number(page) - 1) * Number(limit)

  const [trips, total] = await Promise.all([
    Trip.find(query)
      .populate('driver', 'name rating isStudent collegeEmail')
      .sort({ departureTime: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Trip.countDocuments(query),
  ])

  res.status(200).json({
    success: true,
    count: trips.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: trips,
  })
})

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Public
export const getTripById = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate('driver', 'name rating isStudent collegeEmail phone avatar')
    .populate('passengers.user', 'name avatar')

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found',
    })
  }

  res.status(200).json({
    success: true,
    data: trip,
  })
})

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private/Driver
export const createTrip = asyncHandler(async (req, res) => {
  const { from, to, fromCoords, toCoords, departureTime, pricePerSeat, totalSeats, vehicleType, vehicleName, vehicleNumber, notes, waypoints, recurring } = req.body

  // Check if user is a driver
  if (req.user.role !== 'DRIVER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Only drivers can create trips',
    })
  }

  const tripData = {
    driver: req.user._id,
    from,
    to,
    fromCoords,
    toCoords,
    departureTime: new Date(departureTime),
    pricePerSeat,
    totalSeats,
    availableSeats: totalSeats,
    vehicleType,
    vehicleName,
    vehicleNumber,
    notes,
    status: 'ACTIVE',
    waypoints: waypoints || [],
  }

  // Estimate distance from coordinates
  if (fromCoords && toCoords) {
    const dist = Math.round(
      Math.sqrt(
        Math.pow((toCoords.lat - fromCoords.lat) * 111, 2) +
        Math.pow((toCoords.lng - fromCoords.lng) * 111 * Math.cos(fromCoords.lat * Math.PI / 180), 2)
      )
    )
    tripData.distance = dist
  }

  const trip = await Trip.create(tripData)

  // Handle recurring trips
  if (recurring && recurring.enabled) {
    const { frequency, endDate } = recurring
    const baseDate = new Date(departureTime)
    let nextDate = new Date(baseDate)
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const step = { daily: 1, weekly: 7, biweekly: 14 }[frequency] || 1
    const recurringTrips = []

    while (nextDate < end) {
      nextDate = new Date(nextDate.getTime() + step * 24 * 60 * 60 * 1000)
      if (nextDate >= end) break

      recurringTrips.push({
        driver: req.user._id,
        from, to, fromCoords, toCoords,
        departureTime: new Date(nextDate),
        pricePerSeat, totalSeats, availableSeats: totalSeats,
        vehicleType, vehicleName, vehicleNumber, notes,
        status: 'ACTIVE',
        waypoints: waypoints || [],
        distance: tripData.distance || 0,
      })
    }

    if (recurringTrips.length > 0) {
      await Trip.insertMany(recurringTrips)
    }
  }

  await trip.populate('driver', 'name rating')

  res.status(201).json({
    success: true,
    message: recurring?.enabled ? `Trip created with ${recurring.frequency} recurrence` : 'Trip created successfully',
    data: trip,
  })
})

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private/Driver
export const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found',
    })
  }

  // Check ownership
  if (!trip.driver.equals(req.user._id) && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this trip',
    })
  }

  // Cannot update if has confirmed bookings
  const hasBookings = await Booking.findOne({ trip: trip._id, status: { $in: ['CONFIRMED', 'IN_PROGRESS'] } })
  if (hasBookings) {
    return res.status(400).json({
      success: false,
      message: 'Cannot update trip with confirmed bookings',
    })
  }

  const allowedUpdates = ['from', 'to', 'fromCoords', 'toCoords', 'departureTime', 'pricePerSeat', 'notes']
  const updates = {}

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field]
    }
  })

  const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('driver', 'name rating')

  res.status(200).json({
    success: true,
    message: 'Trip updated successfully',
    data: updatedTrip,
  })
})

// @desc    Cancel trip
// @route   PUT /api/trips/:id/cancel
// @access  Private/Driver
export const cancelTrip = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const trip = await Trip.findById(req.params.id)

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found',
    })
  }

  if (!trip.driver.equals(req.user._id) && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this trip',
    })
  }

  // Cancel all pending/confirmed bookings
  await Booking.updateMany(
    { trip: trip._id, status: { $in: ['PENDING', 'CONFIRMED'] } },
    { 
      status: 'CANCELLED', 
      cancellationReason: reason || 'Trip cancelled by driver',
      cancelledBy: req.user.role,
    }
  )

  trip.status = 'CANCELLED'
  await trip.save()

  res.status(200).json({
    success: true,
    message: 'Trip cancelled successfully',
  })
})

// @desc    Get driver's trips
// @route   GET /api/trips/driver/my
// @access  Private/Driver
export const getMyTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ driver: req.user._id })
    .populate('passengers.user', 'name avatar')
    .sort({ departureTime: -1 })

  res.status(200).json({
    success: true,
    count: trips.length,
    data: trips,
  })
})

// @desc    Estimate fare for a route
// @route   POST /api/trips/estimate-fare
// @access  Public
export const estimateFare = asyncHandler(async (req, res) => {
  const { fromCoords, toCoords, vehicleType = 'CAR', seatsBooked = 1 } = req.body

  let distance = 0
  if (fromCoords && toCoords) {
    distance = Math.round(
      Math.sqrt(
        Math.pow((toCoords.lat - fromCoords.lat) * 111, 2) +
        Math.pow((toCoords.lng - fromCoords.lng) * 111 * Math.cos(fromCoords.lat * Math.PI / 180), 2)
      ) * 10
    ) / 10
  }

  // Base fare calculation
  const baseRatePerKm = { CAR: 12, BIKE: 8, AUTO: 10 }[vehicleType] || 12
  const baseFare = Math.round(distance * baseRatePerKm)
  const pricePerSeat = Math.max(50, baseFare) // Minimum Rs 50

  // Student discount
  const studentPrice = Math.round(pricePerSeat * 0.7)
  const totalPrice = pricePerSeat * seatsBooked
  const studentTotal = studentPrice * seatsBooked

  // Platform fee
  const platformFee = Math.round(totalPrice * 0.25)
  const driverEarnings = totalPrice - platformFee

  res.status(200).json({
    success: true,
    data: {
      distance: distance > 0 ? `${distance} km` : 'Unknown',
      vehicleType,
      pricePerSeat,
      studentPricePerSeat: studentPrice,
      seatsBooked,
      totalPrice,
      studentTotal,
      platformFee,
      driverEarnings,
      estimatedTime: distance > 0 ? `${Math.round(distance / 40 * 60)} min` : 'Unknown',
    },
  })
})

// @desc    Search trips (with matching engine logic)
// @route   GET /api/trips/search
// @access  Public
export const searchTrips = asyncHandler(async (req, res) => {
  const { from, to, date, radius = 10 } = req.query // radius in km

  const query = {
    status: 'ACTIVE',
    departureTime: { $gte: new Date() },
    availableSeats: { $gt: 0 },
  }

  // Text search
  if (from) query.from = { $regex: from, $options: 'i' }
  if (to) query.to = { $regex: to, $options: 'i' }

  // Date filter
  if (date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    query.departureTime = { $gte: startOfDay, $lte: endOfDay }
  }

  const trips = await Trip.find(query)
    .populate('driver', 'name rating')
    .sort({ 
      departureTime: 1,
      pricePerSeat: 1,
    })
    .limit(50)

  res.status(200).json({
    success: true,
    count: trips.length,
    data: trips,
  })
})