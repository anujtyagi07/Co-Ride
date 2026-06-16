// Google Maps API utility functions
import axios from 'axios'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ''

// Base URL for Google Maps APIs
const DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json'
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json'
const PLACES_AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json'
const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json'

/**
 * Calculate distance and duration between two locations
 * @param {Object} origin - { lat, lng } or address string
 * @param {Object} destination - { lat, lng } or address string
 * @returns {Object} - { distance (km), duration (minutes), distanceText, durationText }
 */
export const calculateDistance = async (origin, destination) => {
  try {
    const originStr = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`
    const destStr = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`

    const response = await axios.get(DISTANCE_MATRIX_URL, {
      params: {
        origins: originStr,
        destinations: destStr,
        key: GOOGLE_MAPS_API_KEY,
        mode: 'driving',
      },
    })

    if (response.data.status === 'OK' && response.data.rows[0]?.elements[0]?.status === 'OK') {
      const element = response.data.rows[0].elements[0]
      return {
        distance: element.distance.value / 1000, // Convert to km
        distanceText: element.distance.text,
        duration: Math.round(element.duration.value / 60), // Convert to minutes
        durationText: element.duration.text,
      }
    }

    // Fallback: Calculate using Haversine formula
    return calculateHaversineDistance(origin, destination)
  } catch (error) {
    console.error('Google Maps API error:', error.message)
    // Fallback to Haversine formula
    return calculateHaversineDistance(origin, destination)
  }
}

/**
 * Calculate distance using Haversine formula (fallback)
 */
export const calculateHaversineDistance = (origin, destination) => {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(destination.lat - origin.lat)
  const dLng = toRad(destination.lng - origin.lng)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return {
    distance: Math.round(distance * 10) / 10,
    distanceText: `${Math.round(distance)} km`,
    duration: Math.round(distance * 3), // Approximate 20 km/h average
    durationText: `${Math.round(distance * 3)} mins`,
  }
}

const toRad = (value) => (value * Math.PI) / 180

/**
 * Get coordinates from address using Geocoding API
 */
export const getCoordinatesFromAddress = async (address) => {
  try {
    const response = await axios.get(GEOCODING_URL, {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
      },
    })

    if (response.data.status === 'OK' && response.data.results[0]) {
      const location = response.data.results[0].geometry.location
      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: response.data.results[0].formatted_address,
      }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error.message)
    return null
  }
}

/**
 * Get address from coordinates using Reverse Geocoding
 */
export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await axios.get(GEOCODING_URL, {
      params: {
        latlng: `${lat},${lng}`,
        key: GOOGLE_MAPS_API_KEY,
      },
    })

    if (response.data.status === 'OK' && response.data.results[0]) {
      return {
        address: response.data.results[0].formatted_address,
        components: response.data.results[0].address_components,
      }
    }
    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error.message)
    return null
  }
}

/**
 * Get route directions between two points
 * Returns polyline points for map display
 */
export const getDirections = async (origin, destination) => {
  try {
    const originStr = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`
    const destStr = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`

    const response = await axios.get(DIRECTIONS_URL, {
      params: {
        origin: originStr,
        destination: destStr,
        key: GOOGLE_MAPS_API_KEY,
        mode: 'driving',
      },
    })

    if (response.data.status === 'OK' && response.data.routes[0]) {
      const route = response.data.routes[0]
      const leg = route.legs[0]

      return {
        distance: leg.distance.value / 1000,
        distanceText: leg.distance.text,
        duration: Math.round(leg.duration.value / 60),
        durationText: leg.duration.text,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        polyline: route.overview_polyline.points,
        steps: leg.steps.map((step) => ({
          instruction: step.html_instructions,
          distance: step.distance.text,
          startLocation: step.start_location,
          endLocation: step.end_location,
        })),
      }
    }
    return null
  } catch (error) {
    console.error('Directions API error:', error.message)
    return null
  }
}

/**
 * Places autocomplete for location search
 */
export const getPlacePredictions = async (input, sessionToken = null) => {
  if (!input || input.length < 3) return []

  try {
    const params = {
      input,
      types: 'establishment|geocode',
      components: 'country:in', // India only
      key: GOOGLE_MAPS_API_KEY,
    }

    if (sessionToken) {
      params.sessiontoken = sessionToken
    }

    const response = await axios.get(PLACES_AUTOCOMPLETE_URL, { params })

    if (response.data.status === 'OK') {
      return response.data.predictions.map((prediction) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text,
        types: prediction.types,
      }))
    }
    return []
  } catch (error) {
    console.error('Places API error:', error.message)
    return []
  }
}

/**
 * Get place details by place ID
 */
export const getPlaceDetails = async (placeId, sessionToken = null) => {
  try {
    const params = {
      place_id: placeId,
      key: GOOGLE_MAPS_API_KEY,
      fields: 'geometry,formatted_address,address_components,name',
    }

    if (sessionToken) {
      params.sessiontoken = sessionToken
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', { params })

    if (response.data.status === 'OK') {
      const result = response.data.result
      return {
        name: result.name,
        address: result.formatted_address,
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        city: getAddressComponent(result.address_components, 'locality'),
        state: getAddressComponent(result.address_components, 'administrative_area_level_1'),
        country: getAddressComponent(result.address_components, 'country'),
      }
    }
    return null
  } catch (error) {
    console.error('Place details error:', error.message)
    return null
  }
}

/**
 * Helper to extract address component
 */
const getAddressComponent = (components, type) => {
  const component = components.find((c) => c.types.includes(type))
  return component ? component.long_name : ''
}

/**
 * Calculate estimated fare based on distance
 */
export const calculateFare = (distance, vehicleType = 'CAR') => {
  const baseFare = {
    BIKE: 10,
    AUTO: 20,
    CAR: 30,
  }

  const perKmRate = {
    BIKE: 6,
    AUTO: 10,
    CAR: 14,
  }

  const base = baseFare[vehicleType] || 30
  const rate = perKmRate[vehicleType] || 14

  // Surge pricing during peak hours (simplified)
  const hour = new Date().getHours()
  const surgeMultiplier = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20) ? 1.2 : 1.0

  const fare = (base + distance * rate) * surgeMultiplier
  return Math.round(fare)
}

/**
 * Calculate ETA for a trip
 */
export const calculateETA = (distance, departureTime) => {
  const avgSpeedKmh = 30 // Average city speed
  const travelTimeMinutes = Math.round((distance / avgSpeedKmh) * 60)
  const departure = new Date(departureTime)
  const arrival = new Date(departure.getTime() + travelTimeMinutes * 60000)

  return {
    travelTimeMinutes,
    arrivalTime: arrival.toISOString(),
    arrivalTimeFormatted: arrival.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

/**
 * Format duration for display
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} mins`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

/**
 * Format distance for display
 */
export const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}

// Export defaults for easier imports
export default {
  calculateDistance,
  calculateHaversineDistance,
  getCoordinatesFromAddress,
  getAddressFromCoordinates,
  getDirections,
  getPlacePredictions,
  getPlaceDetails,
  calculateFare,
  calculateETA,
  formatDuration,
  formatDistance,
}