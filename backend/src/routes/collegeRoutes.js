import express from 'express'
import { protect } from '../middleware/index.js'
import { COLLEGES, verifyCollegeEmail, getCollegesByState, getCollegesByCity, searchColleges } from '../utils/colleges.js'
import { INDIAN_CITIES, getCityWithSubLocations, searchLocations } from '../utils/cities.js'

const router = express.Router()

/**
 * @route   GET /api/colleges
 * @desc    Get all colleges
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: COLLEGES.length,
    data: COLLEGES,
  })
})

/**
 * @route   GET /api/colleges/states
 * @desc    Get all states with college count
 * @access  Public
 */
router.get('/states', (req, res) => {
  const stateCounts = COLLEGES.reduce((acc, college) => {
    acc[college.state] = (acc[college.state] || 0) + 1
    return acc
  }, {})

  const states = Object.keys(stateCounts).map(state => ({
    name: state,
    collegeCount: stateCounts[state],
  })).sort((a, b) => a.name.localeCompare(b.name))

  res.json({
    success: true,
    count: states.length,
    data: states,
  })
})

/**
 * @route   GET /api/colleges/cities
 * @desc    Get all cities with college count
 * @access  Public
 */
router.get('/cities', (req, res) => {
  const cityCounts = COLLEGES.reduce((acc, college) => {
    acc[college.city] = (acc[college.city] || 0) + 1
    return acc
  }, {})

  const cities = Object.keys(cityCounts).map(city => ({
    name: city,
    collegeCount: cityCounts[city],
  })).sort((a, b) => a.name.localeCompare(b.name))

  res.json({
    success: true,
    count: cities.length,
    data: cities,
  })
})

/**
 * @route   GET /api/colleges/search
 * @desc    Search colleges by name, city, or state
 * @access  Public
 */
router.get('/search', (req, res) => {
  const { q, state, city, limit = 50, page = 1 } = req.query
  
  let results = [...COLLEGES]

  // Filter by state
  if (state) {
    results = results.filter(c => c.state.toLowerCase() === state.toLowerCase())
  }

  // Filter by city
  if (city) {
    results = results.filter(c => c.city.toLowerCase() === city.toLowerCase())
  }

  // Search query
  if (q && q.length >= 2) {
    const searchTerm = q.toLowerCase()
    results = results.filter(
      (college) =>
        college.name.toLowerCase().includes(searchTerm) ||
        college.city.toLowerCase().includes(searchTerm) ||
        college.state.toLowerCase().includes(searchTerm)
    )
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit)
  const paginatedResults = results.slice(skip, skip + Number(limit))

  res.json({
    success: true,
    count: results.length,
    page: Number(page),
    pages: Math.ceil(results.length / Number(limit)),
    data: paginatedResults,
  })
})

/**
 * @route   GET /api/colleges/verify-email
 * @desc    Verify if a college email domain is valid
 * @access  Private
 */
router.get('/verify-email', protect, (req, res) => {
  const { email } = req.query
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    })
  }
  
  const result = verifyCollegeEmail(email)
  
  res.json({
    success: true,
    valid: result.valid,
    college: result.college,
  })
})

/**
 * @route   GET /api/colleges/:state
 * @desc    Get colleges by state
 * @access  Public
 */
router.get('/state/:state', (req, res) => {
  const state = req.params.state.toLowerCase().replace(/-/g, ' ')
  const colleges = COLLEGES.filter((c) => c.state.toLowerCase() === state)
  
  res.json({
    success: true,
    count: colleges.length,
    data: colleges,
  })
})

/**
 * @route   GET /api/colleges/city/:city
 * @desc    Get colleges by city
 * @access  Public
 */
router.get('/city/:city', (req, res) => {
  const city = req.params.city.toLowerCase().replace(/-/g, ' ')
  const colleges = COLLEGES.filter((c) => c.city.toLowerCase() === city)
  
  res.json({
    success: true,
    count: colleges.length,
    data: colleges,
  })
})

/**
 * @route   GET /api/colleges/nearby
 * @desc    Get colleges near a location (by city name)
 * @access  Public
 */
router.get('/nearby', (req, res) => {
  const { city, radius = 50 } = req.query // radius in km approximation
  
  if (!city) {
    return res.status(400).json({
      success: false,
      message: 'City parameter is required',
    })
  }

  const targetCity = city.toLowerCase()
  const colleges = COLLEGES.filter((c) => 
    c.city.toLowerCase().includes(targetCity)
  )
  
  res.json({
    success: true,
    count: colleges.length,
    data: colleges,
    meta: {
      searchCity: city,
      radius: `${radius}km`,
    },
  })
})

export default router