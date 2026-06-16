import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

/**
 * OpenStreetMap-based Map Component (No API key required)
 * Uses Leaflet.js (npm) for free map rendering
 */
export const OpenStreetMap = ({
  fromCoords,
  toCoords,
  fromName,
  toName,
  width = '100%',
  height = '300px',
  zoom = 13,
  className = '',
  showRoute = true,
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [error, setError] = useState(null)

  // Initialise map once on mount
  useEffect(() => {
    if (!mapRef.current) return

    // Prevent double-init (React StrictMode fires effects twice in dev)
    if (mapInstanceRef.current) return

    try {
      const defaultCenter = fromCoords || [28.6139, 77.2090] // Delhi fallback
      const lat = defaultCenter.lat ?? defaultCenter[0]
      const lng = defaultCenter.lng ?? defaultCenter[1]

      mapInstanceRef.current = L.map(mapRef.current).setView([lat, lng], zoom)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    } catch (err) {
      setError('Failed to initialise map')
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers + route whenever coords change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear existing markers and polylines (keep tile layer)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer)
      }
    })

    if (fromCoords) {
      const fromLat = fromCoords.lat ?? fromCoords[0]
      const fromLng = fromCoords.lng ?? fromCoords[1]

      const fromIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background:#22c55e;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      L.marker([fromLat, fromLng], { icon: fromIcon })
        .bindPopup(fromName || 'Pickup Location')
        .addTo(map)
    }

    if (toCoords) {
      const toLat = toCoords.lat ?? toCoords[0]
      const toLng = toCoords.lng ?? toCoords[1]

      const toIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background:#ef4444;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      L.marker([toLat, toLng], { icon: toIcon })
        .bindPopup(toName || 'Destination')
        .addTo(map)
    }

    if (showRoute && fromCoords && toCoords) {
      const fromLat = fromCoords.lat ?? fromCoords[0]
      const fromLng = fromCoords.lng ?? fromCoords[1]
      const toLat = toCoords.lat ?? toCoords[0]
      const toLng = toCoords.lng ?? toCoords[1]

      const routeLine = L.polyline(
        [[fromLat, fromLng], [toLat, toLng]],
        { color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '10, 10' }
      ).addTo(map)

      map.fitBounds(routeLine.getBounds(), { padding: [30, 30] })
    } else if (fromCoords) {
      // Pan to the single coord we have
      const fromLat = fromCoords.lat ?? fromCoords[0]
      const fromLng = fromCoords.lng ?? fromCoords[1]
      map.setView([fromLat, fromLng], zoom)
    }

    // Recalculate tile grid after any layout change
    map.invalidateSize()
  }, [fromCoords, toCoords, fromName, toName, showRoute, zoom])

  if (error) {
    return (
      <div
        className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={`rounded-xl overflow-hidden ${className}`}
        style={{ width, height }}
      />
      {fromCoords && toCoords && (
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs text-gray-600 shadow z-[1000]">
          📍 {fromName || 'From'} → {toName || 'To'}
        </div>
      )}
    </div>
  )
}

/**
 * Simple Map Placeholder for when no coordinates are available
 */
export const MapPlaceholder = ({
  width = '100%',
  height = '300px',
  message = 'Enter pickup and destination to see route',
  className = '',
}) => {
  return (
    <div
      className={`bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl flex items-center justify-center border-2 border-dashed border-primary-200 ${className}`}
      style={{ width, height }}
    >
      <div className="text-center p-6">
        <svg className="w-16 h-16 mx-auto text-primary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-primary-600 font-medium">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Use the location search to find places</p>
      </div>
    </div>
  )
}

/**
 * Live Location Tracker using Geolocation API
 */
export const LiveLocationTracker = ({
  className = '',
  onLocationUpdate,
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)   // ← was missing, caused ReferenceError
  const markerRef = useRef(null)
  const [tracking, setTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [error, setError] = useState(null)
  const watchIdRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView([28.6139, 77.2090], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    mapInstanceRef.current = map

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    setTracking(true)
    setError(null)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }

        setCurrentLocation(location)
        onLocationUpdate?.(location)

        if (mapInstanceRef.current) {
          if (markerRef.current) {
            markerRef.current.setLatLng([location.lat, location.lng])
          } else {
            markerRef.current = L.marker([location.lat, location.lng])
              .bindPopup('Your Location')
              .addTo(mapInstanceRef.current)
          }
          mapInstanceRef.current.setView([location.lat, location.lng], 15)
        }
      },
      (err) => {
        setError(err.message)
        setTracking(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setTracking(false)
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-48 bg-gray-100" />

      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Live Location</h4>
            {currentLocation ? (
              <p className="text-sm text-gray-500">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                {error || 'Not tracking'}
              </p>
            )}
          </div>
          <button
            onClick={tracking ? stopTracking : startTracking}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tracking
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            {tracking ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OpenStreetMap
