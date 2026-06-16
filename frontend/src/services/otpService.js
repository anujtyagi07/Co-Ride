import api from './api'

export const otpService = {
  // Trip start OTP (Driver)
  requestTripStart: async (bookingId, tripId) => {
    const response = await api.post('/otp/trip-start', { bookingId, tripId })
    return response.data
  },
  
  verifyTripStart: async (bookingId, code) => {
    const response = await api.post('/otp/verify-trip-start', { bookingId, code })
    return response.data
  },

  // Trip end OTP (Driver)
  requestTripEnd: async (bookingId) => {
    const response = await api.post('/otp/trip-end', { bookingId })
    return response.data
  },
  
  verifyTripEnd: async (bookingId, code) => {
    const response = await api.post('/otp/verify-trip-end', { bookingId, code })
    return response.data
  },

  // Booking cancellation OTP (User)
  requestCancelBooking: async (bookingId, reason = '') => {
    const response = await api.post('/otp/cancel-booking', { bookingId, reason })
    return response.data
  },
  
  verifyCancelBooking: async (bookingId, code, reason = '') => {
    const response = await api.post('/otp/verify-cancel-booking', { bookingId, code, reason })
    return response.data
  },

  // Trip cancellation OTP (Driver)
  requestCancelTrip: async (tripId, reason = '') => {
    const response = await api.post('/otp/cancel-trip', { tripId, reason })
    return response.data
  },
  
  verifyCancelTrip: async (tripId, code, reason = '') => {
    const response = await api.post('/otp/verify-cancel-trip', { tripId, code, reason })
    return response.data
  },
}

export default otpService