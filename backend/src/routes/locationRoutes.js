import express from 'express'
import { 
  INDIAN_CITIES, 
  getAllCities, 
  getCityWithSubLocations, 
  getAllStates, 
  getCitiesByState, 
  searchLocations,
  getAllSubLocations 
} from '../utils/cities.js'

const router = express.Router()

/**
 * @route   GET /api/locations
 * @desc    Get all cities with basic info
 * @access  Public
 */
router.get('/', (req, res) => {
  const cities = getAllCities()
  res.json({
    success: true,
    count: cities.length,
    data: cities,
  })
})

/**
 * @route   GET /api/locations/states
 * @desc    Get all Indian states
 * @access  Public
 */
router.get('/states', (req, res) => {
  const states = getAllStates()
  res.json({
    success: true,
    count: states.length,
    data: states,
  })
})

/**
 * @route   GET /api/locations/state/:state
 * @desc    Get cities in a specific state
 * @access  Public
 */
router.get('/state/:state', (req, res) => {
  const state = req.params.state.replace(/-/g, ' ')
  const cities = getCitiesByState(state)
  
  if (cities.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No cities found in this state',
    })
  }
  
  res.json({
    success: true,
    count: cities.length,
    data: cities,
  })
})

/**
 * @route   GET /api/locations/city/:name
 * @desc    Get city with all sub-locations
 * @access  Public
 */
router.get('/city/:name', (req, res) => {
  const cityName = req.params.name.replace(/-/g, ' ')
  const city = getCityWithSubLocations(cityName)
  
  if (!city) {
    return res.status(404).json({
      success: false,
      message: 'City not found',
    })
  }
  
  res.json({
    success: true,
    data: {
      name: city.name,
      state: city.state,
      metro: city.metro,
      majorColleges: city.majorColleges,
      subLocations: city.subLocations,
    },
  })
})

/**
 * @route   GET /api/locations/search
 * @desc    Search for cities and sub-locations
 * @access  Public
 */
router.get('/search', (req, res) => {
  const { q, type, limit = 20 } = req.query
  
  if (!q || q.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters',
    })
  }
  
  let results = searchLocations(q, Number(limit))
  
  // Filter by type if specified
  if (type === 'city') {
    results = results.filter(r => r.type === 'city')
  } else if (type === 'subLocation') {
    results = results.filter(r => r.type === 'subLocation')
  }
  
  res.json({
    success: true,
    count: results.length,
    data: results,
  })
})

/**
 * @route   GET /api/locations/sub-locations
 * @desc    Get all sub-locations (for autocomplete)
 * @access  Public
 */
router.get('/sub-locations', (req, res) => {
  const { city, state, category } = req.query
  
  let subLocations = getAllSubLocations()
  
  // Filter by city
  if (city) {
    subLocations = subLocations.filter(
      sl => sl.city.toLowerCase() === city.toLowerCase()
    )
  }
  
  // Filter by state
  if (state) {
    subLocations = subLocations.filter(
      sl => sl.state.toLowerCase() === state.toLowerCase()
    )
  }
  
  // Filter by category
  if (category) {
    subLocations = subLocations.filter(sl => sl.category === category)
  }
  
  res.json({
    success: true,
    count: subLocations.length,
    data: subLocations,
  })
})

/**
 * @route   GET /api/locations/autocomplete
 * @desc    Location autocomplete for trip creation
 * @access  Public
 */
router.get('/autocomplete', (req, res) => {
  const { input, limit = 10 } = req.query
  
  if (!input || input.length < 2) {
    return res.json({
      success: true,
      data: [],
    })
  }
  
  const results = searchLocations(input, Number(limit))
  
  // Format for autocomplete dropdown
  const suggestions = results.map(r => ({
    id: r.type === 'city' ? `city-${r.city}` : `loc-${r.city}-${r.subLocation}`,
    text: r.text,
    type: r.type,
    city: r.city,
    state: r.state,
    subLocation: r.subLocation || null,
    coordinates: r.coordinates || null,
  }))
  
  res.json({
    success: true,
    count: suggestions.length,
    data: suggestions,
  })
})

/**
 * @route   GET /api/locations/popular
 * @desc    Get popular cities (metro cities)
 * @access  Public
 */
router.get('/popular', (req, res) => {
  const popularCities = INDIAN_CITIES
    .filter(city => city.metro)
    .map(city => ({
      name: city.name,
      state: city.state,
      majorColleges: city.majorColleges,
    }))
  
  res.json({
    success: true,
    count: popularCities.length,
    data: popularCities,
  })
})

/**
 * @route   GET /api/locations/nearby
 * @desc    Get nearby cities based on search term
 * @access  Public
 */
router.get('/nearby', (req, res) => {
  const { city, radius = 100 } = req.query
  
  if (!city) {
    return res.status(400).json({
      success: false,
      message: 'City parameter is required',
    })
  }
  
  const targetCity = city.toLowerCase()
  
  // Find cities in same or nearby states
  const nearbyCities = INDIAN_CITIES.filter(c => 
    c.name.toLowerCase().includes(targetCity) ||
    c.state.toLowerCase().includes(targetCity)
  )
  
  res.json({
    success: true,
    count: nearbyCities.length,
    data: nearbyCities,
  })
})

export default router