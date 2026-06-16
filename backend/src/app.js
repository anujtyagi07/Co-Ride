/**
 * Co-Ride Express App
 *
 * Serverless-safe: no `server.listen()`, no Socket.IO.
 * Works on Vercel, Render, Railway, AWS Lambda, or any Node.js host.
 *
 * For long-running hosts (Render/Railway/local), wrap with Socket.IO via
 * `src/server.js` if real-time features are needed.
 */

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Routes
import {
  authRoutes,
  tripRoutes,
  bookingRoutes,
  walletRoutes,
  paymentRoutes,
  adminRoutes,
  chatRoutes,
  otpRoutes,
  collegeRoutes,
  driverRoutes,
  locationRoutes,
  notificationRoutes,
  profileRoutes,
} from './routes/index.js'

import { errorHandler } from './middleware/index.js'

// Load env vars once (works in serverless — Vercel/Render inject them at runtime)
dotenv.config()

// ─── Build the app ──────────────────────────────────────────────────────────────
export const app = express()

// ─── MongoDB connection with serverless-friendly caching ──────────────────────
// In serverless, every cold start would otherwise open a new connection and
// quickly exhaust the MongoDB pool. We cache it on `globalThis`.
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  'mongodb://localhost:27017/co-ride'

export const connectDB = async () => {
  // Reuse existing connection if it's healthy
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  // Cache the connection promise on globalThis to survive serverless invocations
  if (!globalThis.__coRideMongoPromise) {
    globalThis.__coRideMongoPromise = mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: Number(process.env.MONGO_POOL_SIZE || 10),
      })
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`)
        return conn
      })
      .catch((err) => {
        // Reset the cached promise so the next call retries
        globalThis.__coRideMongoPromise = null
        throw err
      })
  }

  return globalThis.__coRideMongoPromise
}

// Ensure DB is connected before handling each request (serverless middleware).
// Must be FIRST so routes can use the connection.
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    res.status(503).json({
      success: false,
      message: 'Database temporarily unavailable',
    })
  }
})

// ─── CORS ───────────────────────────────────────────────────────────────────────
// Allowed origins are comma-separated via CLIENT_URL.
// In production we also allow common preview deployment patterns so the API
// works out-of-the-box on Vercel/Render/Railway preview URLs.
const envOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean)

// Wildcard patterns for preview deployments
const previewPatterns = [
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/.*\.onrender\.com$/,
  /^https:\/\/.*\.up\.railway\.app$/,
  /^https:\/\/.*\.netlify\.app$/,
]

const isPreviewOrigin = (origin) =>
  !!origin && previewPatterns.some((re) => re.test(origin))

const isAllowed = (origin) => {
  if (!origin) return true // server-to-server / curl / mobile
  if (envOrigins.includes('*')) return true
  if (envOrigins.includes(origin)) return true
  if (isPreviewOrigin(origin)) return true
  return false
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowed(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

// ─── Body parsers ───────────────────────────────────────────────────────────────
// Configurable limit — defaults to 4 MB to stay under Vercel hobby plan's 4.5 MB cap.
const MAX_UPLOAD = process.env.MAX_UPLOAD_SIZE_MB
  ? `${process.env.MAX_UPLOAD_SIZE_MB}mb`
  : '4mb'

app.use(express.json({ limit: MAX_UPLOAD }))
app.use(express.urlencoded({ extended: true, limit: MAX_UPLOAD }))

// ─── Security & logging ─────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors(corsOptions))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Trust first proxy (Vercel/Render/Heroku all sit behind one)
app.set('trust proxy', 1)

// ─── Rate limiting ──────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
})

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/forgot-password', authLimiter)
app.use('/api/auth/reset-password', authLimiter)
app.use('/api', apiLimiter)

// ─── API routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/otp', otpRoutes)
app.use('/api/colleges', collegeRoutes)
app.use('/api/driver', driverRoutes)
app.use('/api/locations', locationRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/profile', profileRoutes)

// ─── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Co-Ride API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  })
})

// ─── Root index (useful for browser visits to the API URL) ─────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Co-Ride API',
    docs: '/api/health',
  })
})

// ─── 404 & error handlers ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Wrap async errors that body-parser throws (e.g. payload-too-large) so they
// return JSON instead of HTML.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: `Upload too large. Limit is ${MAX_UPLOAD}.`,
    })
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
    })
  }
  next(err)
})

app.use(errorHandler)

// (MongoDB connection logic moved to the top of the file so it runs before routes)

// Re-export for convenience
export default app
