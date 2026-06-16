import { User, WalletTransaction } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

// @desc    Get wallet
// @route   GET /api/wallet
// @access  Private
export const getWallet = asyncHandler(async (req, res) => {
  const transactions = await WalletTransaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)

  res.status(200).json({
    success: true,
    data: {
      balance: req.user.walletBalance,
      transactions,
    },
  })
})

// @desc    Add money to wallet
// @route   POST /api/wallet/add
// @access  Private
export const addMoney = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Direct wallet top-up is not supported. Please use the Razorpay payment flow.',
    })
  }

  const amount = Number(req.body.amount)

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid amount',
    })
  }

  // Update user wallet balance
  req.user.walletBalance += amount
  await req.user.save()

  // Create transaction record
  const transaction = await WalletTransaction.create({
    user: req.user._id,
    amount,
    type: 'CREDIT',
    balanceAfter: req.user.walletBalance,
    description: 'Wallet top-up',
  })

  res.status(200).json({
    success: true,
    message: `Rs. ${amount} added to wallet`,
    data: {
      balance: req.user.walletBalance,
      transactions: await WalletTransaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(10),
    },
  })
})

// @desc    Withdraw from wallet
// @route   POST /api/wallet/withdraw
// @access  Private
export const withdraw = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Wallet withdrawal is not currently supported.',
    })
  }

  const { accountDetails } = req.body
  const amount = Number(req.body.amount)

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid amount',
    })
  }

  if (req.user.walletBalance < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient balance',
    })
  }

  // In production, integrate with payment gateway for withdrawal
  // For now, just deduct and record
  
  req.user.walletBalance -= amount
  await req.user.save()

  await WalletTransaction.create({
    user: req.user._id,
    amount,
    type: 'DEBIT',
    balanceAfter: req.user.walletBalance,
    description: 'Withdrawal requested',
  })

  res.status(200).json({
    success: true,
    message: 'Withdrawal request submitted',
    data: {
      balance: req.user.walletBalance,
    },
  })
})

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
export const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const [transactions, total] = await Promise.all([
    WalletTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    WalletTransaction.countDocuments({ user: req.user._id }),
  ])

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: transactions,
  })
})