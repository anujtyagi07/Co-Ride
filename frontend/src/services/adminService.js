import api from './api'

const adminService = {
  // Stats
  getStats: () => api.get('/admin/stats'),

  // Users
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  suspendUser: (id, reason) => api.put(`/admin/users/${id}/suspend`, { reason }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Drivers
  getPendingDrivers: (params = {}) => api.get('/admin/drivers/pending', { params }),
  approveDriver: (id) => api.put(`/admin/drivers/${id}/approve`),
  rejectDriver: (id, reason) => api.put(`/admin/drivers/${id}/reject`, { reason }),

  // Trips
  getAllTrips: (params = {}) => api.get('/admin/trips', { params }),
  cancelTrip: (id, reason) => api.put(`/admin/trips/${id}/cancel`, { reason }),

  // Bookings
  getAllBookings: (params = {}) => api.get('/admin/bookings', { params }),
  cancelBooking: (id, reason) => api.put(`/admin/bookings/${id}/cancel`, { reason }),

  // Wallet
  getWalletTransactions: (params = {}) => api.get('/admin/wallet', { params }),
  adminAddWalletMoney: (userId, amount, note) => api.post('/admin/wallet/add', { userId, amount, note }),

  // Manual verification
  verifyStudent: (id, verified) => api.put(`/admin/users/${id}/verify`, { verified }),
  manualVerifyDriver: (id, approved, reason) => api.put(`/admin/users/${id}/verify-driver`, { approved, reason }),
}

export default adminService
