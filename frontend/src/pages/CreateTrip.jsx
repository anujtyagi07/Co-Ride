import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Button, Input } from '../components/common'
import LocationSearch from '../components/LocationSearch'
import { OpenStreetMap, MapPlaceholder } from '../components/OpenStreetMap'
import { createTrip } from '../store/slices/tripSlice'
import api from '../services/api'

const createTripSchema = z.object({
  from: z.string().min(2, 'Starting location is required'),
  to: z.string().min(2, 'Destination is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  pricePerSeat: z.number().min(10, 'Minimum price is Rs. 10'),
  totalSeats: z.number().min(1, 'At least 1 seat required'),
  vehicleType: z.enum(['CAR', 'BIKE', 'AUTO']),
  vehicleName: z.string().optional(),
  vehicleNumber: z.string().optional(),
  notes: z.string().optional(),
})

function CreateTrip() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state) => state.trips)
  const [fromCoords, setFromCoords] = useState(null)
  const [toCoords, setToCoords] = useState(null)
  const [fareEstimate, setFareEstimate] = useState(null)
  const [fareLoading, setFareLoading] = useState(false)
  const [waypoints, setWaypoints] = useState([])
  const [waypointInput, setWaypointInput] = useState('')
  const [recurring, setRecurring] = useState({ enabled: false, frequency: 'daily', endDate: '' })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      vehicleType: 'CAR',
      totalSeats: 3,
      pricePerSeat: 100,
    },
  })

  // Auto-estimate fare when coords change
  useEffect(() => {
    if (fromCoords && toCoords) {
      estimateFare()
    }
  }, [fromCoords, toCoords, watch('vehicleType')])

  const estimateFare = async () => {
    setFareLoading(true)
    try {
      const { data } = await api.post('/trips/estimate-fare', {
        fromCoords,
        toCoords,
        vehicleType: watch('vehicleType'),
      })
      setFareEstimate(data.data)
    } catch (err) {
      console.error('Fare estimate error:', err)
    }
    setFareLoading(false)
  }

  const addWaypoint = () => {
    if (waypointInput.trim()) {
      setWaypoints([...waypoints, { name: waypointInput.trim(), lat: 0, lng: 0 }])
      setWaypointInput('')
    }
  }

  const removeWaypoint = (index) => {
    setWaypoints(waypoints.filter((_, i) => i !== index))
  }

  const onSubmit = async (data) => {
    const tripData = {
      ...data,
      fromCoords,
      toCoords,
      waypoints: waypoints.length > 0 ? waypoints : undefined,
      recurring: recurring.enabled ? recurring : undefined,
    }
    
    const result = await dispatch(createTrip(tripData))
    if (createTrip.fulfilled.match(result)) {
      navigate('/driver-dashboard')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Trip</h1>
        <p className="mt-2 text-gray-600">Offer a ride and help fellow students travel affordably</p>
      </div>

      <Card>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <LocationSearch
                placeholder="Starting location (e.g., IIT Delhi)"
                value={watch('from') || ''}
                onChange={(value) => setValue('from', value)}
                onSelect={(suggestion) => {
                  setValue('from', suggestion.text)
                  if (suggestion.coordinates) {
                    setFromCoords(suggestion.coordinates)
                  }
                }}
              />
              {errors.from && <p className="mt-1 text-sm text-red-500">{errors.from.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <LocationSearch
                placeholder="Destination (e.g., Connaught Place)"
                value={watch('to') || ''}
                onChange={(value) => setValue('to', value)}
                onSelect={(suggestion) => {
                  setValue('to', suggestion.text)
                  if (suggestion.coordinates) {
                    setToCoords(suggestion.coordinates)
                  }
                }}
              />
              {errors.to && <p className="mt-1 text-sm text-red-500">{errors.to.message}</p>}
            </div>
          </div>

          <Input
            label="Departure Time"
            type="datetime-local"
            error={errors.departureTime?.message}
            {...register('departureTime')}
          />

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <select
                className={`input-field ${errors.vehicleType ? 'border-red-500' : ''}`}
                {...register('vehicleType')}
              >
                <option value="CAR">Car</option>
                <option value="BIKE">Bike</option>
                <option value="AUTO">Auto</option>
              </select>
            </div>
            <Input
              label="Price per Seat (Rs.)"
              type="number"
              placeholder="100"
              error={errors.pricePerSeat?.message}
              {...register('pricePerSeat', { valueAsNumber: true })}
            />
            <Input
              label="Available Seats"
              type="number"
              placeholder="3"
              error={errors.totalSeats?.message}
              {...register('totalSeats', { valueAsNumber: true })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Vehicle Name (Optional)"
              placeholder="e.g., Maruti Swift"
              {...register('vehicleName')}
            />
            <Input
              label="Vehicle Number (Optional)"
              placeholder="e.g., DL 01 AB 1234"
              {...register('vehicleNumber')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              className={`input-field ${errors.notes ? 'border-red-500' : ''}`}
              rows={3}
              placeholder="Any additional information for passengers..."
              {...register('notes')}
            />
          </div>

          {/* Multi-Stop Waypoints */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stops / Waypoints (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={waypointInput}
                onChange={(e) => setWaypointInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWaypoint())}
                placeholder="Add a stop (e.g., Noida Sector 62)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <button type="button" onClick={addWaypoint} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm">
                + Add Stop
              </button>
            </div>
            {waypoints.length > 0 && (
              <div className="mt-2 space-y-1">
                {waypoints.map((wp, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                    <span className="text-gray-700">📍 {wp.name}</span>
                    <button type="button" onClick={() => removeWaypoint(i)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fare Estimation */}
          {fareEstimate && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h4 className="font-semibold text-emerald-800 mb-3">Fare Estimation</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Distance</span>
                  <p className="font-medium text-gray-900">{fareEstimate.distance}</p>
                </div>
                <div>
                  <span className="text-gray-500">Est. Time</span>
                  <p className="font-medium text-gray-900">{fareEstimate.estimatedTime}</p>
                </div>
                <div>
                  <span className="text-gray-500">Regular Price</span>
                  <p className="font-bold text-gray-900">Rs. {fareEstimate.pricePerSeat}/seat</p>
                </div>
                <div>
                  <span className="text-gray-500">Student Price</span>
                  <p className="font-bold text-emerald-700">Rs. {fareEstimate.studentPricePerSeat}/seat</p>
                </div>
              </div>
              <p className="text-xs text-emerald-600 mt-2">Platform fee: {fareEstimate.platformFee ? `Rs. ${fareEstimate.platformFee}` : '25%'} | Driver earns: {fareEstimate.driverEarnings ? `Rs. ${fareEstimate.driverEarnings}` : '75%'}</p>
            </div>
          )}

          {/* Recurring Trip */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={recurring.enabled}
                onChange={(e) => setRecurring({ ...recurring, enabled: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="font-medium text-gray-800">Recurring Trip</span>
              <span className="text-xs text-gray-500">(auto-create for multiple dates)</span>
            </label>
            {recurring.enabled && (
              <div className="mt-3 flex gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Frequency</label>
                  <select
                    value={recurring.frequency}
                    onChange={(e) => setRecurring({ ...recurring, frequency: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every 2 weeks</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">End Date (optional)</label>
                  <input
                    type="date"
                    value={recurring.endDate}
                    onChange={(e) => setRecurring({ ...recurring, endDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Route Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Route Preview</h4>
            {fromCoords && toCoords ? (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <OpenStreetMap
                  fromCoords={fromCoords}
                  toCoords={toCoords}
                  fromName={watch('from')}
                  toName={watch('to')}
                  height="250px"
                />
              </div>
            ) : (
              <MapPlaceholder
                height="200px"
                message="Select From and To locations to preview your route"
              />
            )}
          </div>

          <div className="p-4 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Tips for a great trip:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>- Be accurate with your route and timing</li>
              <li>- Keep your vehicle clean and comfortable</li>
              <li>- Communicate any changes promptly</li>
              <li>- Student discounts are automatically applied for verified students</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button type="submit" loading={isLoading} className="flex-1">
              {recurring.enabled ? 'Create Recurring Trip' : 'Create Trip'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/driver-dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreateTrip