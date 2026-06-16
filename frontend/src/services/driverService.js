import api from './api'

export const driverService = {
  // Get driver dashboard data
  getDashboard: async () => {
    const response = await api.get('/driver/dashboard')
    return response.data
  },

  // Get driver trips
  getTrips: async () => {
    const response = await api.get('/driver/trips')
    return response.data
  },

  // Get driver bookings (passengers)
  getBookings: async () => {
    const response = await api.get('/driver/bookings')
    return response.data
  },

  // Update booking status (confirm, start, complete)
  updateBookingStatus: async (bookingId, status, otp = null) => {
    const response = await api.put(`/driver/bookings/${bookingId}/status`, {
      status,
      otp,
    })
    return response.data
  },

  // Update driver profile
  updateProfile: async (data) => {
    const response = await api.put('/driver/profile', data)
    return response.data
  },

  // Upload document
  uploadDocument: async (documentType, fileUrl) => {
    const response = await api.post('/driver/upload', {
      documentType,
      fileUrl,
    })
    return response.data
  },

  // Get verification status
  getVerificationStatus: async () => {
    const response = await api.get('/driver/verification-status')
    return response.data
  },

  // Update location
  updateLocation: async (lat, lng) => {
    const response = await api.put('/driver/location', { lat, lng })
    return response.data
  },
}

export default driverService