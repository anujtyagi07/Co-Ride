import express from 'express'
import { getTrips, getTripById, createTrip, updateTrip, cancelTrip as cancelTripByDriver, getMyTrips, searchTrips } from '../controllers/index.js'
import { estimateFare } from '../controllers/tripController.js'
import { protect, authorize } from '../middleware/index.js'

const router = express.Router()

// Public routes
router.get('/', getTrips)
router.get('/search', searchTrips)
router.post('/estimate-fare', estimateFare)
router.get('/:id', getTripById)

// Protected routes
router.get('/driver/my', protect, authorize('DRIVER', 'ADMIN'), getMyTrips)
router.post('/', protect, authorize('DRIVER', 'ADMIN'), createTrip)
router.put('/:id', protect, authorize('DRIVER', 'ADMIN'), updateTrip)
router.put('/:id/cancel', protect, authorize('DRIVER', 'ADMIN'), cancelTripByDriver)

export default router