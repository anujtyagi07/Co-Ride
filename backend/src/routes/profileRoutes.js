import express from 'express'
import { protect } from '../middleware/index.js'
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getTripHistory,
  deleteAccount,
} from '../controllers/profileController.js'

const router = express.Router()

router.get('/', protect, getProfile)
router.put('/', protect, updateProfile)
router.put('/password', protect, changePassword)
router.post('/avatar', protect, uploadAvatar)
router.get('/history', protect, getTripHistory)
router.delete('/', protect, deleteAccount)

export default router
