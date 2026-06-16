import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import api from '../services/api'

export default function LiveTracking() {
  const { user } = useSelector((state) => state.auth)
  const [isSharing, setIsSharing] = useState(false)
  const [location, setLocation] = useState(null)
  const [error, setError] = useState('')
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const watchIdRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    loadActiveTrips()
    return () => stopSharing()
  }, [])

  const loadActiveTrips = async () => {
    try {
      const { data } = await api.get('/driver/trips')
      const active = data.data?.filter((t) => t.status === 'ACTIVE') || []
      setTrips(active)
    } catch (err) {
      console.error('Trips error:', err)
    }
  }

  const startSharing = () => {
    setError('')
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsSharing(true)

    // Watch position for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        }
        setLocation(loc)
      },
      (err) => {
        setError(`Location error: ${err.message}`)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    )

    // Send location to backend every 10 seconds
    intervalRef.current = setInterval(async () => {
      if (location) {
        try {
          await api.put('/driver/location', {
            lat: location.lat,
            lng: location.lng,
          })
        } catch (err) {
          console.error('Location update failed:', err.message)
        }
      }
    }, 10000)
  }

  const stopSharing = () => {
    setIsSharing(false)
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Initialize Leaflet map
  useEffect(() => {
    if (!location) return

    const initMap = async () => {
      if (!window.L) {
        // Load Leaflet if not loaded
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        await new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = resolve
          document.head.appendChild(script)
        })
      }

      const container = document.getElementById('live-map')
      if (!container || container._leaflet_id) return

      const map = window.L.map('live-map').setView([location.lat, location.lng], 15)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map)

      const marker = window.L.marker([location.lat, location.lng]).addTo(map)
        .bindPopup('You are here')
        .openPopup()

      // Update marker on location change
      const updateInterval = setInterval(() => {
        if (location) {
          marker.setLatLng([location.lat, location.lng])
          map.panTo([location.lat, location.lng])
        }
      }, 5000)

      return () => clearInterval(updateInterval)
    }

    initMap()
  }, [location])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Live Tracking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Location Sharing</h2>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${isSharing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-sm font-medium">{isSharing ? 'Sharing Location' : 'Not Sharing'}</span>
            </div>

            <button
              onClick={isSharing ? stopSharing : startSharing}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                isSharing
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSharing ? 'Stop Sharing' : 'Start Sharing Location'}
            </button>

            {error && (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            )}
          </div>

          {location && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Current Position</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Latitude</span>
                  <span className="font-mono">{location.lat?.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Longitude</span>
                  <span className="font-mono">{location.lng?.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Accuracy</span>
                  <span>{Math.round(location.accuracy)}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Update</span>
                  <span>{new Date(location.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Active trips */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Active Trips ({trips.length})</h2>
            {trips.length === 0 ? (
              <p className="text-sm text-gray-500">No active trips</p>
            ) : (
              <div className="space-y-2">
                {trips.map((trip) => (
                  <div
                    key={trip._id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTrip?._id === trip._id
                        ? 'bg-primary-50 border border-primary-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <p className="text-sm font-medium">{trip.from} → {trip.to}</p>
                    <p className="text-xs text-gray-500">{trip.availableSeats}/{trip.totalSeats} seats available</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div
              id="live-map"
              className="w-full bg-gray-200"
              style={{ height: '500px' }}
            >
              {!location && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <span className="text-4xl block mb-2">📍</span>
                    <p>Start sharing to see your location on the map</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
