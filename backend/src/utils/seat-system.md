# Seat Reservation System Documentation

## Overview

The Co-Ride seat reservation system allows users to book multiple seats in a single booking, up to a maximum limit per trip. This mimics real ride-sharing platforms like Ola/Uber where you can book for yourself and companions.

---

## Booking Flow

### 1. Trip Creation (Driver Side)
```
Driver creates a trip with:
- totalSeats: 4 (vehicle capacity)
- availableSeats: 4 (initially equals totalSeats)
- pricePerSeat: Rs. 150
```

### 2. Booking (User Side)
```
User wants to book seats for themselves + 2 friends
- seatsBooked: 3
- basePrice = 3 × Rs. 150 = Rs. 450
- If student: discount = Rs. 135 (30%)
- totalPrice = Rs. 315
```

### 3. Seat Deduction
```
Trip update:
- availableSeats: 4 - 3 = 1 seat remaining

Trip passengers array updated:
passengers: [{
  user: "user_id",
  seats: 3,
  bookingId: "booking_id"
}]
```

---

## Seat Types Configuration

Currently supported seat types per booking:
- **Minimum**: 1 seat
- **Maximum**: 3 seats per booking (configurable in frontend)
- **Maximum per trip**: Cannot exceed `totalSeats - alreadyBooked`

### Frontend Constraint
```javascript
// In TripDetail.jsx
{[...Array(Math.min(currentTrip.availableSeats, 5))].map((_, i) => (
  <option key={i + 1} value={i + 1}>{i + 1}</option>
))}
```

---

## Booking Status Flow

```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
    ↓           ↓            ↓
 CANCELLED  CANCELLED    CANCELLED
```

### Status Descriptions

| Status | Description |
|--------|-------------|
| PENDING | Booking created, awaiting confirmation (for driver approval flow) |
| CONFIRMED | Driver confirmed, seats reserved, payment successful |
| IN_PROGRESS | Trip started (OTP verified), user in vehicle |
| COMPLETED | Trip ended, OTP verified, transaction complete |
| CANCELLED | Booking cancelled, seats released, refund processed |

---

## Seat Cancellation & Refund

### When User Cancels
```
1. Check booking.status ∈ ['PENDING', 'CONFIRMED']
2. Calculate cancellation fee:
   - If > 24 hours before departure: 0% fee
   - If < 24 hours before departure: 10% fee
3. Refund = totalPrice - cancellationFee
4. Update trip.availableSeats += seatsBooked
5. Remove from trip.passengers array
```

### When Driver Cancels Trip
```
1. All bookings with status 'PENDING' or 'CONFIRMED' → CANCELLED
2. Full refund to all affected users
3. Trip status → CANCELLED
```

---

## Multi-Seat Booking Model

### Current Implementation
```javascript
// Booking Schema
{
  seatsBooked: Number, // Single field, total seats in this booking
  user: ObjectId,     // Single user (booking owner)
  basePrice: Number,
  discount: Number,
  totalPrice: Number,
}
```

### Trip Passenger Array
```javascript
// Trip Schema - passengers field
{
  user: ObjectId,
  seats: Number,    // Seats booked by this user
  bookingId: ObjectId
}
```

---

## Seat Availability Logic

### Check Available Seats
```javascript
async function createBooking(tripId, seatsBooked) {
  const trip = await Trip.findById(tripId)
  
  if (trip.availableSeats < seatsBooked) {
    throw new Error(`Only ${trip.availableSeats} seats available`)
  }
  
  // Proceed with booking...
}
```

### Concurrent Booking Protection
```javascript
// Use MongoDB transaction or findOneAndUpdate with conditions
const updatedTrip = await Trip.findOneAndUpdate(
  { 
    _id: tripId,
    availableSeats: { $gte: seatsBooked },
    status: 'ACTIVE'
  },
  { 
    $inc: { availableSeats: -seatsBooked }
  },
  { new: true }
)

if (!updatedTrip) {
  throw new Error('Seats no longer available')
}
```

---

## Future Enhancements (Optional)

### Multi-User Booking (Group Booking)
```javascript
// Optional: Group booking with different passengers
{
  seatsBooked: 3,
  passengers: [
    { name: 'John', phone: '9999999999' },  // Main booker
    { name: 'Jane', phone: '8888888888' },  // Co-passenger 1
    { name: 'Bob', phone: '7777777777' }    // Co-passenger 2
  ]
}
```

### Seat Selection
```javascript
// Optional: Specific seat selection (bus/airline style)
{
  seatsBooked: 2,
  seatNumbers: ['A1', 'A2'],  // Front seats
}
```

---

## API Examples

### Create Booking
```bash
POST /api/bookings
{
  "tripId": "trip_id",
  "seatsBooked": 2,
  "pickupPoint": "Near metro station",
  "dropPoint": "Office gate"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "_id": "booking_id",
    "seatsBooked": 2,
    "basePrice": 300,
    "discount": 90,
    "totalPrice": 210,
    "status": "CONFIRMED"
  }
}
```

---

## Summary

- ✅ Single user can book up to 5 seats in one booking
- ✅ Each seat priced equally (pricePerSeat)
- ✅ Student discount applies to total booking
- ✅ Seats automatically released on cancellation
- ✅ Concurrent booking protection via atomic updates
- ✅ Full refund with potential 10% cancellation fee