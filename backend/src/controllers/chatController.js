import { Chat, User } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

// @desc    Get user's conversations
// @route   GET /api/chat
// @access  Private
export const getConversations = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    participants: req.user._id,
    isActive: true,
  })
    .populate('participants', 'name email avatar role')
    .populate('trip', 'from to departureTime')
    .populate('booking', 'status')
    .sort({ updatedAt: -1 })

  res.status(200).json({
    success: true,
    data: chats,
  })
})

// @desc    Get or create chat for a booking/trip
// @route   POST /api/chat
// @access  Private
export const getOrCreateChat = asyncHandler(async (req, res) => {
  const { bookingId, tripId, participantId } = req.body

  if (!bookingId && !tripId && !participantId) {
    return res.status(400).json({
      success: false,
      message: 'Please provide bookingId, tripId, or participantId',
    })
  }

  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, participantId] },
    ...(bookingId && { booking: bookingId }),
    ...(tripId && { trip: tripId }),
  })

  if (!chat) {
    chat = await Chat.create({
      participants: [req.user._id, participantId],
      ...(bookingId && { booking: bookingId }),
      ...(tripId && { trip: tripId }),
    })
  }

  await chat.populate('participants', 'name email avatar role')
  await chat.populate('trip', 'from to departureTime')

  res.status(200).json({
    success: true,
    data: chat,
  })
})

// @desc    Get chat messages
// @route   GET /api/chat/:chatId/messages?since=<ISO-timestamp>
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId)

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found',
    })
  }

  // Check if user is a participant
  if (!chat.participants.some((p) => p.equals(req.user._id))) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    })
  }

  // Optional `since` query param enables incremental polling — only return
  // messages newer than the timestamp. This is what makes chat work on
  // serverless platforms without WebSockets.
  const since = req.query.since ? new Date(req.query.since) : null
  let messages = chat.messages
  if (since && !Number.isNaN(since.getTime())) {
    messages = chat.messages.filter((m) => new Date(m.timestamp) > since)
  }

  res.status(200).json({
    success: true,
    data: {
      messages,
      participants: chat.participants,
      serverTime: new Date().toISOString(),
    },
  })
})

// @desc    Send message
// @route   POST /api/chat/:chatId/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { text } = req.body

  if (!text || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message text is required',
    })
  }

  const chat = await Chat.findById(req.params.chatId)

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found',
    })
  }

  // Check if user is a participant
  if (!chat.participants.some(p => p.equals(req.user._id))) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    })
  }

  const message = {
    sender: req.user._id,
    text: text.trim(),
    timestamp: new Date(),
    read: false,
  }

  chat.messages.push(message)
  chat.lastMessage = {
    text: text.trim(),
    sender: req.user._id,
    timestamp: new Date(),
  }
  await chat.save()

  // Populate sender info
  await chat.populate('messages.sender', 'name avatar')

  res.status(201).json({
    success: true,
    data: {
      message: chat.messages[chat.messages.length - 1],
      chatId: chat._id,
    },
  })
})

// @desc    Mark messages as read
// @route   PUT /api/chat/:chatId/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId)

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found',
    })
  }

  // Mark all messages except user's own as read
  chat.messages.forEach((msg) => {
    if (msg.sender.toString() !== req.user._id.toString()) {
      msg.read = true
    }
  })
  await chat.save()

  res.status(200).json({
    success: true,
    message: 'Messages marked as read',
  })
})

// @desc    Delete/close chat
// @route   DELETE /api/chat/:chatId
// @access  Private
export const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId)

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found',
    })
  }

  // Check if user is a participant
  if (!chat.participants.some(p => p.equals(req.user._id))) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    })
  }

  chat.isActive = false
  await chat.save()

  res.status(200).json({
    success: true,
    message: 'Chat deleted',
  })
})