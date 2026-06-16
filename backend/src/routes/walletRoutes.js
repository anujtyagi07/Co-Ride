import express from 'express'
import { getWallet, addMoney, withdraw, getWalletTransactions } from '../controllers/index.js'
import { protect } from '../middleware/index.js'

const router = express.Router()

router.get('/', protect, getWallet)
router.post('/add', protect, addMoney)
router.post('/withdraw', protect, withdraw)
router.get('/transactions', protect, getWalletTransactions)

export default router