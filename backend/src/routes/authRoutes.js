import express from 'express'
import rateLimit from 'express-rate-limit'
import { register, login, getProfile, updateProfile, changePassword, refreshToken, logout, verifyStudent, forgotPassword, resetPassword } from '../controllers/index.js'
import { protect } from '../middleware/index.js'

const router = express.Router()

// Strict rate limit for credential endpoints — 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password', authLimiter, resetPassword)
router.post('/refresh', refreshToken)
router.post('/logout', protect, logout)

router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)
router.put('/change-password', protect, changePassword)
router.post('/verify-student', protect, verifyStudent)

export default router