/**
 * Co-Ride Long-Running Server
 *
 * For local development and long-running hosts (Render, Railway, VPS).
 * Wraps the serverless-safe `app` with Socket.IO + a real HTTP listener.
 *
 * For Vercel, do NOT use this file — Vercel uses `api/index.js` instead.
 */

import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import jwt from 'jsonwebtoken'

import { app, connectDB } from './app.js'
import { User } from './models/index.js'

const PORT = Number(process.env.PORT || 5001)
const NODE_ENV = process.env.NODE_ENV || 'development'

// CORS origins for Socket.IO — mirror app.js logic
const envOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean)

const previewPatterns = [
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/.*\.onrender\.com$/,
  /^https:\/\/.*\.up\.railway\.app$/,
  /^https:\/\/.*\.netlify\.app$/,
]

const isPreviewOrigin = (origin) =>
  !!origin && previewPatterns.some((re) => re.test(origin))

const isAllowed = (origin) => {
  if (!origin) return true
  if (envOrigins.includes('*')) return true
  if (envOrigins.includes(origin)) return true
  if (isPreviewOrigin(origin)) return true
  return false
}

const httpServer = http.createServer(app)

// ─── Socket.IO — only when explicitly enabled and on a long-running host ────
// Vercel serverless functions cannot hold WebSocket connections, so the chat
// REST endpoints work everywhere and Socket.IO is purely additive here.
const ENABLE_SOCKET = process.env.ENABLE_SOCKET === 'true'

let io = null

if (ENABLE_SOCKET) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin(origin, callback) {
        if (isAllowed(origin)) callback(null, true)
        else callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS`))
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // ─── Socket auth ───────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication required'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('-password')
      if (!user) return next(new Error('User not found'))
      socket.user = user
      next()
    } catch (err) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`)

    socket.on('joinChat', ({ chatId }) => {
      socket.join(`chat:${chatId}`)
    })

    socket.on('leaveChat', ({ chatId }) => {
      socket.leave(`chat:${chatId}`)
    })

    socket.on('sendMessage', ({ chatId, message }) => {
      io.to(`chat:${chatId}`).emit('newMessage', {
        chatId,
        sender: {
          _id: socket.user._id,
          name: socket.user.name,
          avatar: socket.user.avatar,
        },
        text: message,
        timestamp: new Date(),
      })
    })

    socket.on('typing', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('userTyping', {
        chatId,
        user: { _id: socket.user._id, name: socket.user.name },
      })
    })

    socket.on('disconnect', () => {})
  })

  console.log('Socket.IO enabled')
}

// ─── Start ──────────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB()

  httpServer.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚗 Co-Ride Backend Server                               ║
║                                                           ║
║   Server running on port: ${String(PORT).padEnd(33)}║
║   Environment: ${NODE_ENV.padEnd(40)}║
║   Socket.IO: ${String(ENABLE_SOCKET).padEnd(43)}║
║                                                           ║
║   API: http://localhost:${PORT}/api                       ║
║   Health: http://localhost:${PORT}/api/health             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `)
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

export { httpServer, io }
