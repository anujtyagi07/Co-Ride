import { User, Payment, WalletTransaction } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

// Initialize Razorpay (optional - will work without it)
let razorpay = null
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = (await import('razorpay')).default
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
} catch (error) {
  console.log('Razorpay not configured, will use wallet-only mode')
}

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR' } = req.body

  if (!razorpay) {
    return res.status(400).json({
      success: false,
      message: 'Payment gateway not configured',
    })
  }

  const options = {
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency,
    receipt: `rcpt_${Date.now()}`,
  }

  const order = await razorpay.orders.create(options)

  res.status(200).json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    },
  })
})

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({
      success: false,
      message: 'Missing payment verification fields',
    })
  }

  // 1. Verify HMAC signature first — client cannot forge this without key_secret.
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (razorpaySignature !== expectedSignature) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment signature',
    })
  }

  // 2. ALWAYS fetch the canonical amount + status from Razorpay.
  // Never trust any amount the client sends — a malicious caller could
  // otherwise top up their wallet for free by replaying a signature.
  if (!razorpay) {
    return res.status(503).json({
      success: false,
      message: 'Payment gateway not configured',
    })
  }

  let razorpayOrder
  let razorpayPayment
  try {
    [razorpayOrder, razorpayPayment] = await Promise.all([
      razorpay.orders.fetch(razorpayOrderId),
      razorpay.payments.fetch(razorpayPaymentId),
    ])
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Could not verify payment with gateway',
    })
  }

  if (razorpayOrder.status !== 'paid' || razorpayPayment.status !== 'captured') {
    return res.status(400).json({
      success: false,
      message: `Payment not completed (order: ${razorpayOrder.status}, payment: ${razorpayPayment.status})`,
    })
  }

  // 3. Reject if this payment was already credited (idempotency)
  const existing = await Payment.findOne({ razorpayPaymentId })
  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'Payment already verified',
      data: { payment: existing, balance: req.user.walletBalance },
    })
  }

  // 4. Use the server-confirmed amount (paise → rupees)
  const amount = razorpayOrder.amount / 100

  // Add money to wallet
  req.user.walletBalance += amount
  await req.user.save()

  // Create transaction
  const transaction = await WalletTransaction.create({
    user: req.user._id,
    amount,
    type: 'CREDIT',
    balanceAfter: req.user.walletBalance,
    description: 'Wallet top-up via Razorpay',
  })

  // Create payment record
  const payment = await Payment.create({
    user: req.user._id,
    amount,
    type: 'CREDIT',
    status: 'SUCCESS',
    method: 'RAZORPAY',
    transactionId: `TXN-${Date.now()}-${uuidv4().split('-')[0]}`,
    razorpayPaymentId,
    razorpayOrderId,
    description: 'Wallet top-up',
    wallet: transaction._id,
  })

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: {
      payment,
      balance: req.user.walletBalance,
    },
  })
})

// @desc    Get transactions
// @route   GET /api/payments/transactions
// @access  Private
export const getTransactions = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)

  res.status(200).json({
    success: true,
    data: payments,
  })
})