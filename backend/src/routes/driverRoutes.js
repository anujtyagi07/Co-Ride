import express from 'express'
import {
  getDriverDashboard,
  getDriverBookings,
  updateBookingStatus,
  updateDriverProfile,
  uploadDriverDocument,
  getDriverTrips,
  updateDriverLocation,
  getVerificationStatus,
  toggleAvailability,
  getDriverAnalytics,
} from '../controllers/driverController.js'
import { protect, authorize } from '../middleware/index.js'

const router = express.Router()

// All routes require authentication and driver role
router.use(protect)
router.use(authorize('DRIVER', 'ADMIN'))

// Dashboard and stats
router.get('/dashboard', getDriverDashboard)

// Trips management
router.get('/trips', getDriverTrips)

// Bookings management
router.get('/bookings', getDriverBookings)
router.put('/bookings/:id/status', updateBookingStatus)

// Profile and documents
router.put('/profile', updateDriverProfile)
router.post('/upload', uploadDriverDocument)
router.get('/verification-status', getVerificationStatus)

// Location tracking
router.put('/location', updateDriverLocation)

// Availability toggle
router.put('/availability', toggleAvailability)

// Analytics
router.get('/analytics', getDriverAnalytics)

export default router