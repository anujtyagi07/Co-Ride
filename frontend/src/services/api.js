import axios from 'axios'
import { store } from '../store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from Redux store
    try {
      const state = store.getState()
      const token = state?.auth?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      // Store might not be ready, ignore
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// JWT refresh state — shared across all concurrent 401s
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

const forceLogout = () => {
  try {
    store.dispatch({ type: 'auth/logout/fulfilled' })
  } catch (e) { /* ignore */ }
  window.location.href = '/login'
}

// Response interceptor — attempt token refresh before forcing logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Queue concurrent 401s until refresh resolves
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      }).catch(err => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem('co-ride-refresh-token')

    if (!refreshToken) {
      isRefreshing = false
      forceLogout()
      return Promise.reject(error)
    }

    try {
      // Use raw axios to avoid the interceptor catching this request itself
      const { data } = await axios.post(
        (import.meta.env.VITE_API_URL || '/api') + '/auth/refresh',
        { refreshToken }
      )
      const newToken = data.data.token
      const newRefresh = data.data.refreshToken

      store.dispatch({ type: 'auth/setToken', payload: { token: newToken, refreshToken: newRefresh } })
      setAuthToken(newToken)
      processQueue(null, newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      forceLogout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export default api