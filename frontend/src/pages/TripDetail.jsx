import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Button, Input, Loader } from '../components/common'
import { OpenStreetMap, MapPlaceholder } from '../components/OpenStreetMap'
import { OTPModal, OTPRequestModal } from '../components/OTPModal'
import { fetchTripById } from '../store/slices/tripSlice'
import { createBooking } from '../store/slices/bookingSlice'
import otpService from '../services/otpService'
import api from '../services/api'
import { calculateDistance } from '../components/MapComponents'
import { coordsFromCityString } from '../utils/cityCoords'

function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentTrip, isLoading } = useSelector((state) => state.trips)
  const { isLoading: bookingLoading, error: bookingError } = useSelector((state) => state.bookings)
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [seats, setSeats] = useState(1)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelOTP, setCancelOTP] = useState(null)
  const [otpError, setOtpError] = useState(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [routeInfo, setRouteInfo] = useState(null)
  const [localBookingError, setLocalBookingError] = useState(null)

  useEffect(() => {
    if (id) {
      dispatch(fetchTripById(id))
    }
  }, [id, dispatch])

  useEffect(() => {
    if (!currentTrip) return
    const resolvedFrom = currentTrip.fromCoords || coordsFromCityString(currentTrip.from)
    const resolvedTo   = currentTrip.toCoords   || coordsFromCityString(currentTrip.to)
    if (resolvedFrom && resolvedTo) {
      const fromLat = resolvedFrom.lat ?? resolvedFrom[0]
      const fromLng = resolvedFrom.lng ?? resolvedFrom[1]
      const toLat   = resolvedTo.lat   ?? resolvedTo[0]
      const toLng   = resolvedTo.lng   ?? resolvedTo[1]
      const dist = calculateDistance(fromLat, fromLng, toLat, toLng)
      setRouteInfo({
        distance: dist,
        duration: Math.round(dist * 2),
      })
    }
  }, [currentTrip?.fromCoords, currentTrip?.toCoords, currentTrip?.from, currentTrip?.to])

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setLocalBookingError(null)
    const result = await dispatch(createBooking({
      tripId: id,
      seatsBooked: seats,
    }))

    if (createBooking.fulfilled.match(result)) {
      navigate('/bookings')
    } else {
      setLocalBookingError(result.payload || 'Booking failed')
    }
  }

  const handleCancelBooking = async () => {
    try {
      setOtpLoading(true)
      const response = await otpService.requestCancelBooking(id)
      setCancelOTP({ expiresAt: response.data.expiresAt })
      setShowCancelModal(true)
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
      await otpService.verifyCancelBooking(id, code)
      setShowCancelModal(false)
      navigate('/bookings')
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader size="lg" />
      </div>
    )
  }

  if (!currentTrip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h2>
        <Button onClick={() => navigate('/trips')}>Browse Trips</Button>
      </div>
    )
  }

  const totalPrice = currentTrip.pricePerSeat * seats

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={() => navigate('/trips')} className="mb-6">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Trips
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Driver Info */}
          <Card>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-bold text-2xl">
                  {currentTrip.driver?.name?.charAt(0) || 'D'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{currentTrip.driver?.name || 'Driver'}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {currentTrip.driver?.rating || '4.8'} Rating
                  {currentTrip.driver?.totalRatings > 0 && (
                    <span className="text-sm text-gray-500">({currentTrip.driver.totalRatings} ratings)</span>
                  )}
                </div>
                {currentTrip.driver?.isStudent && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full">
                    Verified Student
                  </span>
                )}
              </div>
            </div>

            {/* Route */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">From</div>
                  <div className="font-medium text-gray-900 text-lg">{currentTrip.from}</div>
                  {currentTrip.fromCoords && (
                    <div className="text-sm text-gray-500">Coordinates: {currentTrip.fromCoords.lat}, {currentTrip.fromCoords.lng}</div>
                  )}
                </div>
              </div>
              <div className="ml-4 border-l-2 border-dashed border-gray-300 h-8" />
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-secondary-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">To</div>
                  <div className="font-medium text-gray-900 text-lg">{currentTrip.to}</div>
                  {currentTrip.toCoords && (
                    <div className="text-sm text-gray-500">Coordinates: {currentTrip.toCoords.lat}, {currentTrip.toCoords.lng}</div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Trip Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Vehicle Type</div>
                <div className="font-medium text-gray-900">{currentTrip.vehicleType || 'Car'}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Distance</div>
                <div className="font-medium text-gray-900">{routeInfo ? `${routeInfo.distance.toFixed(1)}` : (currentTrip.distance || 'N/A')} km</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Available Seats</div>
                <div className="font-medium text-gray-900">{currentTrip.availableSeats}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Status</div>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  currentTrip.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentTrip.status}
                </span>
              </div>
            </div>

            {currentTrip.notes && (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Driver's Notes</div>
                <div className="text-gray-900">{currentTrip.notes}</div>
              </div>
            )}
          </Card>

          {/* Map with Route */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Map</h3>
            {(() => {
              // Use stored coords first; fall back to city-name lookup for older trips
              const resolvedFrom = currentTrip.fromCoords || coordsFromCityString(currentTrip.from)
              const resolvedTo   = currentTrip.toCoords   || coordsFromCityString(currentTrip.to)
              return resolvedFrom && resolvedTo ? (
                <OpenStreetMap
                  fromCoords={resolvedFrom}
                  toCoords={resolvedTo}
                  fromName={currentTrip.from}
                  toName={currentTrip.to}
                  height="300px"
                />
              ) : (
                <MapPlaceholder
                  height="300px"
                  message="Route map will appear when coordinates are available"
                />
              )
            })()}
            {routeInfo && (
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">{routeInfo.distance.toFixed(1)} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">{routeInfo.duration} mins</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Booking Sidebar */}
        <div>
          <Card className="sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Book This Ride</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Seats</label>
              <select
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value))}
                className="input-field"
              >
                {[...Array(Math.min(currentTrip.availableSeats, 5))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Price per seat</span>
                <span className="font-medium">Rs. {currentTrip.pricePerSeat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of seats</span>
                <span className="font-medium">x {seats}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl text-primary-600">Rs. {totalPrice}</span>
              </div>
            </div>

            {user?.isStudent && (
              <div className="mb-4 p-3 bg-secondary-50 rounded-lg text-sm text-secondary-700">
                Student discount will be applied at checkout
              </div>
            )}

            {(bookingError || localBookingError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {bookingError || localBookingError}
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleBooking}
              loading={bookingLoading}
              disabled={currentTrip.availableSeats === 0}
            >
              {currentTrip.availableSeats === 0 ? 'Fully Booked' : 'Book Now'}
            </Button>

            {currentTrip.passengers?.some(p => p.user?.toString() === user?._id?.toString()) && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={handleCancelBooking}
              >
                Cancel Booking
              </Button>
            )}

            {!isAuthenticated && (
              <p className="mt-3 text-sm text-gray-500 text-center">
                Please <a href="/login" className="text-primary-600">login</a> to book
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Cancel Booking OTP Modal */}
      <OTPModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onVerify={verifyCancelOTP}
        title="Cancel Booking"
        description="Enter OTP to confirm cancellation"
        loading={otpLoading}
        error={otpError}
      />
    </div>
  )
}

export default TripDetail