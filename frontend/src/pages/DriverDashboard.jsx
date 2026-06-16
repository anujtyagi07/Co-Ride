import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Card, Button, Loader } from '../components/common'
import { OTPModal, OTPRequestModal, CountdownTimer } from '../components/OTPModal'
import driverService from '../services/driverService'
import otpService from '../services/otpService'
import api from '../services/api'

function DriverDashboard() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true)
  const [toggling, setToggling] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  
  // OTP Modal states
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [otpType, setOTPType] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [otpError, setOtpError] = useState(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpExpiresAt, setOtpExpiresAt] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)

  useEffect(() => {
    fetchDashboard()
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/driver/analytics')
      setAnalytics(data.data)
    } catch (err) {
      console.error('Analytics error:', err)
    }
  }

  const toggleAvailability = async () => {
    setToggling(true)
    try {
      const { data } = await api.put('/driver/availability', { isAvailable: !isAvailable })
      setIsAvailable(data.data.isAvailable)
    } catch (err) {
      console.error('Toggle error:', err)
    }
    setToggling(false)
  }

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await driverService.getDashboard()
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Request OTP for trip start
  const handleRequestStartOTP = async (booking) => {
    setSelectedBooking(booking)
    setShowRequestModal(true)
    setOTPType('TRIP_START')
    setPendingAction('start')
  }

  // Request OTP for trip end
  const handleRequestEndOTP = async (booking) => {
    setSelectedBooking(booking)
    setShowRequestModal(true)
    setOTPType('TRIP_END')
    setPendingAction('end')
  }

  // Request OTP for cancellation
  const handleRequestCancelOTP = async (booking) => {
    setSelectedBooking(booking)
    setShowRequestModal(true)
    setOTPType('BOOKING_CANCEL')
    setPendingAction('cancel')
  }

  // Request OTP for trip cancellation (driver)
  const handleRequestTripCancelOTP = async (trip) => {
    setSelectedTrip(trip)
    setShowRequestModal(true)
    setOTPType('TRIP_CANCEL')
    setPendingAction('cancelTrip')
  }

  // Send OTP request
  const sendOTPRequest = async () => {
    try {
      setOtpLoading(true)
      let response

      switch (otpType) {
        case 'TRIP_START':
          response = await otpService.requestTripStart(selectedBooking._id, selectedBooking.trip._id)
          break
        case 'TRIP_END':
          response = await otpService.requestTripEnd(selectedBooking._id)
          break
        case 'BOOKING_CANCEL':
          response = await otpService.requestCancelBooking(selectedBooking._id)
          break
        case 'TRIP_CANCEL':
          response = await otpService.requestCancelTrip(selectedTrip._id)
          break
      }

      setOtpExpiresAt(response.data.expiresAt)
      setShowRequestModal(false)
      setShowOTPModal(true)
      setOtpError(null)
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  // Verify OTP
  const verifyOTP = async (code) => {
    try {
      setOtpLoading(true)
      setOtpError(null)

      let response
      switch (otpType) {
        case 'TRIP_START':
          response = await otpService.verifyTripStart(selectedBooking._id, code)
          break
        case 'TRIP_END':
          response = await otpService.verifyTripEnd(selectedBooking._id, code)
          break
        case 'BOOKING_CANCEL':
          response = await otpService.verifyCancelBooking(selectedBooking._id, code)
          break
        case 'TRIP_CANCEL':
          response = await otpService.verifyCancelTrip(selectedTrip._id, code)
          break
      }

      // Success - close modal and refresh
      setShowOTPModal(false)
      fetchDashboard()
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  // Direct status update without OTP (for confirmed bookings)
  const handleDirectStatusUpdate = async (booking, newStatus) => {
    try {
      await driverService.updateBookingStatus(booking._id, newStatus)
      fetchDashboard()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader size="lg" />
      </div>
    )
  }

  const { stats, recentBookings, upcomingTrips } = data || {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="mt-1 text-gray-600">Manage your rides and track earnings</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                isAvailable
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
              {isAvailable ? 'Online' : 'Offline'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600">{stats?.totalTrips || 0}</div>
          <div className="text-sm text-gray-500">Total Trips</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats?.activeTrips || 0}</div>
          <div className="text-sm text-gray-500">Active Trips</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats?.totalBookings || 0}</div>
          <div className="text-sm text-gray-500">Passengers</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">₹{stats?.totalEarnings?.toFixed(0) || 0}</div>
          <div className="text-sm text-gray-500">Total Earnings</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Trips */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Trips</h2>
            <Link to="/create-trip">
              <Button size="sm">Create Trip</Button>
            </Link>
          </div>

          {upcomingTrips?.length > 0 ? (
            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <div key={trip._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{trip.from} → {trip.to}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(trip.departureTime).toLocaleString('en-IN')}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                          {trip.vehicleType}
                        </span>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          {trip.availableSeats} seats left
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {trip.status === 'ACTIVE' && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleRequestTripCancelOTP(trip)}
                        >
                          Cancel Trip
                        </Button>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        trip.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Passengers */}
                  {trip.passengers?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">Passengers:</div>
                      <div className="flex flex-wrap gap-2">
                        {trip.passengers.map((p) => (
                          <span key={p.user?._id} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                            {p.user?.name || 'Unknown'} ({p.seats})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No active trips</p>
              <Link to="/create-trip">
                <Button variant="outline" className="mt-4">Create Your First Trip</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Recent Bookings (Passengers) */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Requests</h2>
          
          {recentBookings?.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 text-sm font-bold">
                            {booking.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{booking.user?.name || 'User'}</div>
                          <div className="text-xs text-gray-500">{booking.user?.phone || 'No phone'}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {booking.trip?.from} → {booking.trip?.to}
                      </div>
                      <div className="mt-1 text-sm font-medium text-primary-600">
                        ₹{booking.totalPrice} ({booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''})
                      </div>
                      {booking.user?.isStudent && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-secondary-100 text-secondary-700 rounded-full">
                          Student
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons based on status */}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
                    {booking.status === 'PENDING' && (
                      <>
                        <Button size="sm" onClick={() => handleDirectStatusUpdate(booking, 'CONFIRMED')}>
                          Confirm
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleRequestCancelOTP(booking)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleRequestStartOTP(booking)}
                        >
                          Start Trip (OTP)
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleRequestCancelOTP(booking)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === 'IN_PROGRESS' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleRequestEndOTP(booking)}
                        >
                          End Trip (OTP)
                        </Button>
                        {otpExpiresAt && (
                          <span className="text-xs text-gray-500 self-center">
                            <CountdownTimer expiresAt={otpExpiresAt} />
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No booking requests yet</p>
              <p className="text-sm mt-2">Create a trip to start receiving bookings</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link to="/create-trip" className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
          <svg className="w-8 h-8 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-medium text-gray-900">Create Trip</span>
        </Link>
        <Link to="/live-tracking" className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
          <svg className="w-8 h-8 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium text-gray-900">Live Tracking</span>
        </Link>
        <Link to="/chat" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="font-medium text-gray-900">Messages</span>
        </Link>
        <Link to="/wallet" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
          <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="font-medium text-gray-900">Wallet</span>
        </Link>
        <Link to="/driver-verification" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
          <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-medium text-gray-900">Verification</span>
        </Link>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl p-6 border border-primary-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Completed Trips</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.completedTrips}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Passengers</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalPassengers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{analytics.avgRating?.toFixed(1)} / 5</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Earnings/Trip</p>
              <p className="text-2xl font-bold text-green-600">Rs. {analytics.avgEarningsPerTrip}</p>
            </div>
          </div>
        </div>
      )}

      {/* OTP Request Modal */}
      <OTPRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequest={sendOTPRequest}
        title={
          pendingAction === 'start' ? 'Start Trip' :
          pendingAction === 'end' ? 'End Trip' :
          pendingAction === 'cancel' ? 'Cancel Booking' :
          'Cancel Trip'
        }
        description="Request an OTP to verify this action"
        loading={otpLoading}
      />

      {/* OTP Verification Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={verifyOTP}
        title={
          otpType === 'TRIP_START' ? 'Enter OTP to Start Trip' :
          otpType === 'TRIP_END' ? 'Enter OTP to End Trip' :
          otpType === 'BOOKING_CANCEL' ? 'Enter OTP to Cancel' :
          'Enter OTP to Cancel Trip'
        }
        description="Ask the passenger to share the OTP shown in their app"
        loading={otpLoading}
        error={otpError}
        autoClose={!otpError && otpLoading}
      />
    </div>
  )
}

export default DriverDashboard