import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Button, Loader } from '../components/common'
import { OTPModal } from '../components/OTPModal'
import RatingModal from '../components/RatingModal'
import { fetchBookings } from '../store/slices/bookingSlice'
import otpService from '../services/otpService'

function Bookings() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { bookings, isLoading } = useSelector((state) => state.bookings)
  const [filter, setFilter] = useState('all')
  const [cancelReason, setCancelReason] = useState('')
  const [otpModal, setOtpModal] = useState({ open: false, bookingId: null })
  const [otpError, setOtpError] = useState(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpExpiresAt, setOtpExpiresAt] = useState(null)
  const [ratingModal, setRatingModal] = useState({ open: false, bookingId: null })

  useEffect(() => {
    dispatch(fetchBookings())
  }, [dispatch])

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true
    return booking.status.toLowerCase() === filter.toLowerCase()
  })

  const handleCancelClick = async (bookingId) => {
    try {
      setOtpLoading(true)
      const response = await otpService.requestCancelBooking(bookingId)
      setOtpExpiresAt(response.data.expiresAt)
      setOtpModal({ open: true, bookingId })
      setOtpError(null)
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Failed to request cancellation')
    } finally {
      setOtpLoading(false)
    }
  }

  const verifyCancelOTP = async (code) => {
    try {
      setOtpLoading(true)
      await otpService.verifyCancelBooking(otpModal.bookingId, code, cancelReason)
      setOtpModal({ open: false, bookingId: null })
      dispatch(fetchBookings())
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING:     'bg-yellow-100 text-yellow-800',
      CONFIRMED:   'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED:   'bg-gray-100 text-gray-700',
      CANCELLED:   'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">Track and manage your ride bookings</p>
        </div>
        <Link to="/trips">
          <Button>Find New Rides</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking._id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-lg">
                        {booking.trip?.driver?.name?.charAt(0) || 'D'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {booking.trip?.from || 'Unknown'} to {booking.trip?.to || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Driver: {booking.trip?.driver?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Date</span>
                      <p className="font-medium text-gray-900">
                        {booking.trip?.departureTime
                          ? new Date(booking.trip.departureTime).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Time</span>
                      <p className="font-medium text-gray-900">
                        {booking.trip?.departureTime
                          ? new Date(booking.trip.departureTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Seats</span>
                      <p className="font-medium text-gray-900">{booking.seatsBooked}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total</span>
                      <p className="font-bold text-primary-600">Rs. {booking.totalPrice}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelClick(booking._id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Cancel with OTP
                    </Button>
                  )}
                  {booking.status === 'COMPLETED' && !booking.rating && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRatingModal({ open: true, bookingId: booking._id })}
                      className="text-yellow-600 hover:bg-yellow-50"
                    >
                      Rate Trip
                    </Button>
                  )}
                </div>
              </div>

              {booking.status === 'COMPLETED' && booking.rating && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Your rating:</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < (booking.rating || 0)
                              ? 'text-yellow-500'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? "You haven't made any bookings yet"
              : `No ${filter} bookings`}
          </p>
          <Link to="/trips">
            <Button>Find a Ride</Button>
          </Link>
        </div>
      )}

      {/* Cancel OTP Modal */}
      <OTPModal
        isOpen={otpModal.open}
        onClose={() => setOtpModal({ open: false, bookingId: null })}
        onVerify={verifyCancelOTP}
        title="Verify Cancellation"
        description="Enter the OTP sent to your registered number to confirm cancellation"
        loading={otpLoading}
        error={otpError}
      />

      {/* Rating Modal */}
      {ratingModal.open && (
        <RatingModal
          bookingId={ratingModal.bookingId}
          onClose={() => setRatingModal({ open: false, bookingId: null })}
          onSuccess={() => dispatch(fetchBookings())}
        />
      )}
    </div>
  )
}

export default Bookings