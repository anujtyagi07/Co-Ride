# Co-Ride

> **Smart ride-sharing platform focused on Indian cities — student discounts, secure Razorpay payments, and AI-assisted ride matching.**

Co-Ride connects **passengers** with **drivers** going the same way, splitting fuel costs while keeping the experience safe (OTP-verified trip start/end, server-verified payments, role-based access control). The platform is **deployment-agnostic**: the same codebase runs as a Vercel serverless backend, a Render long-running Node service, or a local dev server with Socket.IO.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Usage Examples](#usage-examples)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

### 🧍 User & Driver
- **Authentication** — Email + password with **JWT access tokens** and **rotating refresh tokens** (15 min access / 7 day refresh). Automatic silent refresh on the client.
- **Role-based access control** — `USER`, `DRIVER`, `ADMIN`. Roles are server-whitelisted on registration; clients can never escalate to admin.
- **Student verification** — Server-side domain check against 90+ Indian colleges; verified students get an automatic fare discount.
- **Driver verification** — Document upload (college ID, driving licence, vehicle RC) with admin approval workflow.

### 🚗 Trips
- **Trip search & booking** — Radius-based search with route similarity and time overlap matching.
- **Multi-stop support** — Add intermediate stops between origin and destination.
- **Fare estimation** — Dynamic formula `base + distance × demand × time × vehicleType` with student discount applied server-side.
- **Driver dashboard** — Manage your trips, see bookings, accept/decline passengers, track earnings.
- **Live location tracking** — Driver broadcasts GPS position; passenger sees real-time map updates via the `LiveTracking` page.

### 💬 Communication
- **Real-time chat** — Passenger ↔ driver messaging. Uses **Socket.IO** when available (long-running hosts) and falls back to **HTTP polling** (`?since=<timestamp>`) on serverless hosts. Same UI either way.
- **OTP verification** — 6-digit codes sent via email for trip start, trip end, and booking cancellation. Drivers and passengers must exchange OTPs to confirm a transaction.
- **Push notifications** — In-app notification center for booking confirmations, trip status changes, and ratings.

### 💳 Payments
- **Razorpay integration** — Server-verified signature check + server-side amount fetch. Client-supplied amounts are never trusted.
- **In-app wallet** — Add money via Razorpay, pay for bookings with one click. Drivers receive 75% of fare as wallet credit on trip completion.
- **Idempotent verification** — Replaying a payment request is safe; duplicate verifications return the existing payment record.

### ⭐ Trust & Safety
- **Rating & review** — Both passengers and drivers rate each other after completed trips; rolling average updates server-side.
- **OTP-guarded trip lifecycle** — Trip start/end requires the passenger's OTP, preventing unauthorized trips even if the driver has the booking ID.
- **Rate limiting** — Auth endpoints capped at **10 attempts / 15 min / IP**, general API at 100 / 15 min.
- **Helmet security headers** + **CORS allowlist** + **server-issued tokens only**.

### 🛠 Admin
- **Admin dashboard** — User list, role management, trip moderation, revenue analytics, payout tracking.
- **Driver approvals** — Review uploaded documents and approve/reject driver accounts.

---

## Tech Stack

### Frontend (`frontend/`)
| Concern | Library |
|---|---|
| UI framework | **React 18** |
| Build tool | **Vite 5** |
| State management | **Redux Toolkit** + **React-Redux** |
| Routing | **React Router v6** |
| Forms & validation | **react-hook-form** + **Zod** |
| Styling | **Tailwind CSS 3** |
| Maps (default) | **Leaflet** + **OpenStreetMap** (free, no API key) |
| Maps (optional) | **Google Maps JavaScript API** + Places Autocomplete |
| HTTP client | **Axios** (with 401-refresh interceptor) |
| Real-time | **socket.io-client** (auto-falls back to polling) |
| Date utils | **date-fns** |

### Backend (`backend/`)
| Concern | Library |
|---|---|
| Runtime | **Node.js ≥ 18** (ES modules) |
| Framework | **Express 4** |
| Database | **MongoDB** via **Mongoose 8** |
| Auth | **jsonwebtoken** (JWT) + **bcryptjs** |
| Payments | **Razorpay Node SDK** |
| Real-time | **Socket.IO 4** (optional, serverless-safe) |
| Email | **Nodemailer** (SMTP) |
| Validation | **express-validator** |
| Security | **helmet**, **express-rate-limit**, **cors** |
| Logging | **morgan** |

### Infrastructure
- **MongoDB Atlas** for production database
- **Vercel** for frontend hosting (also supports monorepo serverless backend)
- **Render** or **Railway** for long-running backend with Socket.IO
- **Cloudinary** (optional) for production-grade file uploads
- **SMTP** (Gmail, SendGrid, etc.) for transactional email

---

## Project Structure

```
co-ride/
├── backend/
│   ├── src/
│   │   ├── app.js              # Serverless-safe Express app
│   │   ├── server.js           # Long-running server with Socket.IO
│   │   ├── index.js            # Auto-detects deployment mode
│   │   ├── config/             # DB, env config
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/         # Auth, error handler
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routers
│   │   ├── utils/              # Helpers (colleges, email, seed)
│   │   └── seed.js             # Demo data seeder
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/              # Route components
│   │   ├── components/         # Reusable UI
│   │   ├── services/           # API clients (axios)
│   │   ├── store/              # Redux slices
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Helpers
│   ├── .env.example
│   └── package.json
├── api/
│   └── index.js                # Vercel serverless catch-all
├── vercel.json                 # Vercel monorepo config
├── render.yaml                 # Render Blueprint
├── .env.example files for both apps
├── .gitignore
├── README.md
├── QA_REPORT.md
└── CUSTOMER_READY_CHECKLIST.md
```

---

## Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| **Node.js** | ≥ 18.0.0 |
| **npm** | ≥ 9 (ships with Node 18) |
| **MongoDB** | Local install **or** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster |
| **Git** | any recent version |

### 1. Clone & Install

```bash
git clone https://github.com/<your-org>/co-ride.git
cd co-ride

# Install backend
cd backend
npm install

# Install frontend (in a new terminal)
cd ../frontend
npm install
```

### 2. Configure Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Edit the `.env` files. **Minimum required for local dev:**
- Backend: a working `MONGODB_URI`
- Frontend: nothing (defaults work for local dev)

See the [Environment Variables](#environment-variables) section for the full list.

### 3. Start MongoDB

```bash
# If you installed MongoDB locally:
mongod

# Or just point MONGODB_URI at your Atlas cluster in backend/.env
```

### 4. (Optional) Seed Demo Data

```bash
cd backend
npm run seed
```

This creates a demo driver, demo user, sample trips, and a few colleges. **Seeded credentials:**
- `demo@coride.com` / `Demo@1234` (USER)
- `driver@coride.com` / `Demo@1234` (DRIVER)
- `admin@coride.com` / `Demo@1234` (ADMIN)

### 5. Start the Servers

```bash
# Terminal 1 — Backend (long-running with Socket.IO)
cd backend
npm start
# → http://localhost:5001

# Terminal 2 — Frontend (Vite dev server with API proxy)
cd frontend
npm run dev
# → http://localhost:3000
```

Open <http://localhost:3000> in your browser. The Vite dev server proxies `/api/*` to the backend automatically.

---

## Environment Variables

### Backend (`backend/.env`)

Copy from `backend/.env.example`. All keys are documented inline in that file.

| Variable | Required | Example | Description |
|---|---|---|---|
| `PORT` | no | `5001` | HTTP port |
| `NODE_ENV` | no | `development` | `development` \| `production` |
| `DEPLOYMENT_MODE` | auto | `long-running` | `serverless` \| `long-running`. Auto-detected from `VERCEL=1` |
| `ENABLE_SOCKET` | no | `true` | Enable Socket.IO. Only effective on long-running hosts |
| `MONGODB_URI` | **yes** | `mongodb://localhost:27017/co-ride` | Mongo connection string |
| `MONGO_POOL_SIZE` | no | `10` | Max pool connections |
| `JWT_SECRET` | **yes** | (64 random hex chars) | **Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`** |
| `JWT_REFRESH_SECRET` | **yes** | (different from above) | Refresh token secret |
| `JWT_EXPIRES_IN` | no | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | no | `7d` | Refresh token TTL |
| `CLIENT_URL` | **yes** | `http://localhost:3000` | Comma-separated list of allowed origins |
| `MAX_UPLOAD_SIZE_MB` | no | `4` | Body parser limit (must be ≤ 4.5 on Vercel) |
| `RATE_LIMIT_MAX` | no | `100` | Per-15-min general API limit |
| `RAZORPAY_KEY_ID` | for payments | `rzp_test_xxx` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | for payments | `xxx` | **Never expose to frontend** |
| `GOOGLE_MAPS_API_KEY` | optional | `AIza...` | Only needed if you switch from Leaflet to Google Maps |
| `CLOUDINARY_CLOUD_NAME` | optional | `your-cloud` | For production file uploads |
| `CLOUDINARY_API_KEY` | optional | `xxx` | |
| `CLOUDINARY_API_SECRET` | optional | `xxx` | |
| `SMTP_HOST` | for emails | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | for emails | `587` | |
| `SMTP_SECURE` | for emails | `false` | `true` for port 465 |
| `SMTP_USER` | for emails | `you@gmail.com` | |
| `SMTP_PASS` | for emails | `app-password` | Gmail users: use an App Password |
| `MAIL_FROM` | for emails | `noreply@coride.com` | |

### Frontend (`frontend/.env`)

All frontend vars must be prefixed with `VITE_` to be exposed to the browser.

| Variable | Required | Example | Description |
|---|---|---|---|
| `VITE_API_URL` | no | `/api` | API base path. `/api` uses Vite proxy in dev. Set to `https://your-api.com/api` for split deploy. |
| `VITE_SOCKET_URL` | no | _(empty)_ | Leave empty to use polling. Set to your API origin only if Socket.IO is enabled. |
| `VITE_CHAT_POLL_MS` | no | `3000` | Chat polling interval when sockets are unavailable |
| `VITE_RAZORPAY_KEY_ID` | for payments | `rzp_test_xxx` | Razorpay **public** key only |
| `VITE_GOOGLE_MAPS_API_KEY` | optional | `AIza...` | Only for Google Maps components |
| `VITE_BASE_PATH` | no | `/` | Sub-path hosting (e.g. GitHub Pages project sites) |

> ⚠️ **Never** put your Razorpay secret, JWT secret, MongoDB connection string, or SMTP password in the frontend `.env`. Anything starting with `VITE_` is bundled into the browser and visible to anyone.

---

## API Endpoints

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <accessToken>`.

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | – | Create account (rate-limited) |
| POST | `/login` | – | Get access + refresh tokens |
| POST | `/refresh` | – | Rotate access token |
| POST | `/logout` | ✓ | Invalidate refresh token |
| GET | `/profile` | ✓ | Current user |
| PUT | `/profile` | ✓ | Update name/phone/avatar |
| PUT | `/change-password` | ✓ | Change password |
| POST | `/verify-student` | ✓ | Verify college email |
| POST | `/forgot-password` | – | Send OTP to email |
| POST | `/reset-password` | – | Reset with OTP |

### Trips (`/api/trips`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | – | List trips (paginated) |
| GET | `/search` | – | Search by route + time |
| GET | `/:id` | – | Trip details |
| GET | `/driver/my` | DRIVER | My trips |
| POST | `/` | DRIVER | Create trip |
| PUT | `/:id` | DRIVER | Update trip |
| PUT | `/:id/cancel` | DRIVER | Cancel trip |

### Bookings (`/api/bookings`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | My bookings |
| GET | `/:id` | ✓ | Booking details |
| POST | `/` | ✓ | Book seats on a trip |
| PUT | `/:id/cancel` | ✓ | Cancel booking |
| PUT | `/:id/rate` | ✓ | Rate completed booking |
| GET | `/driver/my` | DRIVER | Bookings on my trips |

### Wallet (`/api/wallet`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | Balance + recent transactions |
| GET | `/transactions` | ✓ | Paginated history |
| POST | `/add` | ✓ | **Dev-only** direct credit. Returns 403 in production. |
| POST | `/withdraw` | ✓ | **Disabled in production** |

### Payments (`/api/payments`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/create-order` | ✓ | Create Razorpay order |
| POST | `/verify` | ✓ | Verify payment server-side and credit wallet |
| GET | `/transactions` | ✓ | Payment history |

### Chat (`/api/chat`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | List conversations |
| POST | `/` | ✓ | Get or create chat with a user |
| GET | `/:chatId/messages` | ✓ | Fetch messages (supports `?since=<ISO>` for polling) |
| POST | `/:chatId/messages` | ✓ | Send a message |
| PUT | `/:chatId/read` | ✓ | Mark as read |

### OTP (`/api/otp`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/trip-start` | DRIVER | Generate OTP to start trip |
| POST | `/verify-trip-start` | DRIVER | Verify and start |
| POST | `/trip-end` | DRIVER | Generate end-of-trip OTP |
| POST | `/verify-trip-end` | DRIVER | Verify and complete |
| POST | `/cancel-booking` | ✓ | Generate cancellation OTP |
| POST | `/verify-cancel-booking` | ✓ | Verify and cancel |

### Locations (`/api/locations`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/cities` | – | List of supported cities |
| GET | `/states` | – | List of states |
| GET | `/autocomplete?q=...` | – | City/location suggestions with coordinates |

### Colleges (`/api/colleges`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | – | List colleges |
| GET | `/search?q=...` | – | Search by name/domain |
| POST | `/verify-email` | – | Check if an email belongs to a known college |

### Driver (`/api/driver`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | DRIVER | Dashboard stats |
| POST | `/documents` | DRIVER | Upload verification document |
| GET | `/verification-status` | DRIVER | Current verification status |

### Admin (`/api/admin`)
All routes require `ADMIN` role.

| Method | Path | Description |
|---|---|---|
| GET | `/users` | List all users (paginated) |
| PUT | `/users/:id/role` | Update user role |
| GET | `/trips` | All trips |
| GET | `/stats` | Platform-wide analytics |
| GET | `/drivers/pending` | Driver approvals queue |
| PUT | `/drivers/:id/approve` | Approve driver |

### Notifications (`/api/notifications`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | List notifications |
| PUT | `/:id/read` | ✓ | Mark as read |

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | – | `{ success: true, timestamp, env }` |

---

## Database Schema

### `User`
```js
{
  name, email, password (bcrypt), role: 'USER'|'DRIVER'|'ADMIN',
  phone, avatar,
  isStudent, collegeEmail, collegeId, isVerified,
  rating, totalRatings,
  walletBalance,
  refreshToken,
  resetPasswordOTP, resetPasswordOTPExpires,
  createdAt, updatedAt
}
```

### `Trip`
```js
{
  driver: ObjectId<User>,
  from, to, fromCoords: {lat,lng}, toCoords: {lat,lng},
  stops: [{ name, coords }],
  distance (km), departureTime, arrivalTime,
  pricePerSeat, availableSeats, totalSeats,
  vehicleType: 'CAR'|'BIKE'|'AUTO',
  status: 'SCHEDULED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED',
  passengers: [ObjectId<User>],
  femaleOnly, ac, petsAllowed,
  createdAt
}
```

### `Booking`
```js
{
  user: ObjectId<User>,
  trip: ObjectId<Trip>,
  seatsBooked,
  totalPrice,
  status: 'PENDING'|'CONFIRMED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED',
  paymentMethod: 'WALLET'|'RAZORPAY',
  payment: ObjectId<Payment>,
  driverEarnings, platformFee,
  startTime, endTime,
  rating, review,
  cancellationReason,
  createdAt
}
```

### `Payment`
```js
{
  user: ObjectId<User>,
  amount, type: 'CREDIT'|'DEBIT',
  status: 'PENDING'|'SUCCESS'|'FAILED',
  method: 'RAZORPAY'|'WALLET',
  transactionId,
  razorpayOrderId, razorpayPaymentId,
  wallet: ObjectId<WalletTransaction>,
  description, createdAt
}
```

### `WalletTransaction`
```js
{
  user: ObjectId<User>,
  amount, type: 'CREDIT'|'DEBIT',
  balanceAfter,
  description, booking: ObjectId<Booking>,
  createdAt
}
```

### `Chat`
```js
{
  participants: [ObjectId<User>],
  messages: [{
    sender: ObjectId<User>,
    text, timestamp,
    readBy: [ObjectId<User>]
  }],
  lastMessage, lastMessageTime,
  createdAt
}
```

### `OTP`
```js
{
  user: ObjectId<User>,
  type: 'TRIP_START'|'TRIP_END'|'BOOKING_CANCEL'|'TRIP_CANCEL',
  code (6 digits),
  trip: ObjectId<Trip>,
  booking: ObjectId<Booking>,
  expiresAt, used, attempts,
  createdAt
}
// TTL index: documents auto-delete when expiresAt passes
```

### `Notification`
```js
{
  user: ObjectId<User>,
  type: 'BOOKING_CREATED'|'TRIP_COMPLETED'|'OTP_GENERATED'|'PAYMENT_RECEIVED'|…,
  title, message, link, icon, read,
  createdAt
}
```

---

## Usage Examples

### Register and Login (cURL)
```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"Demo@1234"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Demo@1234"}'
# → { data: { token, refreshToken, user } }

# Use the token
TOKEN="eyJhbGciOi..."
curl http://localhost:5001/api/auth/profile -H "Authorization: Bearer $TOKEN"
```

### Search Trips
```bash
curl "http://localhost:5001/api/trips/search?from=Delhi&to=Jaipur&date=2026-05-10"
```

### Create a Booking
```bash
curl -X POST http://localhost:5001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"tripId":"<trip-id>","seatsBooked":1,"paymentMethod":"WALLET"}'
```

### Chat (polling example)
```bash
# Get messages updated since a timestamp
curl "http://localhost:5001/api/chat/<chatId>/messages?since=2026-05-10T12:00:00Z" \
  -H "Authorization: Bearer $TOKEN"
```

### JavaScript (axios) — using the built-in service
```js
import api from '@/services/api'
import chatService from '@/services/chatService'

// Login
await api.post('/auth/login', { email, password })

// Chat
chatService.connect(localStorage.getItem('co-ride-token'))
chatService.onMessage((msg) => console.log('New:', msg.text))
await chatService.sendMessage(chatId, 'Hello!')
```

---

## Screenshots

Place your own screenshots under `docs/screenshots/` and they'll be referenced here:

| Screen | Description |
|---|---|
| `landing.png` | Marketing landing page with search |
| `trips.png` | Trip search results |
| `trip-detail.png` | Trip detail with Leaflet route map |
| `booking.png` | Booking confirmation |
| `wallet.png` | Wallet top-up via Razorpay |
| `chat.png` | Real-time chat between driver and passenger |
| `driver-dashboard.png` | Driver's trip and earnings overview |
| `admin-dashboard.png` | Admin analytics |

```
docs/screenshots/
├── landing.png
├── trips.png
├── trip-detail.png
├── booking.png
├── wallet.png
├── chat.png
├── driver-dashboard.png
└── admin-dashboard.png
```

> A reference set of screenshots from the latest QA pass is included in the project's previous QA artifacts; they aren't tracked in git due to size.

---

## Deployment

Co-Ride is designed to deploy on **any** Node-friendly host. The backend auto-detects the environment via the `VERCEL` env var.

### Option A — Vercel Monorepo (single domain)

Best for low-traffic projects. The frontend and backend share one domain.

1. Push your repo to GitHub.
2. On [vercel.com](https://vercel.com), click **New Project** → import the repo.
3. Vercel reads `vercel.json` automatically:
   - `api/*` → serverless Express handler
   - `frontend/dist/*` → static React build
4. In **Settings → Environment Variables**, add:
   - `MONGODB_URI` (Atlas)
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` (generate fresh ones)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `CLIENT_URL` (your Vercel domain, e.g. `https://co-ride.vercel.app`)
   - SMTP credentials if you use email
5. Deploy. Vercel gives you `https://co-ride.vercel.app`.

> ⚠️ Vercel hobby plan caps request bodies at **4.5 MB**. Keep `MAX_UPLOAD_SIZE_MB=4`. Socket.IO is not available on Vercel — chat uses HTTP polling.

### Option B — Render (recommended for production)

`render.yaml` is a Render Blueprint. Both services deploy together.

1. Push your repo to GitHub.
2. On [render.com](https://render.com), click **New** → **Blueprint**.
3. Connect your repo. Render detects `render.yaml` and provisions:
   - `co-ride-api` (Node web service, `ENABLE_SOCKET=true`)
   - `co-ride-web` (static site for the frontend)
4. Set environment variables in the Render dashboard:
   - `MONGODB_URI` (Atlas)
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `CLIENT_URL=https://co-ride-web.onrender.com`
   - SMTP credentials
5. Render auto-builds and deploys on every push.

### Option C — Railway

1. `npm install -g @railway/cli`
2. `railway login`
3. From the project root: `railway up`
4. In the Railway dashboard, add a MongoDB plugin or point `MONGODB_URI` at Atlas.
5. Add the same env vars as Render.

### Option D — Manual VPS (DigitalOcean, Linode, EC2)

```bash
# On the server
git clone https://github.com/<your-org>/co-ride.git
cd co-ride/backend
npm ci --production

# Build frontend
cd ../frontend
npm ci
npm run build

# Run backend with PM2
cd ../backend
pm2 start src/server.js --name co-ride-api
pm2 save
pm2 startup

# Serve frontend with nginx (point root at frontend/dist)
```

---

## Troubleshooting

### `ECONNREFUSED 127.0.0.1:27017` on backend start
MongoDB isn't running. Either `mongod` locally or set `MONGODB_URI` to your Atlas cluster.

### Login redirects back to login every few minutes
Token refresh failed. Check that `JWT_SECRET` and `JWT_REFRESH_SECRET` haven't changed between deploys. The browser console should show `/auth/refresh` responses — `200` means OK, `401` means the refresh token is no longer valid.

### Razorpay payment stuck on "Verifying…"
Check the browser console. The frontend `paymentService.verify` should receive `200`. If you see `400`, the most common cause is using a test key against live mode (or vice versa). Verify `RAZORPAY_KEY_ID` matches `rzp_test_*` for test cards.

### Maps not rendering on Trip Detail / Create Trip
Two possible causes:
1. `LocationSearch` returns coordinates only when picking from the autocomplete dropdown — typing manually never returns coords.
2. If you switched to Google Maps, `VITE_GOOGLE_MAPS_API_KEY` must be set **and** the key must allow your origin in Google Cloud Console.

### `413 Payload Too Large` on document upload
Increase `MAX_UPLOAD_SIZE_MB` (Render/Railway only — Vercel caps at 4.5 MB). For larger files, integrate Cloudinary and upload directly from the client.

### Chat shows "connecting…" forever
On serverless hosts (Vercel), Socket.IO is unavailable. The frontend automatically falls back to polling. If polling doesn't work, check that the backend is reachable at `VITE_API_URL`.

### `npm install` fails with `gyp ERR! find Python`
Some packages (older bcrypt, sharp) need native build tools. Co-Ride uses **bcryptjs** which is pure JS — no native deps. If you still hit this, run `npm install --ignore-scripts` then `npm rebuild`.

---

## Security Notes

Co-Ride is hardened against the common vulnerabilities flagged in [CUSTOMER_READY_CHECKLIST.md](CUSTOMER_READY_CHECKLIST.md):

| Concern | Mitigation |
|---|---|
| Mass-assignment (`role: "ADMIN"` from client) | Server whitelists roles to `USER` and `DRIVER` on register |
| Credential stuffing | `express-rate-limit` caps login/register at **10 attempts / 15 min / IP** |
| Payment amount tampering | Server fetches canonical amount from Razorpay, never trusts client |
| Direct wallet credit (free money) | `POST /wallet/add` returns **403 in production**; wallet is only credited through verified `/payments/verify` |
| Unauthorized trip start/end/cancel | OTP verification checks `trip.driver === req.user._id` |
| Stolen JWT secret | Strong secret generator instructions in `.env.example`; secrets are server-only |
| XSS / clickjacking | `helmet` sets CSP, X-Frame-Options, etc. |
| CORS abuse | `CLIENT_URL` allowlist + auto-allow common preview domains |
| Mongo injection | Mongoose sanitizes all queries by default |
| Large body DoS | `express.json({ limit })` with custom 413 handler |
| Refresh token replay | Server rotates refresh tokens on every refresh |

### Reporting a vulnerability
Please email **security@coride.com** (or open a private GitHub Security Advisory). Do not file public issues for suspected vulnerabilities.

---

## Contributing

We welcome contributions! Co-Ride is an open-source-style project and we appreciate:

- 🐛 Bug reports via GitHub Issues
- 💡 Feature requests with use-case context
- 🔧 Pull requests for documented bugs or roadmap items
- 📖 Documentation improvements

### Development Workflow

1. Fork the repo and clone your fork.
2. Create a feature branch: `git checkout -b feat/awesome-thing`
3. Make your changes. Run the test suite if applicable.
4. Ensure `npm run build` succeeds in `frontend/`.
5. Open a PR against `main`. Fill out the PR template.
6. Wait for CI to pass and a maintainer to review.

### Code Style

- Backend: ESM modules, async/await, 2-space indentation.
- Frontend: functional components + hooks, Redux Toolkit slices, Tailwind utility classes.
- Commit messages: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, etc.)

### Project Conventions

- All money values are in **rupees** (integer or decimal) on the wire — Razorpay receives paise.
- API responses follow `{ success: true, data: {...} }` or `{ success: false, message: '...' }`.
- Errors are surfaced as JSON `4xx`/`5xx` with a `message` field; never return HTML.
- Frontend never trusts its own state — critical data is re-fetched on mount.

---

## License

Co-Ride is released under the **MIT License**. You are free to use, modify, and distribute the code, provided you keep the copyright notice.

```
MIT License

Copyright (c) 2026 Co-Ride Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

## Contact

| Channel | Contact |
|---|---|
| 🐛 Bug reports | [GitHub Issues](../../issues) |
| 💬 Discussions | [GitHub Discussions](../../discussions) |
| 🔐 Security | security@coride.com |
| 📧 General | hello@coride.com |
| 🐦 Twitter / X | [@corideapp](https://twitter.com/corideapp) |

### Maintainers

- **Project Lead** — _Your Name_ · [GitHub](https://github.com/your-handle)
- **Backend Lead** — _Contributor_ · [GitHub](https://github.com/contributor)

---

## Acknowledgements

- [OpenStreetMap](https://www.openstreetmap.org/) contributors for free map data
- [Leaflet](https://leafletjs.com/) for the open-source mapping library
- [Razorpay](https://razorpay.com/) for payment infrastructure
- [MongoDB](https://www.mongodb.com/) for the database
- Everyone who has filed an issue, opened a PR, or starred the repo ❤️

---

<p align="center">
  <strong>Happy riding!</strong> 🚗💨
</p>