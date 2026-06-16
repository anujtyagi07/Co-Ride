/**
 * Co-Ride Chat Service — deployment-agnostic
 *
 * Uses HTTP polling so it works on:
 *   - Vercel serverless (no persistent WebSocket support)
 *   - Render / Railway / Fly.io (long-running hosts)
 *   - Local development
 *
 * If `VITE_SOCKET_URL` is set AND socket.io-client is reachable, the service
 * prefers real-time delivery via Socket.IO (optional enhancement).
 *
 * The polling fallback polls `GET /api/chat/:chatId/messages?since=<timestamp>`
 * every `POLL_INTERVAL_MS` and emits the same `newMessage` events so the rest
 * of the app doesn't need to know the difference.
 */

import api from './api.js'

const POLL_INTERVAL_MS = Number(import.meta.env.VITE_CHAT_POLL_MS || 3000)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || ''

class ChatService {
  constructor() {
    this.token = null
    this.api = api
    this.pollingTimers = new Map() // chatId -> interval id
    this.listeners = new Map() // chatId -> Set<callback>
    this.globalListeners = new Set()
    this.connected = false
    this.socket = null
    this.socketMode = false
  }

  setToken(token) {
    this.token = token
  }

  /**
   * Connect (no-op for polling; sets up socket if SOCKET_URL is provided).
   */
  async connect(token = null) {
    this.token = token || this.token
    this.connected = true

    if (SOCKET_URL) {
      try {
        const { io } = await import('socket.io-client')
        this.socket = io(SOCKET_URL, {
          auth: { token: this.token },
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 3,
        })

        this.socket.on('connect', () => {
          this.socketMode = true
          this._notifyConnection(true)
        })

        this.socket.on('disconnect', () => {
          this._notifyConnection(false)
        })

        this.socket.on('newMessage', (message) => {
          this._dispatch(message)
        })

        return this.socket
      } catch (err) {
        // Fall through to polling mode
        this.socket = null
      }
    }

    this._notifyConnection(true)
    return null
  }

  disconnect() {
    this.connected = false
    this.pollingTimers.forEach((id) => clearInterval(id))
    this.pollingTimers.clear()
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this._notifyConnection(false)
  }

  /**
   * Start polling for new messages in a given chat.
   * Idempotent — calling twice for the same chatId restarts the timer.
   */
  joinChat(chatId) {
    if (!chatId) return
    this.leaveChat(chatId)

    if (this.socket && this.socketMode) {
      this.socket.emit('joinChat', { chatId })
      // Still start a low-frequency poll to catch any missed messages
    }

    let lastTimestamp = null
    let initialFetchDone = false

    const tick = async () => {
      if (!this.api || !this.token) return
      try {
        const url = lastTimestamp
          ? `/chat/${chatId}/messages?since=${encodeURIComponent(lastTimestamp)}`
          : `/chat/${chatId}/messages`
        const res = await this.api.get(url)
        const data = res.data?.data
        if (!data) return
        const messages = data.messages || []
        const serverTime = data.serverTime

        if (!initialFetchDone) {
          // First load — no events fired, caller reads via loadMessages()
          initialFetchDone = true
        } else if (messages.length > 0) {
          // Subsequent ticks — emit newMessage events
          for (const m of messages) {
            this._dispatch({
              chatId,
              messageId: m._id,
              sender: m.sender,
              text: m.text,
              timestamp: m.timestamp,
            })
          }
        }

        // Advance the watermark — use the server time so we don't get duplicates
        if (serverTime) lastTimestamp = serverTime
        else if (messages.length > 0) {
          const last = messages[messages.length - 1]
          lastTimestamp = new Date(last.timestamp).toISOString()
        }
      } catch (err) {
        // Silent — polling will retry on next tick
      }
    }

    // Fire one immediate poll so first paint shows the latest
    tick()
    const id = setInterval(tick, POLL_INTERVAL_MS)
    this.pollingTimers.set(chatId, id)
  }

  leaveChat(chatId) {
    const id = this.pollingTimers.get(chatId)
    if (id) {
      clearInterval(id)
      this.pollingTimers.delete(chatId)
    }
    if (this.socket && this.socketMode) {
      this.socket.emit('leaveChat', { chatId })
    }
  }

  /**
   * Send a message via the REST endpoint (works on all platforms).
   * Returns the server response so the caller can update local state.
   */
  async sendMessage(chatId, text) {
    if (!this.api || !this.token) return null
    try {
      const res = await this.api.post(`/chat/${chatId}/messages`, { text })
      const sent = res.data?.data?.message
      if (sent) {
        // Fire our own event so other tabs / panes see it immediately
        this._dispatch({
          chatId,
          messageId: sent._id,
          sender: sent.sender,
          text: sent.text,
          timestamp: sent.timestamp,
        })
      }
      return sent
    } catch (err) {
      throw err
    }
  }

  onMessage(callback) {
    this.globalListeners.add(callback)
    return () => this.globalListeners.delete(callback)
  }

  offMessage(callback) {
    this.globalListeners.delete(callback)
  }

  onTyping(callback) {
    // Typing indicators require real-time socket — no-op in polling mode
    if (this.socket && this.socketMode) {
      this.socket.on('userTyping', callback)
      return () => this.socket?.off('userTyping', callback)
    }
    return () => {}
  }

  emitTyping(chatId) {
    if (this.socket && this.socketMode) {
      this.socket.emit('typing', { chatId })
    }
  }

  isConnected() {
    return this.connected
  }

  _dispatch(message) {
    const payload = {
      ...message,
      // Normalise timestamp
      timestamp: message.timestamp
        ? new Date(message.timestamp).toISOString()
        : new Date().toISOString(),
    }
    this.globalListeners.forEach((cb) => {
      try {
        cb(payload)
      } catch (e) {
        // listener error — ignore so others still fire
      }
    })
  }

  _notifyConnection(state) {
    this.connected = state
    if (this._connectionListeners) {
      this._connectionListeners.forEach((cb) => cb(state))
    }
  }

  onConnectionChange(callback) {
    if (!this._connectionListeners) this._connectionListeners = new Set()
    this._connectionListeners.add(callback)
    callback(this.connected)
    return () => this._connectionListeners.delete(callback)
  }
}

const chatService = new ChatService()
export default chatService
