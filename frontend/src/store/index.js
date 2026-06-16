import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import tripReducer from './slices/tripSlice'
import bookingReducer from './slices/bookingSlice'
import walletReducer from './slices/walletSlice'
import adminReducer from './slices/adminSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trips: tripReducer,
    bookings: bookingReducer,
    wallet: walletReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store