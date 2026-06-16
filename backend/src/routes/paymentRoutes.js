import express from 'express'
import { createOrder, verifyPayment, getPaymentTransactions } from '../controllers/index.js'
import { protect } from '../middleware/index.js'

const router = express.Router()

router.post('/create-order', protect, createOrder)
router.post('/verify', protect, verifyPayment)
router.get('/transactions', protect, getPaymentTransactions)

export default router