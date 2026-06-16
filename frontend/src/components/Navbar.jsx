import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { logout, clearError } from '../store/slices/authSlice'
import api from '../services/api'

function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount()
      const interval = setInterval(loadUnreadCount, 30000) // Poll every 30s
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const loadUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications?unreadOnly=true&limit=1')
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      // Ignore
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Co-Ride</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {!user || user.role !== 'DRIVER' ? (
              <Link to="/trips" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Find Rides
              </Link>
            ) : null}
            {user?.role === 'DRIVER' && (
              <Link to="/create-trip" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Create Trip
              </Link>
            )}
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  Dashboard
                </Link>
                {user?.role === 'DRIVER' && (
                  <Link to="/driver-dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                    Driver
                  </Link>
                )}
                <Link to="/bookings" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  My Bookings
                </Link>
                <Link to="/wallet" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  Wallet
                </Link>
                <Link to="/chat" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  Chat
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/notifications" className="relative text-gray-600 hover:text-primary-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center space-x-2">
                  <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar