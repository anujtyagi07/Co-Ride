import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Button, Loader } from '../components/common'
import LocationSearch from '../components/LocationSearch'
import { fetchTrips, setFilters, clearFilters } from '../store/slices/tripSlice'

function Trips() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { trips, filters, isLoading } = useSelector((state) => state.trips)
  const [searchFrom, setSearchFrom] = useState('')
  const [searchTo, setSearchTo] = useState('')

  // Sync URL query params with filters on initial load
  useEffect(() => {
    const fromParam = searchParams.get('from') || ''
    const toParam = searchParams.get('to') || ''
    const vehicleTypeParam = searchParams.get('vehicleType') || ''
    if (fromParam || toParam || vehicleTypeParam) {
      setSearchFrom(fromParam)
      setSearchTo(toParam)
      dispatch(setFilters({
        from: fromParam,
        to: toParam,
        vehicleType: vehicleTypeParam,
      }))
    }
  }, [])

  // Re-fetch whenever Redux filters change (vehicleType, price, from, to)
  useEffect(() => {
    dispatch(fetchTrips(filters))
  }, [dispatch, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    // Persist search terms into Redux so clearFilters() removes them too
    dispatch(setFilters({ from: searchFrom, to: searchTo }))
    // Update URL query params
    const params = {}
    if (searchFrom) params.from = searchFrom
    if (searchTo) params.to = searchTo
    setSearchParams(params)
  }

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Rides</h1>
        <p className="mt-2 text-gray-600">Search for available trips matching your route</p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <LocationSearch
              placeholder="From (e.g., IIT Delhi, Connaught Place)"
              value={searchFrom}
              onChange={setSearchFrom}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <LocationSearch
              placeholder="To (e.g., Hinjewadi, Cyberabad)"
              value={searchTo}
              onChange={setSearchTo}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="md:w-auto">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filters.vehicleType || ''}
          onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Vehicle Types</option>
          <option value="CAR">Car</option>
          <option value="BIKE">Bike</option>
          <option value="AUTO">Auto</option>
        </select>
        <select
          value={filters.minPrice || ''}
          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Min Price</option>
          <option value="50">Rs. 50+</option>
          <option value="100">Rs. 100+</option>
          <option value="200">Rs. 200+</option>
        </select>
        <select
          value={filters.maxPrice || ''}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Max Price</option>
          <option value="100">Up to Rs. 100</option>
          <option value="200">Up to Rs. 200</option>
          <option value="500">Up to Rs. 500</option>
        </select>
        {(filters.from || filters.to || filters.vehicleType) && (
          <Button variant="ghost" onClick={() => dispatch(clearFilters())}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : trips.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Link key={trip._id} to={`/trips/${trip._id}`}>
              <Card hover className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-lg">
                      {trip.driver?.name?.charAt(0) || 'D'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{trip.driver?.name || 'Driver'}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {trip.driver?.rating || '4.8'}
                      {trip.driver?.totalRatings > 0 && (
                        <span className="text-xs text-gray-400">({trip.driver.totalRatings})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student discount badge */}
                {trip.driver?.isStudent && trip.studentPricePerSeat && (
                  <div className="mb-3">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      Student Price: Rs. {trip.studentPricePerSeat}/seat (30% off)
                    </span>
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                    <div>
                      <div className="text-sm text-gray-500">From</div>
                      <div className="font-medium text-gray-900">{trip.from}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary-500 mt-2" />
                    <div>
                      <div className="text-sm text-gray-500">To</div>
                      <div className="font-medium text-gray-900">{trip.to}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500">Price per seat</div>
                    <div className="text-xl font-bold text-primary-600">Rs. {trip.pricePerSeat}</div>
                    {trip.distance > 0 && (
                      <div className="text-xs text-gray-400">{trip.distance} km</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {trip.availableSeats} seat{trip.availableSeats !== 1 ? 's' : ''} left
                    </div>
                    <div className="flex gap-1 justify-end flex-wrap mt-1">
                      {trip.waypoints?.length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
                          {trip.waypoints.length} stop{trip.waypoints.length > 1 ? 's' : ''}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        trip.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

export default Trips