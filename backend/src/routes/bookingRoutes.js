import express from 'express'
import { getBookings, getBookingById, createBooking, cancelBooking, rateBooking, getMyBookings } from '../controllers/index.js'
import { protect, authorize } from '../middleware/index.js'

const router = express.Router()

// User routes
router.get('/', protect, getBookings)
router.get('/:id', protect, getBookingById)
router.post('/', protect, createBooking)
router.put('/:id/cancel', protect, cancelBooking)
router.put('/:id/rate', protect, rateBooking)

// Driver routes
router.get('/driver/my', protect, authorize('DRIVER', 'ADMIN'), getMyBookings)

export default router