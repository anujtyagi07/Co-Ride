import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'
import { setAuthToken } from '../../services/api'

// Initialize auth state from localStorage
const getInitialState = () => {
  try {
    const token = localStorage.getItem('co-ride-token')
    const refreshToken = localStorage.getItem('co-ride-refresh-token')
    const user = JSON.parse(localStorage.getItem('co-ride-user') || 'null')
    
    if (token && user) {
      setAuthToken(token)
      return {
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    }
  } catch (e) {
    console.error('Error loading auth from localStorage:', e)
  }
  
  return {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }
}

const initialState = getInitialState()

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login({ email, password })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout()
  } catch (error) {
    // Ignore logout errors
  }
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
    setAuth: (state, action) => {
      const { user, token, refreshToken } = action.payload
      state.user = user
      state.token = token
      state.refreshToken = refreshToken
      state.isAuthenticated = true
    },
    setToken: (state, action) => {
      const { token, refreshToken } = action.payload
      state.token = token
      if (refreshToken) state.refreshToken = refreshToken
      setAuthToken(token)
      localStorage.setItem('co-ride-token', token)
      if (refreshToken) localStorage.setItem('co-ride-refresh-token', refreshToken)
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        const { user, token, refreshToken } = action.payload.data
        state.user = user
        state.token = token
        state.refreshToken = refreshToken
        state.isAuthenticated = true
        
        // Save to localStorage
        localStorage.setItem('co-ride-token', token)
        localStorage.setItem('co-ride-refresh-token', refreshToken)
        localStorage.setItem('co-ride-user', JSON.stringify(user))
        setAuthToken(token)
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        const { user, token, refreshToken } = action.payload.data
        state.user = user
        state.token = token
        state.refreshToken = refreshToken
        state.isAuthenticated = true
        
        // Save to localStorage
        localStorage.setItem('co-ride-token', token)
        localStorage.setItem('co-ride-refresh-token', refreshToken)
        localStorage.setItem('co-ride-user', JSON.stringify(user))
        setAuthToken(token)
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = null
        
        // Clear localStorage
        localStorage.removeItem('co-ride-token')
        localStorage.removeItem('co-ride-refresh-token')
        localStorage.removeItem('co-ride-user')
        setAuthToken(null)
      })
  },
})

export const { clearError, updateUser, setAuth, setToken } = authSlice.actions
export default authSlice.reducer