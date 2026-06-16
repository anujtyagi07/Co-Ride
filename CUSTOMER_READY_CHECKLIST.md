# Customer-Ready Checklist — Co-Ride

Derived from `QA_REPORT.md` (2026-05-12). Items are grouped by "ship-gate" so you can knock out blockers first, then security, then UX polish, then nice-to-haves. Tick each line as you finish.

---

## STAGE 0 — BLOCKERS (must fix before anyone touches the product)

Without these, core flows are broken or money/data is at risk.

### 0.1 Money & Auth Security
- [ ] **Remove or gate `POST /wallet/add`** — currently credits any amount for free. Either delete and route all top-ups through `/payments/verify`, or require a verified Razorpay `paymentId`. (`backend/src/controllers/walletController.js:24-57`)
- [ ] **Remove or gate `POST /wallet/withdraw`** — drains balance with no payout integration. Disable in prod until a real disbursement provider is wired. (`walletController.js:62-100`)
- [ ] **Fix `verifyPayment` to use server-side amount** — fetch `razorpay.orders.fetch(orderId)` and credit by `order.amount/100` instead of trusting `req.body.amount`. (`paymentController.js:54-105`)
- [ ] **Rotate the leaked Google Maps key** — `frontend/.env:8` is committed. Rotate at console.cloud.google.com, restrict by referrer, add `.env` to `.gitignore`, replace with `.env.example` placeholder.
- [ ] **Generate strong JWT secrets** — `backend/.env:9-10` uses `co-ride-jwt-secret-dev-2024`. Replace with 64+ random bytes for any deployed env.
- [ ] **Add login/register rate limits** — `express-rate-limit({ windowMs: 15*60*1000, max: 5 })` on `/auth/login` and `/auth/register`. (`authRoutes.js`)
- [ ] **Stop accepting `role` from `register` body** — force `USER` or whitelist `USER|DRIVER`. Currently a client can request `role: 'ADMIN'`. (`authController.js:55-64`)

### 0.2 Broken Core Flows
- [ ] **Fix maps not rendering** — return `coordinates` from `searchLocations` in `backend/src/utils/cities.js:467-500`. `LocationSearch` already wires `suggestion.coordinates` through; the backend just never sends them, so `CreateTrip`/`TripDetail` show only the placeholder.
- [ ] **Fix chat history** — frontend calls `GET /chat/:id`, backend route is `GET /chat/:id/messages`. Update `Chat.jsx:193`.
- [ ] **Fix driver bookings 404** — `bookingService.getMyBookings` calls `/bookings/my`; real route is `/bookings/driver/my`. Update `bookingService.js:8`.
- [ ] **Fix chat socket auth** — `Chat.jsx:50` reads `localStorage.getItem('token')` but auth slice stores under `co-ride-token`. Socket connection currently always fails.
- [ ] **Fix `Bookings.jsx` cancel modal crash** — `onClick={handleCancelBooking}` on line 247 references an undefined function. Either delete the dead `Modal` block (218-252) or wire it to `otpService.requestCancelBooking`.
- [ ] **Fix `LiveLocationTracker` ReferenceError** — declare `const mapInstanceRef = useRef(null)` inside the component. (`OpenStreetMap.jsx:212-245`)
- [ ] **Fix `Register.jsx` post-signup redirect** — currently auto-logs-in then navigates to `/login`. Navigate to `/dashboard` instead. (`Register.jsx:49-53`)
- [ ] **Fix double-decrement of seats** — `verifyTripStartOTP` subtracts `availableSeats` again after `createBooking` already did. Delete the line. (`otpController.js:115-120`)
- [ ] **Fix `Trips.jsx` filters effect deps** — add `filters` to deps array or wire filter changes to a refetch. Currently filter UI looks live but isn't. (`Trips.jsx:14-16`)
- [ ] **Fix `TripDetail.jsx` Cancel button** — it sends the trip id where a booking id is required. Move cancel UI to `Bookings` page. (`TripDetail.jsx:65-77`)

### 0.3 Config Drift
- [ ] **Align backend port** — `backend/.env` says 5001, `.env.example` says 5000, Vite proxy targets 5001. Pick one (5001) and update `.env.example` + docs.
- [ ] **Fix `CLIENT_URL` and socket URL** — backend `.env` says `http://localhost:3001`; Vite runs on 3000. `chatService.js:3` defaults `SOCKET_URL` to 5000. Align all three and have backend actually read `CLIENT_URL` for CORS.
- [ ] **Stop hard-coding CORS origins** — read from env (`CLIENT_URL` + production domain). (`backend/src/index.js:25-41`)

---

## STAGE 1 — HIGH (data correctness, broken UX, must-fix before customer use)

### 1.1 Backend correctness
- [ ] **Wrap `createBooking` in a Mongo transaction** — wallet debit, passenger push, trip save, payment create must succeed or roll back together. (`bookingController.js:55-165`)
- [ ] **Fix driver authorization check** — `booking.trip.driver._id !== req.user._id` is broken because `driver` is an unpopulated ObjectId. Use `.toString()` comparison. (`bookingController.js:39`)
- [ ] **Change `createBooking` initial status to `PENDING`** — current `CONFIRMED` on creation breaks the driver Confirm button and the PENDING→CONFIRMED workflow. (`bookingController.js:113-118`)
- [ ] **Real file upload for driver docs** — replace base64 `data:` URL persistence with Cloudinary/S3 upload; validate URL before saving. Will currently 413 on any photo >75 KB and risk hitting Mongo's 16 MB document limit. (`driverController.js:222-262`, `DriverVerification.jsx:101-103`)
- [ ] **Set Express body limit** — `app.use(express.json({ limit: '10mb' }))` so legitimate uploads aren't silently rejected. (`backend/src/index.js:51-52`)
- [ ] **Restrict OTP trip-start to driver only** — currently any authenticated user with the code can start the trip. Check `req.user._id === trip.driver`. (`otpController.js:66-127`)
- [ ] **Use `OTP.verify()` method** — current `verifyTripStartOTP` increments attempts but never enforces the cap. (`otpController.js:92`)
- [ ] **Fix chat participant check** — `chat.participants.includes(req.user._id)` returns false for ObjectIds. Use `.some(p => p.equals(req.user._id))`. (`chatController.js:73, 112, 187`)
- [ ] **Paginate `getAllUsers`** — currently dumps every user record. (`adminController.js:7-15`)
- [ ] **Real college email verification** — `verifyStudent` currently flips `isVerified=true` purely on a client-supplied `collegeId`. Use `verifyCollegeEmail()` and require a confirmation step. (`authController.js:264-285`, `driverController.js:188-200`)

### 1.2 Frontend correctness
- [ ] **Implement JWT refresh interceptor** — currently 401 hard-redirects to `/login`; users get logged out every 15 minutes. Call `/auth/refresh` and retry. (`api.js:32-50`)
- [ ] **Fix dead routes referenced by UI** — either add stub pages or delete the links: Footer `/about`, `/careers`, `/blog`, `/help`, `/contact`, `/safety`, `/privacy`, `/terms`, `/cookies`; `/profile`; `/forgot-password`.
- [ ] **Add catch-all 404 route** in `App.jsx` so missing routes don't render a blank page.
- [ ] **Fix `Dashboard`/`Bookings` filter status** — filters on `UPCOMING`, which isn't in the Booking enum. Map to `PENDING`/`CONFIRMED`. (`Dashboard.jsx:19-20`, `Bookings.jsx:89`)
- [ ] **Fix message-sender comparison in Chat** — ObjectId vs string mismatch makes every message render as "other". (`Chat.jsx:197`)
- [ ] **Show correct trip total for verified students** — currently total ignores discount that backend will apply. (`TripDetail.jsx:280-284`)
- [ ] **Replace CDN Leaflet load with npm import** — fixes race conditions where the map silently fails to init on slow networks. Install `leaflet`, import CSS in `index.css`. (`OpenStreetMap.jsx:23-43`)
- [ ] **Add Leaflet `map.remove()` on unmount** — current "cleanup not needed" comment leaks the map and triggers "Map container is already initialized" on remount. (`OpenStreetMap.jsx:126-128`)

---

## STAGE 2 — MEDIUM (polish & robustness for production confidence)

### 2.1 Backend
- [ ] Cancellation business rules: align `verifyCancelBooking` fee logic with `cancelBooking` so refund amount is identical regardless of which path runs. (`otpController.js:264-314`)
- [ ] Prevent updates to trip coords/time if PENDING bookings exist, not just CONFIRMED. (`tripController.js:151-156`)
- [ ] Validate `Number(amount)` in wallet endpoints (string `"100"` corrupts balance to `"0100"`). (`walletController.js:35-38`)
- [ ] Don't expose `collegeEmail` on the public `getTrips`. (`tripController.js:7-65`)
- [ ] Block last-admin demotion. (`adminController.js:39-66`)
- [ ] Initialize Razorpay at startup; fail fast on bad credentials. (`paymentController.js:8-18`)
- [ ] Fail-fast or surface DB status if `connectDB` fails in production. (`backend/src/index.js:188-190`)
- [ ] Set `mongoose.set('strictQuery', true)`; remove deprecated `useNewUrlParser`/`useUnifiedTopology`. (`backend/src/index.js:180-183`)
- [ ] Move heavy `getDriverDashboard` filtering into a Mongo aggregation. (`driverController.js:9-49`)
- [ ] Real SMS/email OTP delivery (Twilio/SES) — currently OTP only lives in DB and is never sent. Document or implement.

### 2.2 Frontend
- [ ] Decode JWT `exp` on app boot (or call `/auth/profile`) so stale tokens don't briefly mark user as authenticated. (`authSlice.js:6-35`)
- [ ] Replace manual `auth/logout/fulfilled` dispatch with `dispatch(logout())` so the server clears `refreshToken`. (`api.js:41-44`)
- [ ] Wallet "Add Money" should run Razorpay checkout, not call `/wallet/add` directly. (`Wallet.jsx:16-24`)
- [ ] Remove or gate the hard-coded mock chat conversations behind a `?demo=true` flag. (`Chat.jsx:138-173`)
- [ ] Reset `LocationAutocomplete` to instantiate Google Places `Autocomplete` once on mount, not on every keystroke. (`MapComponents.jsx:165-225`)
- [ ] Clear old Google Maps markers on coord change. (`MapComponents.jsx:65-126`)
- [ ] Re-center / `invalidateSize()` Leaflet map when only one coord is set. (`OpenStreetMap.jsx:49-61`)
- [ ] `Bookings.jsx` reads `booking.trip?.rating`; should be `booking.rating`. Stars always render 0. (`Bookings.jsx:175`)
- [ ] `Register.jsx` set `defaultValues: { role: 'USER' }` so Zod doesn't throw obscure errors. (`Register.jsx:14-21`)
- [ ] Defensive `Number(balance || 0).toFixed(2)` and `(stats?.revenue || 0).toLocaleString()` for transient nulls. (`Dashboard.jsx:40`, `AdminDashboard.jsx:99-104`)
- [ ] `Trips.jsx`: persist `searchFrom`/`searchTo` into Redux filters so Clear actually clears them. (`Trips.jsx:18-21`)
- [ ] `Wallet` slice should merge new transactions with existing, not replace. (`walletSlice.js:67-73`)

### 2.3 Test & Verify
- [ ] Run `comprehensive-test.ps1` end-to-end and capture pass/fail.
- [ ] Manually verify each flow in a browser against the screenshots in the repo (landing, login, trips, trip detail with map, booking, wallet top-up via Razorpay test mode, chat with two users, driver create-trip, OTP start/cancel, admin dashboard).
- [ ] Add a basic CI: `npm run build` for frontend + `npm test` (if any) on every push.

---

## STAGE 3 — LOW (nice-to-have polish, do after launch if time-pressed)

- [ ] Pluralize "seats left". (`Trips.jsx:151`)
- [ ] Hide Footer on `/chat`. (`Layout.jsx`)
- [ ] `College quick-select` shouldn't silently overwrite user-typed email local-part. (`DriverVerification.jsx:497-515`)
- [ ] Replace `[...Array(...)]` seat-select pattern with explicit count guard. (`TripDetail.jsx:259-261`)
- [ ] Use `Controller` from react-hook-form for `CreateTrip` inputs instead of `watch + value`. (`CreateTrip.jsx:80-87`)
- [ ] Delete the unused `User.methods.updateRating` model method or rewire `rateBooking` to use it. (`User.js:122-127`, `bookingController.js:255-281`)
- [ ] Reconcile the two `cancelTrip` implementations (admin vs driver) to share a single helper. (`adminController.js:115-140`, `tripController.js:182-217`)
- [ ] Remove the `setSuccessMessage` timeout in `Login.jsx` on unmount. (`Login.jsx:23-29`)
- [ ] Tidy mixed-leading-slash route paths in `App.jsx`.

---

## Suggested execution order

1. **Day 1** — Stage 0.1 (security) and 0.3 (config). One developer can fully clear these.
2. **Day 1–2** — Stage 0.2 (broken flows). These are mostly small, surgical edits.
3. **Day 2–4** — Stage 1.1 + 1.2. The transaction + file upload work is the chunkiest item.
4. **Day 5** — Stage 2 polish + end-to-end verification with `comprehensive-test.ps1` and manual browser walk-through.
5. **Post-launch** — Stage 3 polish.

Once Stages 0 and 1 are clean, the product is functionally customer-ready. Stage 2 brings it to production-confident.
