import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Button } from '../components/common'
import { fetchBookings } from '../store/slices/bookingSlice'
import { fetchWallet } from '../store/slices/walletSlice'

function Dashboard() {
  const { user } = useSelector((state) => state.auth)
  const { bookings } = useSelector((state) => state.bookings)
  const { balance } = useSelector((state) => state.wallet)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchBookings())
    dispatch(fetchWallet())
  }, [dispatch])

  const recentBookings = bookings.slice(0, 3) || []
  const upcomingBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').slice(0, 3) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="mt-1 text-gray-600">
          {user?.role === 'DRIVER' 
            ? 'Manage your rides and track earnings' 
            : 'Find your next ride and manage bookings'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-4xl font-bold text-primary-600 mb-2">
            Rs. {balance.toFixed(2)}
          </div>
          <div className="text-gray-600">Wallet Balance</div>
          <Link to="/wallet">
            <Button variant="ghost" size="sm" className="mt-2">Add Money</Button>
          </Link>
        </Card>

        <Card className="text-center">
          <div className="text-4xl font-bold text-secondary-600 mb-2">
            {upcomingBookings.length}
          </div>
          <div className="text-gray-600">Upcoming Rides</div>
          <Link to="/bookings">
            <Button variant="ghost" size="sm" className="mt-2">View All</Button>
          </Link>
        </Card>

        <Card className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {bookings.length}
          </div>
          <div className="text-gray-600">Total Rides</div>
          <Link to="/trips">
            <Button variant="ghost" size="sm" className="mt-2">Find Rides</Button>
          </Link>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Bookings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Rides</h2>
            <Link to="/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{booking.trip?.from} to {booking.trip?.to}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(booking.trip?.departureTime).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">Rs. {booking.totalPrice}</div>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No upcoming rides</p>
              <Link to="/trips">
                <Button variant="outline" className="mt-4">Find a Ride</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Driver Section - Create Trip */}
        {(user?.role === 'DRIVER' || user?.role === 'ADMIN') && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Driver Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/driver-dashboard" className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                <svg className="w-8 h-8 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium text-gray-900">Driver Dashboard</span>
              </Link>
              <Link to="/create-trip" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium text-gray-900">Create Trip</span>
              </Link>
              <Link to="/driver-verification" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium text-gray-900">Verification</span>
              </Link>
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    booking.status === 'COMPLETED' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      booking.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={booking.status === 'COMPLETED' 
                          ? "M5 13l4 4L19 7" 
                          : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} 
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{booking.trip?.from} to {booking.trip?.to}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">Rs. {booking.totalPrice}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/trips" className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              <svg className="w-8 h-8 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium text-gray-900">Find Rides</span>
            </Link>
            <Link to="/bookings" className="p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
              <svg className="w-8 h-8 text-secondary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium text-gray-900">My Bookings</span>
            </Link>
            <Link to="/wallet" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="font-medium text-gray-900">Wallet</span>
            </Link>
            <Link to="/chat" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium text-gray-900">Chat</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard