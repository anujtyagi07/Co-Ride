import express from 'express'
import {
  getAllUsers, getUserById, updateUserRole, deleteUser, suspendUser,
  verifyStudent as adminVerifyStudent, manualVerifyDriver,
  getPendingDrivers, approveDriver, rejectDriver,
  getAllTrips, cancelTrip,
  getAllBookings, cancelBooking as cancelAdminBooking,
  getAllWalletTransactions, adminAddWalletMoney,
  getStats,
} from '../controllers/index.js'
import { protect, authorize } from '../middleware/index.js'

const router = express.Router()

// All admin routes require ADMIN role
router.use(protect, authorize('ADMIN'))

// Stats
router.get('/stats', getStats)

// Users
router.get('/users', getAllUsers)
router.get('/users/:id', getUserById)
router.put('/users/:id/role', updateUserRole)
router.put('/users/:id/verify', adminVerifyStudent)          // toggle student verify
router.put('/users/:id/verify-driver', manualVerifyDriver)   // manually approve/reject driver
router.put('/users/:id/suspend', suspendUser)
router.delete('/users/:id', deleteUser)

// Driver approval queue
router.get('/drivers/pending', getPendingDrivers)
router.put('/drivers/:id/approve', approveDriver)
router.put('/drivers/:id/reject', rejectDriver)

// Trips
router.get('/trips', getAllTrips)
router.put('/trips/:id/cancel', cancelTrip)

// Bookings
router.get('/bookings', getAllBookings)
router.put('/bookings/:id/cancel', cancelAdminBooking)

// Wallet
router.get('/wallet', getAllWalletTransactions)
router.post('/wallet/add', adminAddWalletMoney)             // admin test top-up

export default router
