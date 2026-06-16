import express from 'express'
import { 
  getConversations, 
  getOrCreateChat, 
  getMessages, 
  sendMessage, 
  markAsRead,
  deleteChat 
} from '../controllers/chatController.js'
import { protect } from '../middleware/index.js'

const router = express.Router()

router.use(protect)

router.get('/', getConversations)
router.post('/', getOrCreateChat)
router.get('/:chatId/messages', getMessages)
router.post('/:chatId/messages', sendMessage)
router.put('/:chatId/read', markAsRead)
router.delete('/:chatId', deleteChat)

export default router