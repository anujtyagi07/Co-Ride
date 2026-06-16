# (AI WILL SIGGEST A NAME ) — Production Ready Specification

## 1. Project Overview
Co-Ride is a smart ride-sharing platform focused on Indian cities with student discounts, AI-assisted ride matching, and secure payments.

---

## 2. User Roles (RBAC)
- USER: Book rides, wallet, chat
- DRIVER: Create/manage trips
- ADMIN: Approvals, analytics

Middleware:
```js
authorizeRoles('USER','DRIVER','ADMIN')
```

---

## 3. Core Features
- Authentication (JWT + Refresh Tokens)
- Student Verification (college email / ID upload)
- Trip Creation & Booking
- Real-time Chat (Socket.io)
- Payment Integration (Razorpay)
- Wallet System
- AI Ride Suggestions (future-ready)

---

## 4. Database Schema

### Users
```js
{
  name,
  email,
  password,
  role,
  isStudent,
  collegeId,
  walletBalance,
  rating
}
```

### Trips
```js
{
  driverId,
  from,
  to,
  fromCoords,
  toCoords,
  distance,
  pricePerSeat,
  availableSeats,
  status
}
```

### Bookings
```js
{
  tripId,
  userId,
  seatsBooked,
  totalPrice,
  status
}
```

### Payments
```js
{
  userId,
  amount,
  method,
  status,
  transactionId
}
```

---

## 5. Matching Engine
- Radius-based trip search
- Route similarity matching
- Time overlap filtering

---

## 6. Pricing Engine
```js
price = base + (distance × demand × time × vehicleType)
```

Student discount applied after calculation.

---

## 7. Maps Integration
Use Google Maps API:
- Distance calculation
- Route optimization
- ETA

---

## 8. API Structure

### Auth
- POST /auth/register
- POST /auth/login

### Trips
- GET /trips
- POST /trips

### Bookings
- POST /bookings

### Payments
- POST /payments/create-order
- POST /payments/verify

---

## 9. Security
- bcrypt hashing
- JWT auth
- Rate limiting
- Input validation (Zod)

---

## 10. Architecture
Controller → Service → Repository → DB

---

## 11. Deployment
- Frontend: Vercel
- Backend: Render
- DB: MongoDB Atlas
- Media: Cloudinary

---

## 12. Future Enhancements
- AI-based ride recommendations
- Push notifications
- Advanced analytics dashboard

---

## Status: Production Ready ✅

