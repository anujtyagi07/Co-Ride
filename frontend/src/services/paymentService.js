import api from './api'

const paymentService = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  getTransactions: () => api.get('/payments/transactions'),
}

export default paymentService