# Co-Ride Backend

Smart ride-sharing platform backend API built with Node.js, Express, and MongoDB.

## Features

- JWT Authentication with Refresh Tokens
- Role-based Access Control (USER, DRIVER, ADMIN)
- Trip Management with Matching Engine
- Booking System with Wallet Payments
- Real-time Chat (Socket.io)
- Student Verification & Discounts
- Razorpay Payment Integration

## Tech Stack

- Node.js 18+
- Express.js
- MongoDB (Mongoose)
- Socket.io
- JWT Authentication
- bcryptjs
- Express Rate Limiting

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# (Optional) Seed database with demo data
npm run seed
```

### Environment Variables

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/co-ride
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_URL=http://localhost:3000
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh token |
| GET | /api/auth/profile | Get profile |
| PUT | /api/auth/profile | Update profile |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/trips | List trips |
| GET | /api/trips/:id | Get trip details |
| POST | /api/trips | Create trip (Driver) |
| PUT | /api/trips/:id | Update trip (Driver) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/bookings | User's bookings |
| POST | /api/bookings | Create booking |
| PUT | /api/bookings/:id/cancel | Cancel booking |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/wallet | Get balance |
| POST | /api/wallet/add | Add money |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/stats | Platform stats |
| GET | /api/admin/users | All users |

## Demo Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@coride.com | password123 |
| Driver | amit@coride.com | password123 |
| User | rahul@coride.com | password123 |

## License

MIT