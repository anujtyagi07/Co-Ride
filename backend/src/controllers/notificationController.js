import { Notification } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

// Helper: create notification
export const createNotification = async (userId, data) => {
  try {
    return await Notification.create({
      user: userId,
      ...data,
    })
  } catch (err) {
    console.error('Notification create failed:', err.message)
  }
}

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly, limit = 50 } = req.query
  const query = { user: req.user._id }
  if (unreadOnly === 'true') query.read = false

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    read: false,
  })

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications,
  })
})

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  )

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' })
  }

  res.status(200).json({ success: true, data: notification })
})

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  )

  res.status(200).json({ success: true, message: 'All notifications marked as read' })
})

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  })

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' })
  }

  res.status(200).json({ success: true, message: 'Notification deleted' })
})
