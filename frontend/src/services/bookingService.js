import api from './api'

const bookingService = {
  getBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  createBooking: (data) => api.post('/bookings', data),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  getMyBookings: () => api.get('/bookings/driver/my'),
}

export default bookingService