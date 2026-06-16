import { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Card, Button, Input, Loader } from '../components/common'
import chatService from '../services/chatService'
import api from '../services/api'

function Chat() {
  const { user } = useSelector((state) => state.auth)
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef(null)

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
    initializeChat()

    return () => {
      chatService.disconnect()
    }
  }, [])

  // Join chat room when active chat changes
  useEffect(() => {
    if (activeChat) {
      const id = activeChat.chatId || activeChat._id
      chatService.joinChat(id)
      loadMessages(activeChat._id)
      // Mark messages as read
      markAsRead(activeChat._id)
    }

    return () => {
      if (activeChat) {
        chatService.leaveChat(activeChat.chatId || activeChat._id)
      }
    }
  }, [activeChat])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeChat = () => {
    const token = localStorage.getItem('co-ride-token')
    chatService.setToken(token)
    chatService.connect(token)

    // Connection state — uses the polling-friendly connection API
    chatService.onConnectionChange?.((connected) => setIsConnected(connected))

    // Handle incoming messages from polling or socket
    chatService.onMessage((message) => {
      if (message.chatId === activeChat?.chatId || message.chatId === activeChat?._id) {
        setMessages((prev) => {
          // Avoid duplicates if the same message arrives via socket + poll
          if (message.messageId && prev.some((m) => m._id === message.messageId)) {
            return prev
          }
          return [
            ...prev,
            {
              _id: message.messageId || `tmp-${Date.now()}`,
              sender:
                (message.sender?._id ?? message.sender)?.toString() === user._id?.toString()
                  ? 'me'
                  : 'other',
              text: message.text,
              timestamp: message.timestamp || new Date(),
              senderInfo: message.sender,
            },
          ]
        })

        // Update conversation last message
        setConversations((prev) =>
          prev.map((c) =>
            c._id === (message.chatId || activeChat?._id)
              ? { ...c, lastMessage: message.text, lastMessageTime: new Date() }
              : c
          )
        )
      }
    })
  }

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      
      // Get trips where user is passenger
      const bookingsResponse = await api.get('/bookings')
      const bookings = bookingsResponse.data.data || []
      
      // Get trips where user is driver
      let driverTrips = []
      if (user.role === 'DRIVER' || user.role === 'ADMIN') {
        const tripsResponse = await api.get('/trips/driver/my')
        driverTrips = tripsResponse.data.data || []
      }
      
      // Build conversations from bookings
      const chatConversations = []
      
      // From bookings (passenger perspective)
      bookings.forEach(booking => {
        if (booking.chatId) {
          chatConversations.push({
            _id: booking.chatId,
            tripId: booking.trip?._id,
            participant: booking.trip?.driver,
            lastMessage: '',
            lastMessageTime: booking.updatedAt,
            unreadCount: 0,
            role: 'passenger',
            booking: booking,
          })
        }
      })
      
      // From driver trips
      driverTrips.forEach(trip => {
        if (trip.passengers && trip.passengers.length > 0) {
          trip.passengers.forEach(passenger => {
            if (passenger.bookingId) {
              chatConversations.push({
                _id: `trip-${trip._id}-${passenger.user?._id}`,
                tripId: trip._id,
                participant: passenger.user,
                lastMessage: '',
                lastMessageTime: trip.updatedAt,
                unreadCount: 0,
                role: 'driver',
                trip: trip,
                bookingId: passenger.bookingId?._id || passenger.bookingId,
              })
            }
          })
        }
      })

      setConversations(chatConversations)
    } catch (error) {
      console.error('Failed to load conversations:', error)
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (chatId) => {
    try {
      const response = await api.get(`/chat/${chatId}/messages`)
      const msgs = response.data.data?.messages || response.data.data || []
      setMessages(msgs.map(m => ({
        ...m,
        sender: (m.sender?._id ?? m.sender)?.toString() === user._id?.toString() ? 'me' : 'other',
      })))
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
    }
  }

  const markAsRead = async (chatId) => {
    try {
      await api.put(`/chat/${chatId}/read`)
    } catch (error) {
      // Silently fail
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat) return

    const messageText = newMessage.trim()
    const chatId = activeChat.chatId || activeChat._id
    const tempId = `tmp-${Date.now()}`

    // Optimistic insert — show immediately
    const messageData = {
      _id: tempId,
      sender: 'me',
      text: messageText,
      timestamp: new Date(),
      _pending: true,
    }
    setMessages((prev) => [...prev, messageData])
    setNewMessage('')

    try {
      // SendMessage now returns the persisted message from the server.
      // chatService internally dispatches a newMessage event with the real ID.
      const sent = await chatService.sendMessage(chatId, messageText)

      // Replace temp message with confirmed one
      if (sent && sent._id) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...m, _id: sent._id, _pending: false } : m))
        )
      }
    } catch (error) {
      // Roll back on failure
      setMessages((prev) => prev.filter((m) => m._id !== tempId))
      setNewMessage(messageText)
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    }

    // Update conversation last-message in sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c._id === chatId
          ? { ...c, lastMessage: messageText, lastMessageTime: new Date() }
          : c
      )
    )
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString()
  }

  const getParticipantName = (chat) => {
    if (chat.isDemo) return chat.participant.name
    return chat.participant?.name || chat.booking?.user?.name || 'Chat'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-2 text-gray-600">Chat with your ride partners</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <Input placeholder="Search conversations..." />
            </div>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader size="md" />
              </div>
            ) : conversations.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {conversations.map((chat) => (
                  <button
                    key={chat._id}
                    onClick={() => setActiveChat(chat)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      activeChat?._id === chat._id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-lg">
                            {getParticipantName(chat).charAt(0)}
                          </span>
                        </div>
                        {chat.participant?.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 truncate">
                            {getParticipantName(chat)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessage || 'Start a conversation'}
                        </p>
                        {chat.tripId && (
                          <span className="text-xs text-primary-600">
                            Trip: {chat.trip?.from} → {chat.trip?.to}
                          </span>
                        )}
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Book a ride to start chatting with drivers</p>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-lg">
                        {getParticipantName(activeChat).charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{getParticipantName(activeChat)}</h3>
                      <span className={`text-sm ${activeChat.participant?.isOnline ? 'text-green-500' : 'text-gray-500'}`}>
                        {activeChat.participant?.isOnline ? 'Online' : 'Offline'}
                      </span>
                      {activeChat.trip && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {activeChat.trip.from} → {activeChat.trip.to}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.sender === 'me'
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                        }`}
                      >
                        {message.sender !== 'me' && message.senderInfo && (
                          <div className="text-xs font-medium text-primary-600 mb-1">
                            {message.senderInfo.name || 'User'}
                          </div>
                        )}
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'me' ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {activeChat.trip && (
                  <div className="px-4 py-2 bg-primary-50 border-b border-primary-100">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-primary-700">
                        📍 {activeChat.trip.from}
                      </span>
                      <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span className="text-primary-700">
                        📍 {activeChat.trip.to}
                      </span>
                      <span className="text-primary-600 ml-auto">
                        {new Date(activeChat.trip.departureTime).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-3">
                    <Button type="button" variant="ghost" className="px-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg">Select a conversation to start chatting</p>
                  <p className="text-sm mt-2 text-gray-400">
                    Your ride conversations will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat