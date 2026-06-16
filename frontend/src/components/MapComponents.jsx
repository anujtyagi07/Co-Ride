import { useEffect, useRef, useState } from 'react'

/**
 * Google Maps Route Visualization Component
 * Displays route between pickup and destination points
 */
export const MapRoute = ({ 
  fromCoords, 
  toCoords, 
  fromName, 
  toName,
  width = '100%',
  height = '300px',
  showMarkers = true,
  zoom = 14,
  className = '',
}) => {
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(null)

  useEffect(() => {
    // Check if Google Maps API is available
    if (!window.google?.maps) {
      loadGoogleMapsScript()
    } else {
      setMapLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (mapLoaded && mapRef.current && fromCoords && toCoords) {
      initMap()
    }
  }, [mapLoaded, fromCoords, toCoords])

  const loadGoogleMapsScript = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      setMapError('Google Maps API key not configured')
      return
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Script already loading or loaded
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkLoaded)
          setMapLoaded(true)
        }
      }, 100)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setMapLoaded(true)
    script.onerror = () => setMapError('Failed to load Google Maps')
    document.head.appendChild(script)
  }

  const initMap = () => {
    try {
      const directionsService = new window.google.maps.DirectionsService()
      const directionsRenderer = new window.google.maps.DirectionsRenderer()
      
      const map = new window.google.maps.Map(mapRef.current, {
        zoom,
        center: fromCoords,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      })

      directionsRenderer.setMap(map)

      // Calculate and display route
      directionsService.route(
        {
          origin: fromCoords,
          destination: toCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result)
          } else {
            console.error('Directions request failed:', status)
            // Fallback: show markers without route
            new window.google.maps.Marker({
              position: fromCoords,
              map,
              title: fromName || 'Pickup',
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#22c55e',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 3,
              },
            })
            new window.google.maps.Marker({
              position: toCoords,
              map,
              title: toName || 'Destination',
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#ef4444',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 3,
              },
            })
          }
        }
      )
    } catch (error) {
      console.error('Map initialization failed:', error)
      setMapError('Failed to initialize map')
    }
  }

  // Fallback when no Google Maps API
  if (!mapLoaded || mapError) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-600 font-medium">
            {mapError || 'Map not available'}
          </p>
          {fromCoords && toCoords && (
            <div className="mt-3 text-sm text-gray-500">
              <p>📍 From: {fromName || `${fromCoords.lat}, ${fromCoords.lng}`}</p>
              <p>📍 To: {toName || `${toCoords.lat}, ${toCoords.lng}`}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ width, height }}
    />
  )
}

/**
 * Location Autocomplete Input Component
 */
export const LocationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = 'Enter location',
  className = '',
  id = 'location-input',
}) => {
  const inputRef = useRef(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!window.google?.maps?.places) {
      loadGoogleMapsScript()
    }
  }, [])

  const loadGoogleMapsScript = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    if (document.querySelector('script[src*="maps.googleapis.com"]')) return

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }

  const handleInputChange = (e) => {
    const input = e.target.value
    onChange(input)

    if (input.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Use Places Autocomplete if available
    if (window.google?.maps?.places) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'in' }, // India only
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place.geometry) {
          onChange(place.formatted_address || place.name)
          setSuggestions([])
          setShowSuggestions(false)
        }
      })
    } else {
      // Fallback: Simple search without autocomplete
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (suggestion) => {
    onChange(suggestion.description)
    setShowSuggestions(false)
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="input-field w-full"
        autoComplete="off"
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

/**
 * Live Location Tracker Component
 * Shows driver's current location on map
 */
export const LiveTracker = ({ 
  driverId, 
  tripId,
  markers = [],
  className = '',
}) => {
  const mapRef = useRef(null)
  const [tracking, setTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const watchIdRef = useRef(null)

  useEffect(() => {
    loadGoogleMapsScript()
  }, [])

  const loadGoogleMapsScript = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    if (document.querySelector('script[src*="maps.googleapis.com"]')) return

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setTracking(true)
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
        setTracking(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }
    setTracking(false)
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-64 bg-gray-100"
      >
        {!window.google?.maps && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-500">Live tracking requires Google Maps API</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Live Location</h4>
            {currentLocation && (
              <p className="text-sm text-gray-500">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
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
            {tracking ? 'Stop Tracking' : 'Start Tracking'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Calculate distance between two points
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const toRad = (value) => (value * Math.PI) / 180

export default MapRoute