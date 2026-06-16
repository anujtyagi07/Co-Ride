import mongoose from 'mongoose'

const tripSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver is required'],
    },
    from: {
      type: String,
      required: [true, 'Starting location is required'],
      trim: true,
    },
    to: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    fromCoords: {
      lat: { type: Number },
      lng: { type: Number },
    },
    toCoords: {
      lat: { type: Number },
      lng: { type: Number },
    },
    departureTime: {
      type: Date,
      required: [true, 'Departure time is required'],
    },
    arrivalTime: {
      type: Date,
    },
    distance: {
      type: Number, // in kilometers
      default: 0,
    },
    pricePerSeat: {
      type: Number,
      required: [true, 'Price per seat is required'],
      min: [10, 'Minimum price is Rs. 10'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'At least 1 seat required'],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    vehicleType: {
      type: String,
      enum: ['CAR', 'BIKE', 'AUTO'],
      default: 'CAR',
    },
    vehicleName: {
      type: String,
      trim: true,
    },
    vehicleNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'ACTIVE',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    // Matching engine fields
    routePolyline: {
      type: String, // encoded polyline for map display
    },
    waypoints: [
      {
        lat: Number,
        lng: Number,
        name: String,
      },
    ],
    passengers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        seats: Number,
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient searching
tripSchema.index({ from: 'text', to: 'text' })
tripSchema.index({ fromCoords: '2dsphere' })
tripSchema.index({ toCoords: '2dsphere' })
tripSchema.index({ departureTime: 1 })
tripSchema.index({ status: 1 })
tripSchema.index({ driver: 1 })
tripSchema.index({ pricePerSeat: 1 })

// Virtual for student price
tripSchema.virtual('studentPricePerSeat').get(function () {
  return Math.round(this.pricePerSeat * 0.7) // 30% discount
})

// Ensure virtuals are included in JSON
tripSchema.set('toJSON', { virtuals: true })
tripSchema.set('toObject', { virtuals: true })

const Trip = mongoose.model('Trip', tripSchema)

export default Trip