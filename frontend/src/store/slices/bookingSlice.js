import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import bookingService from '../../services/bookingService'

const initialState = {
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,
}

export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookings()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings')
    }
  }
)

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchBookingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookingById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking')
    }
  }
)

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingService.createBooking(bookingData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking')
    }
  }
)

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await bookingService.cancelBooking(id)
      dispatch(fetchBookings())
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking')
    }
  }
)

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bookings
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.isLoading = false
        state.bookings = action.payload.data || []
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Booking By ID
      .addCase(fetchBookingById.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.currentBooking = null
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentBooking = action.payload.data || action.payload
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentBooking = action.payload.data || action.payload
        if (action.payload.data) {
          state.bookings.push(action.payload.data)
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelBooking.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentBooking } = bookingSlice.actions
export default bookingSlice.reducer