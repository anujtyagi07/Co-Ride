import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const iconMap = {
  'user-plus': '👤',
  'x-circle': '❌',
  'check-circle': '✅',
  'bell': '🔔',
  'wallet': '💰',
  'message-circle': '💬',
  'star': '⭐',
}

const typeColors = {
  BOOKING_CONFIRMED: 'bg-green-100 text-green-700 border-green-200',
  BOOKING_CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  TRIP_STARTED: 'bg-blue-100 text-blue-700 border-blue-200',
  TRIP_COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  TRIP_CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  PAYMENT_RECEIVED: 'bg-green-100 text-green-700 border-green-200',
  PAYMENT_DEBITED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CHAT_MESSAGE: 'bg-purple-100 text-purple-700 border-purple-200',
  RATING_RECEIVED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  SYSTEM: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | unread

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const params = filter === 'unread' ? '?unreadOnly=true' : ''
      const { data } = await api.get(`/notifications${params}`)
      setNotifications(data.data || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      console.error('Notifications error:', err)
    }
    setLoading(false)
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Mark read error:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Mark all read error:', err)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {filter === 'all' ? 'Show Unread' : 'Show All'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1 text-sm bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-lg transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <span className="text-4xl">🔔</span>
          <p className="text-gray-500 mt-3">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-start space-x-3 p-4 rounded-xl border transition-all ${
                !n.read ? 'bg-white border-primary-200 shadow-sm' : 'bg-gray-50 border-gray-100'
              } ${typeColors[n.type] || 'border-gray-200'}`}
            >
              <span className="text-2xl mt-1">{iconMap[n.icon] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {n.title}
                  </h3>
                  <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {n.link && (
                    <Link
                      to={n.link}
                      onClick={() => !n.read && markAsRead(n._id)}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      View details
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-xs text-gray-500 hover:text-primary-600"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n._id)}
                    className="text-xs text-gray-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
