import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import walletService from '../../services/walletService'

const initialState = {
  balance: 0,
  transactions: [],
  isLoading: false,
  error: null,
}

export const fetchWallet = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getWallet()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet')
    }
  }
)

export const addMoney = createAsyncThunk(
  'wallet/addMoney',
  async (amount, { rejectWithValue }) => {
    try {
      const response = await walletService.addMoney({ amount })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add money')
    }
  }
)

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wallet
      .addCase(fetchWallet.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.isLoading = false
        const data = action.payload.data || action.payload
        state.balance = data.balance || 0
        state.transactions = data.transactions || []
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Add Money
      .addCase(addMoney.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addMoney.fulfilled, (state, action) => {
        state.isLoading = false
        const data = action.payload.data || action.payload
        state.balance = data.balance || state.balance
        state.transactions = data.transactions || state.transactions
      })
      .addCase(addMoney.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = walletSlice.actions
export default walletSlice.reducer