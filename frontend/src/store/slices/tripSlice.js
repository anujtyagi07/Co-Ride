import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import tripService from '../../services/tripService'

const initialState = {
  trips: [],
  currentTrip: null,
  isLoading: false,
  error: null,
  filters: {
    from: '',
    to: '',
    date: '',
    minPrice: '',
    maxPrice: '',
    vehicleType: '',
  },
}

export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await tripService.getTrips(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trips')
    }
  }
)

export const fetchTripById = createAsyncThunk(
  'trips/fetchTripById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tripService.getTripById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trip')
    }
  }
)

export const createTrip = createAsyncThunk(
  'trips/createTrip',
  async (tripData, { rejectWithValue }) => {
    try {
      const response = await tripService.createTrip(tripData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create trip')
    }
  }
)

const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        from: '',
        to: '',
        date: '',
        minPrice: '',
        maxPrice: '',
        vehicleType: '',
      }
    },
    clearError: (state) => {
      state.error = null
    },
    clearCurrentTrip: (state) => {
      state.currentTrip = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Trips
      .addCase(fetchTrips.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.isLoading = false
        state.trips = action.payload.data || []
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Trip By ID
      .addCase(fetchTripById.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.currentTrip = null
      })
      .addCase(fetchTripById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentTrip = action.payload.data || action.payload
      })
      .addCase(fetchTripById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create Trip
      .addCase(createTrip.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentTrip = action.payload.data || action.payload
        if (action.payload.data) {
          state.trips.push(action.payload.data)
        }
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, clearFilters, clearError, clearCurrentTrip } = tripSlice.actions
export default tripSlice.reducer