import express from 'express'
import { 
  requestTripStartOTP,
  verifyTripStartOTP,
  requestTripEndOTP,
  verifyTripEndOTP,
  requestCancelBooking,
  verifyCancelBooking,
  requestCancelTrip,
  verifyCancelTrip,
} from '../controllers/otpController.js'
import { protect, authorize } from '../middleware/index.js'

const router = express.Router()

router.use(protect)

// Trip start OTP (Driver)
router.post('/trip-start', authorize('DRIVER', 'ADMIN'), requestTripStartOTP)
router.post('/verify-trip-start', verifyTripStartOTP)

// Trip end OTP (Driver)
router.post('/trip-end', authorize('DRIVER', 'ADMIN'), requestTripEndOTP)
router.post('/verify-trip-end', verifyTripEndOTP)

// Booking cancellation OTP (User)
router.post('/cancel-booking', requestCancelBooking)
router.post('/verify-cancel-booking', verifyCancelBooking)

// Trip cancellation OTP (Driver)
router.post('/cancel-trip', authorize('DRIVER', 'ADMIN'), requestCancelTrip)
router.post('/verify-cancel-trip', verifyCancelTrip)

export default router