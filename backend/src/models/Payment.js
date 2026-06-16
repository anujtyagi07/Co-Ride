import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    method: {
      type: String,
      enum: ['WALLET', 'RAZORPAY', 'UPI', 'CARD', 'NETBANKING'],
      default: 'WALLET',
    },
    type: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    transactionId: {
      type: String,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WalletTransaction',
    },
    description: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
)

paymentSchema.index({ user: 1 })
paymentSchema.index({ razorpayPaymentId: 1 })
paymentSchema.index({ status: 1 })
paymentSchema.index({ createdAt: -1 })

const Payment = mongoose.model('Payment', paymentSchema)

export default Payment