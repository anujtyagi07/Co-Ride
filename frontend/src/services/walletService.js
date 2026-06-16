import api from './api'

const walletService = {
  getWallet: () => api.get('/wallet'),
  addMoney: (data) => api.post('/wallet/add', data),
  withdraw: (data) => api.post('/wallet/withdraw', data),
  getTransactions: () => api.get('/wallet/transactions'),
}

export default walletService