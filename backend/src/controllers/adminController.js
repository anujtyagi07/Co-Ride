import { User, Trip, Booking, WalletTransaction } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

// ─── Users ────────────────────────────────────────────────────────────────────

// @desc    Get all users (paginated + searchable + filterable)
// @route   GET /api/admin/users?page&limit&search&role&pending&suspended
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, pending, suspended } = req.query
  const skip = (Math.max(1, Number(page)) - 1) * Number(limit)

  const filter = {}
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ]
  }
  if (role) filter.role = role
  if (pending === 'true') { filter.isStudent = true; filter.isVerified = false }
  if (suspended === 'true') filter.isSuspended = true

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: users.map((u) => u.toJSON()),
  })
})

// @desc    Get full user detail (profile + booking history + trip history + wallet)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })

  // Booking history (last 20)
  const bookings = await Booking.find({ user: user._id })
    .populate('trip', 'from to departureTime pricePerSeat status')
    .sort({ createdAt: -1 })
    .limit(20)

  // Trip history if driver (last 20)
  const trips = user.role === 'DRIVER'
    ? await Trip.find({ driver: user._id }).sort({ createdAt: -1 }).limit(20)
    : []

  // Wallet transactions (last 20)
  const transactions = await WalletTransaction.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(20)

  // Earnings summary (drivers)
  const earningsSummary = user.role === 'DRIVER'
    ? await Booking.aggregate([
        {
          $lookup: { from: 'trips', localField: 'trip', foreignField: '_id', as: 'tripData' },
        },
        { $unwind: '$tripData' },
        {
          $match: {
            'tripData.driver': user._id,
            status: 'COMPLETED',
          },
        },
        {
          $group: {
            _id: null,
            totalEarned: { $sum: '$driverEarnings' },
            totalRides: { $sum: 1 },
          },
        },
      ])
    : []

  res.status(200).json({
    success: true,
    data: {
      user: user.toJSON(),
      bookings,
      trips,
      transactions,
      earningsSummary: earningsSummary[0] || { totalEarned: 0, totalRides: 0 },
    },
  })
})

// @desc    Update user role (prevents demoting last admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  if (!['USER', 'DRIVER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' })
  }

  const target = await User.findById(req.params.id)
  if (!target) return res.status(404).json({ success: false, message: 'User not found' })

  if (target.role === 'ADMIN' && role !== 'ADMIN') {
    const adminCount = await User.countDocuments({ role: 'ADMIN' })
    if (adminCount <= 1) {
      return res.status(400).json({ success: false, message: 'Cannot demote the last admin' })
    }
  }

  target.role = role
  await target.save()

  res.status(200).json({ success: true, data: target.toJSON() })
})

// @desc    Suspend or unsuspend a user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
export const suspendUser = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  if (user._id.equals(req.user._id)) {
    return res.status(400).json({ success: false, message: 'Cannot suspend your own account' })
  }

  user.isSuspended = !user.isSuspended
  user.suspendedReason = user.isSuspended ? (reason || 'Suspended by admin') : ''
  await user.save()

  res.status(200).json({
    success: true,
    message: user.isSuspended ? 'User suspended' : 'User unsuspended',
    data: user.toJSON(),
  })
})

// @desc    Toggle student verification (verify ↔ unverify)
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
export const verifyStudent = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  // Support boolean true/false and string "true"/"false" from body; fallback to toggle
  const { verified } = req.body
  if (verified !== undefined && verified !== null && verified !== '') {
    user.isVerified = verified === true || verified === 'true' || verified === 1 || verified === '1'
  } else {
    user.isVerified = !user.isVerified
  }
  await user.save()
  res.status(200).json({
    success: true,
    message: user.isVerified ? 'Student verified' : 'Student verification revoked',
    data: user.toJSON(),
  })
})

// @desc    Manually verify or reject a driver (bypasses pending queue)
// @route   PUT /api/admin/users/:id/verify-driver
// @access  Private/Admin
export const manualVerifyDriver = asyncHandler(async (req, res) => {
  const { approved, reason } = req.body          // approved: true | false
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  if (user.role !== 'DRIVER') {
    return res.status(400).json({ success: false, message: 'User is not a driver' })
  }

  if (approved) {
    user.driverStatus = 'APPROVED'
    user.isDriverVerified = true
  } else {
    user.driverStatus = 'REJECTED'
    user.isDriverVerified = false
    if (reason) user.suspendedReason = reason
  }
  await user.save()
  res.status(200).json({
    success: true,
    message: approved ? 'Driver approved' : 'Driver rejected',
    data: user.toJSON(),
  })
})

// @desc    Admin adds test money to any user's wallet
// @route   POST /api/admin/wallet/add
// @access  Private/Admin
export const adminAddWalletMoney = asyncHandler(async (req, res) => {
  const { userId, amount, note } = req.body
  const parsedAmount = Number(amount)

  if (!userId) return res.status(400).json({ success: false, message: 'userId is required' })
  if (!parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Provide a valid positive amount' })
  }

  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })

  user.walletBalance += parsedAmount
  await user.save()

  await WalletTransaction.create({
    user: user._id,
    amount: parsedAmount,
    type: 'CREDIT',
    balanceAfter: user.walletBalance,
    description: `Admin top-up${note ? `: ${note}` : ' (test funds)'}`,
  })

  res.status(200).json({
    success: true,
    message: `₹${parsedAmount} added to ${user.name}'s wallet`,
    data: { userId: user._id, name: user.name, newBalance: user.walletBalance },
  })
})

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  if (user._id.equals(req.user._id)) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' })
  }
  await user.deleteOne()
  res.status(200).json({ success: true, message: 'User deleted' })
})

// ─── Driver Management ────────────────────────────────────────────────────────

// @desc    Get drivers pending document approval
// @route   GET /api/admin/drivers/pending?page&limit
// @access  Private/Admin
export const getPendingDrivers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15 } = req.query
  const skip = (Math.max(1, Number(page)) - 1) * Number(limit)

  // Also match existing drivers where driverStatus was never set (pre-dates the field)
  const filter = { role: 'DRIVER', $or: [{ driverStatus: 'PENDING' }, { driverStatus: { $exists: false } }] }

  const [drivers, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    count: drivers.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: drivers.map((d) => d.toJSON()),
  })
})

// @desc    Approve driver documents
// @route   PUT /api/admin/drivers/:id/approve
// @access  Private/Admin
export const approveDriver = asyncHandler(async (req, res) => {
  const driver = await User.findById(req.params.id)
  if (!driver || driver.role !== 'DRIVER') {
    return res.status(404).json({ success: false, message: 'Driver not found' })
  }
  driver.driverStatus = 'APPROVED'
  driver.isDriverVerified = true
  await driver.save()
  res.status(200).json({ success: true, message: 'Driver approved', data: driver.toJSON() })
})

// @desc    Reject driver documents
// @route   PUT /api/admin/drivers/:id/reject
// @access  Private/Admin
export const rejectDriver = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const driver = await User.findById(req.params.id)
  if (!driver || driver.role !== 'DRIVER') {
    return res.status(404).json({ success: false, message: 'Driver not found' })
  }
  driver.driverStatus = 'REJECTED'
  driver.isDriverVerified = false
  driver.suspendedReason = reason || 'Documents rejected'
  await driver.save()
  res.status(200).json({ success: true, message: 'Driver rejected', data: driver.toJSON() })
})

// ─── Trips ────────────────────────────────────────────────────────────────────

// @desc    Get all trips (paginated, filterable, searchable)
// @route   GET /api/admin/trips?page&limit&status&search&dateFrom&dateTo
// @access  Private/Admin
export const getAllTrips = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, status, search, dateFrom, dateTo } = req.query
  const skip = (Math.max(1, Number(page)) - 1) * Number(limit)

  const filter = {}
  if (status) filter.status = status
  if (search) {
    filter.$or = [
      { from: { $regex: search, $options: 'i' } },
      { to: { $regex: search, $options: 'i' } },
    ]
  }
  if (dateFrom || dateTo) {
    filter.departureTime = {}
    if (dateFrom) filter.departureTime.$gte = new Date(dateFrom)
    if (dateTo) filter.departureTime.$lte = new Date(dateTo)
  }

  const [trips, total] = await Promise.all([
    Trip.find(filter)
      .populate('driver', 'name email phone rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Trip.countDocuments(filter),
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

// @desc    Cancel any trip + refund all active passengers
// @route   PUT /api/admin/trips/:id/cancel
// @access  Private/Admin
export const cancelTrip = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const trip = await Trip.findById(req.params.id)
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' })
  if (trip.status === 'CANCELLED') {
    return res.status(400).json({ success: false, message: 'Trip already cancelled' })
  }

  const activeBookings = await Booking.find({
    trip: trip._id,
    status: { $in: ['PENDING', 'CONFIRMED'] },
  })

  for (const booking of activeBookings) {
    await User.findByIdAndUpdate(booking.user, { $inc: { walletBalance: booking.totalPrice } })
    const u = await User.findById(booking.user)
    await WalletTransaction.create({
      user: booking.user,
      amount: booking.totalPrice,
      type: 'CREDIT',
      balanceAfter: u.walletBalance,
      description: `Refund: Admin cancelled trip ${trip.from} → ${trip.to}. ${reason || ''}`,
      booking: booking._id,
    })
    booking.status = 'CANCELLED'
    booking.cancellationReason = `Admin cancelled: ${reason || 'No reason'}`
    booking.cancelledBy = 'ADMIN'
    await booking.save()
  }

  trip.status = 'CANCELLED'
  await trip.save()

  res.status(200).json({
    success: true,
    message: `Trip cancelled. ${activeBookings.length} booking(s) refunded.`,
  })
})

// ─── Bookings ─────────────────────────────────────────────────────────────────

// @desc    Get all bookings (paginated, filterable, searchable)
// @route   GET /api/admin/bookings?page&limit&status&search&dateFrom&dateTo
// @access  Private/Admin
export const getAllBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, status, search, dateFrom, dateTo } = req.query
  const skip = (Math.max(1, Number(page)) - 1) * Number(limit)

  // Build base filter
  const filter = {}
  if (status) filter.status = status
  if (dateFrom || dateTo) {
    filter.createdAt = {}
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
    if (dateTo) filter.createdAt.$lte = new Date(dateTo)
  }

  // Text search requires user lookup first
  let userIds
  if (search) {
    const matchedUsers = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id')
    userIds = matchedUsers.map((u) => u._id)
    filter.user = { $in: userIds }
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('trip', 'from to departureTime pricePerSeat status driver')
      .populate('user', 'name email phone')
      .populate('payment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: bookings,
  })
})

// @desc    Cancel individual booking + full refund
// @route   PUT /api/admin/bookings/:id/cancel
// @access  Private/Admin
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const booking = await Booking.findById(req.params.id).populate('trip')
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel booking with status ${booking.status}`,
    })
  }

  await User.findByIdAndUpdate(booking.user, { $inc: { walletBalance: booking.totalPrice } })
  const u = await User.findById(booking.user)
  await WalletTransaction.create({
    user: booking.user,
    amount: booking.totalPrice,
    type: 'CREDIT',
    balanceAfter: u.walletBalance,
    description: `Admin refund: ${reason || 'Booking cancelled by admin'}`,
    booking: booking._id,
  })

  await Trip.findByIdAndUpdate(booking.trip._id, {
    $inc: { availableSeats: booking.seatsBooked },
    $pull: { passengers: { bookingId: booking._id } },
  })

  booking.status = 'CANCELLED'
  booking.cancellationReason = reason || 'Cancelled by admin'
  booking.cancelledBy = 'ADMIN'
  await booking.save()

  res.status(200).json({
    success: true,
    message: `Booking cancelled. ₹${booking.totalPrice} refunded.`,
    data: booking,
  })
})

// ─── Wallet ───────────────────────────────────────────────────────────────────

// @desc    Get all platform wallet transactions
// @route   GET /api/admin/wallet?page&limit&type&userId&dateFrom&dateTo
// @access  Private/Admin
export const getAllWalletTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, userId, dateFrom, dateTo } = req.query
  const skip = (Math.max(1, Number(page)) - 1) * Number(limit)

  const filter = {}
  if (type) filter.type = type
  if (userId) filter.user = userId
  if (dateFrom || dateTo) {
    filter.createdAt = {}
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
    if (dateTo) filter.createdAt.$lte = new Date(dateTo)
  }

  const [transactions, total] = await Promise.all([
    WalletTransaction.find(filter)
      .populate('user', 'name email')
      .populate('booking', 'status totalPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    WalletTransaction.countDocuments(filter),
  ])

  // Summary for the current filter
  const summary = await WalletTransaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ])

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    summary,
    data: transactions,
  })
})

// ─── Stats ────────────────────────────────────────────────────────────────────

// @desc    Comprehensive platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const [
    totalUsers, totalDrivers, totalPassengers, totalAdmins,
    suspendedUsers, pendingVerifications, pendingDriverApprovals,
    totalTrips, activeTrips, completedTrips, cancelledTrips,
    totalBookings, pendingBookings, confirmedBookings,
    inProgressBookings, completedBookings, cancelledBookings,
    platformRevenueResult, driverEarningsResult, totalRevenueResult,
    monthlyRevenueRaw, topDriversRaw,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'DRIVER' }),
    User.countDocuments({ role: 'USER' }),
    User.countDocuments({ role: 'ADMIN' }),
    User.countDocuments({ isSuspended: true }),
    User.countDocuments({ isStudent: true, isVerified: false }),
    User.countDocuments({ role: 'DRIVER', $or: [{ driverStatus: 'PENDING' }, { driverStatus: { $exists: false } }] }),
    Trip.countDocuments(),
    Trip.countDocuments({ status: 'ACTIVE' }),
    Trip.countDocuments({ status: 'COMPLETED' }),
    Trip.countDocuments({ status: 'CANCELLED' }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'PENDING' }),
    Booking.countDocuments({ status: 'CONFIRMED' }),
    Booking.countDocuments({ status: 'IN_PROGRESS' }),
    Booking.countDocuments({ status: 'COMPLETED' }),
    Booking.countDocuments({ status: 'CANCELLED' }),
    Booking.aggregate([{ $match: { status: 'COMPLETED' } }, { $group: { _id: null, total: { $sum: '$platformFee' } } }]),
    Booking.aggregate([{ $match: { status: 'COMPLETED' } }, { $group: { _id: null, total: { $sum: '$driverEarnings' } } }]),
    Booking.aggregate([{ $match: { status: 'COMPLETED' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Booking.aggregate([
      { $match: { status: 'COMPLETED', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, platformRevenue: { $sum: '$platformFee' }, grossRevenue: { $sum: '$totalPrice' }, bookings: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Booking.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: '$trip', totalEarnings: { $sum: '$driverEarnings' }, rides: { $sum: 1 } } },
      { $lookup: { from: 'trips', localField: '_id', foreignField: '_id', as: 'tripData' } },
      { $unwind: '$tripData' },
      { $group: { _id: '$tripData.driver', totalEarnings: { $sum: '$totalEarnings' }, totalRides: { $sum: '$rides' } } },
      { $sort: { totalEarnings: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'driver' } },
      { $unwind: '$driver' },
      { $project: { driverName: '$driver.name', driverEmail: '$driver.email', totalEarnings: 1, totalRides: 1 } },
    ]),
  ])

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers, drivers: totalDrivers, passengers: totalPassengers,
        admins: totalAdmins, suspended: suspendedUsers,
        pendingVerifications, pendingDriverApprovals,
      },
      trips: { total: totalTrips, active: activeTrips, completed: completedTrips, cancelled: cancelledTrips },
      bookings: {
        total: totalBookings, pending: pendingBookings, confirmed: confirmedBookings,
        inProgress: inProgressBookings, completed: completedBookings, cancelled: cancelledBookings,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
      },
      revenue: {
        gross: totalRevenueResult[0]?.total || 0,
        platform: platformRevenueResult[0]?.total || 0,
        drivers: driverEarningsResult[0]?.total || 0,
        platformShare: 25,
        monthly: monthlyRevenueRaw.map((m) => ({
          label: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
          platformRevenue: m.platformRevenue,
          grossRevenue: m.grossRevenue,
          bookings: m.bookings,
        })),
        topDrivers: topDriversRaw,
      },
    },
  })
})
