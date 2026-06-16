# QA Audit Report — 2026-05-12

Read-only audit of the Co-Ride project at `D:/Github` (Vite + React frontend, Node/Express + Mongoose backend).

## Executive Summary

Top issues to fix first (severity in brackets):

1. **[Critical]** Maps never render markers/routes from picker selections — `searchLocations` in `backend/src/utils/cities.js` never returns coordinates, but `LocationSearch` and `CreateTrip` rely on `suggestion.coordinates`. See [Section 5](#5-map-visibility--detailed-audit).
2. **[Critical]** Google Maps API key committed to `frontend/.env` (live key visible in repo). See [Section 8](#8-config--env).
3. **[Critical]** `Chat.jsx` calls `GET /chat/:chatId` for messages but the backend route is `GET /chat/:chatId/messages` — chat history never loads. See [Section 3](#3-route-contract-mismatches-frontend--backend).
4. **[Critical]** `bookingService.getMyBookings` hits `/bookings/my` but the backend route is `/bookings/driver/my` — 404 for driver bookings. See [Section 3](#3-route-contract-mismatches-frontend--backend).
5. **[Critical]** `LiveLocationTracker` references `mapInstanceRef` that is never declared inside its scope — ReferenceError on every use. See [Section 5](#5-map-visibility--detailed-audit).
6. **[Critical]** `Bookings.jsx` references `handleCancelBooking` (line 247) that is never defined — runtime crash if the dead cancel-modal path is ever wired up. See [Section 4](#4-pages--per-page-findings).
7. **[High]** `verifyTripStartOTP` double-decrements `availableSeats` — seats are already subtracted at booking creation (`bookingController.createBooking`). See [Section 7](#7-backend-correctness).
8. **[High]** Vite dev proxy targets `localhost:5001`, but `backend/.env.example` and rate-limit config assume `:5000`. New devs copying `.env.example` will see ECONNREFUSED. See [Section 8](#8-config--env).
9. **[High]** `api.js` interceptor on 401 dispatches `auth/logout/fulfilled` and `window.location='/login'` without ever attempting refresh — short 15-min token forces re-login on every idle session. See [Section 6](#6-auth--state).
10. **[High]** Many routes still missing `authorize('ADMIN')` checks at the per-handler level (covered by `router.use(authorize('ADMIN'))` for admin routes, but trip/booking routes rely on inline `if` checks that bypass middleware on some paths). See [Section 1](#1-backend-routes).

---

## 1. Backend Routes

### Auth (`backend/src/routes/authRoutes.js`)

| Method | Path | Handler | Protected | Notes |
|---|---|---|---|---|
| POST | `/api/auth/register` | `register` | No | No rate limit beyond global 100/15min — see High below |
| POST | `/api/auth/login` | `login` | No | Same — brute-force exposure |
| POST | `/api/auth/refresh` | `refreshToken` | No | OK |
| POST | `/api/auth/logout` | `logout` | Yes | OK |
| GET | `/api/auth/profile` | `getProfile` | Yes | OK |
| PUT | `/api/auth/profile` | `updateProfile` | Yes | Only allows name/phone/avatar — good |
| PUT | `/api/auth/change-password` | `changePassword` | Yes | OK |
| POST | `/api/auth/verify-student` | `verifyStudent` | Yes | OK but self-verify without server-side check, see High |

Issues:
- `backend/src/routes/authRoutes.js:7-8` — **High** — No dedicated rate limiter on `/login` and `/register`. Global limiter is 100 req per 15 min per IP across all `/api` — way too permissive for credential endpoints. Suggest add `express-rate-limit({windowMs: 15*60*1000, max: 5})` on these two routes.
- `backend/src/controllers/authController.js:264-285` — **High** — `verifyStudent` sets `isVerified=true` purely on user-supplied `collegeId` with no domain check or admin step. Spec calls for college email verification; current impl is "trust the client". Suggest verify `collegeEmail` against `verifyCollegeEmail()` before granting `isVerified=true`.
- `backend/src/controllers/authController.js:55-64` — **Medium** — `register` accepts `role` from body. If a malicious client sends `role: 'ADMIN'` they get an admin account. Mass-assignment risk. Suggest whitelist to `USER`/`DRIVER` or always force `USER` and only let admin endpoints change roles.
- `backend/src/controllers/authController.js:44-52` — **Medium** — Student email validation is `email.includes('@')` — trivially bypassed. Use `verifyCollegeEmail()` for proper check.
- `backend/src/controllers/authController.js:220` — **Low** — `.select('+refreshToken')` works, but the User schema's `toJSON` deletes `refreshToken`, so any populate that runs JSON serialization will fail to strip it on the wire. Not exploitable, just noisy.

### Trips (`backend/src/routes/tripRoutes.js`)

| Method | Path | Handler | Protected | Notes |
|---|---|---|---|---|
| GET | `/api/trips` | `getTrips` | No | OK |
| GET | `/api/trips/search` | `searchTrips` | No | OK |
| GET | `/api/trips/:id` | `getTripById` | No | OK |
| GET | `/api/trips/driver/my` | `getMyTrips` | Yes, DRIVER/ADMIN | OK |
| POST | `/api/trips` | `createTrip` | Yes, DRIVER/ADMIN | OK |
| PUT | `/api/trips/:id` | `updateTrip` | Yes, DRIVER/ADMIN | Ownership check inside |
| PUT | `/api/trips/:id/cancel` | `cancelTrip` | Yes, DRIVER/ADMIN | Ownership check inside |

Issues:
- `backend/src/controllers/tripController.js:91-100` — **Medium** — `createTrip` does a redundant role check inside the controller in addition to `authorize('DRIVER','ADMIN')` middleware; both will pass. Dead code, but harmless. Suggest delete.
- `backend/src/controllers/tripController.js:151-156` — **Medium** — `updateTrip` blocks updates if there are CONFIRMED/IN_PROGRESS bookings, but allows changes to `fromCoords`, `toCoords`, and `departureTime` if only PENDING bookings exist. Pending booking passengers would silently get a different trip. Suggest also block on PENDING.
- `backend/src/controllers/tripController.js:7-65` — **Low** — Returns `data` of trips but uses `.populate('driver', 'name rating isStudent collegeEmail')` — `collegeEmail` is a privacy leak in a public endpoint. Suggest drop `collegeEmail` from public projection.
- `backend/src/controllers/tripController.js:46-55` — **Low** — Pagination skip uses `Number(page)` without guarding against `NaN`/negative; client could pass `?page=-1` and get duplicate results. Suggest `Math.max(1, Number(page) || 1)`.

### Bookings (`backend/src/routes/bookingRoutes.js`)

| Method | Path | Handler | Protected | Notes |
|---|---|---|---|---|
| GET | `/api/bookings` | `getBookings` | Yes | OK |
| GET | `/api/bookings/:id` | `getBookingById` | Yes | Ownership check inside |
| POST | `/api/bookings` | `createBooking` | Yes | OK |
| PUT | `/api/bookings/:id/cancel` | `cancelBooking` | Yes | OK |
| PUT | `/api/bookings/:id/rate` | `rateBooking` | Yes | OK |
| GET | `/api/bookings/driver/my` | `getMyBookings` | Yes, DRIVER/ADMIN | OK |

Issues:
- `backend/src/controllers/bookingController.js:39` — **High** — Authorization compares `booking.trip.driver._id !== req.user._id` but `booking.trip` is populated and `driver` is only an ObjectId (no further populate), so `driver._id` is `undefined`. Drivers will be blocked from viewing their own bookings, OR if `populate` chain ever changes, the check silently passes. Use `booking.trip.driver.toString() === req.user._id.toString()`.
- `backend/src/controllers/bookingController.js:55-165` — **High** — `createBooking` is NOT wrapped in a Mongo transaction. The sequence (deduct wallet → push passenger → save trip → create payment) can leave the DB partially updated if any step fails. Suggest use `mongoose.startSession()` + `withTransaction`.
- `backend/src/controllers/bookingController.js:215` — **Medium** — Inside `WalletTransaction.create` the `balanceAfter` is calculated via an extra `User.findById(booking.user)` query — N+1 and racy. Use the in-memory balance after `$inc`.
- `backend/src/controllers/bookingController.js:113-118` — **Medium** — Booking is created with `status: 'CONFIRMED'` immediately on creation, bypassing the PENDING → CONFIRMED workflow that `driverController.updateBookingStatus` and the OTP flows expect. Drivers' `Confirm` button will fail with "Booking cannot be confirmed".
- `backend/src/controllers/bookingController.js:121-127` — **Medium** — `trip.passengers.push(...)` and `trip.save()` while another request could also be reading `availableSeats`. Combined with no transaction, oversells are possible.

### Wallet (`backend/src/routes/walletRoutes.js`)

| Method | Path | Handler | Protected | Notes |
|---|---|---|---|---|
| GET | `/api/wallet` | `getWallet` | Yes | OK |
| POST | `/api/wallet/add` | `addMoney` | Yes | DANGER: see below |
| POST | `/api/wallet/withdraw` | `withdraw` | Yes | DANGER: see below |
| GET | `/api/wallet/transactions` | `getWalletTransactions` | Yes | OK |

Issues:
- `backend/src/controllers/walletController.js:24-57` — **Critical** — `addMoney` accepts any amount from the body and credits the wallet with NO payment verification. Any logged-in user can top up to infinity for free. Suggest remove this endpoint entirely or require a verified Razorpay payment ID.
- `backend/src/controllers/walletController.js:62-100` — **Critical** — `withdraw` deducts from wallet with no withdrawal integration; user balance can be drained with no funds disbursement (or, in dev, used to mint balance via add/withdraw loops if combined with the above bug). Mark explicitly unsupported in prod.
- `backend/src/controllers/walletController.js:35-38` — **Medium** — No `Number(amount)` cast. If client sends `"100"` (string), JS does `walletBalance += "100"` and balance becomes `"0100"`. Suggest validate as number.

### Payments (`backend/src/routes/paymentRoutes.js`)

| Method | Path | Handler | Protected | Notes |
|---|---|---|---|---|
| POST | `/api/payments/create-order` | `createOrder` | Yes | OK |
| POST | `/api/payments/verify` | `verifyPayment` | Yes | See below |
| GET | `/api/payments/transactions` | `getPaymentTransactions` | Yes | OK |

Issues:
- `backend/src/controllers/paymentController.js:54-105` — **High** — `verifyPayment` trusts `amount` from the request body. After Razorpay signature passes, it credits the wallet by whatever amount the client said it was — never re-fetches order amount from Razorpay. Suggest fetch the order via `razorpay.orders.fetch(razorpayOrderId)` and use `order.amount/100`.
- `backend/src/controllers/paymentController.js:8-18` — **Medium** — Top-level `await import('razorpay')` inside a `try/catch` — works only because the file is treated as a module with TLA. If anything throws after this (e.g. bad credentials), `razorpay` stays null and the entire controller silently degrades. Suggest move to lazy init or validate at startup.

### Admin (`backend/src/routes/adminRoutes.js`)

All routes guarded by `router.use(protect, authorize('ADMIN'))` — good.

Issues:
- `backend/src/controllers/adminController.js:7-15` — **High** — `getAllUsers` returns every user including sensitive fields. The `toJSON` strips `password` and `refreshToken`, but it's still a privacy concern to dump every email/phone/college email/avatar without pagination. Suggest paginate and project only needed fields.
- `backend/src/controllers/adminController.js:39-66` — **Medium** — `updateUserRole` allows an admin to demote themselves to USER then no admin exists. Suggest forbid demotion of the last ADMIN.

### Chat (`backend/src/routes/chatRoutes.js`)

| Method | Path | Handler | Protected | Notes |
|---|---|---|---|---|
| GET | `/api/chat` | `getConversations` | Yes | OK |
| POST | `/api/chat` | `getOrCreateChat` | Yes | OK |
| GET | `/api/chat/:chatId/messages` | `getMessages` | Yes | See contract-mismatch §3 |
| POST | `/api/chat/:chatId/messages` | `sendMessage` | Yes | OK |
| PUT | `/api/chat/:chatId/read` | `markAsRead` | Yes | OK |
| DELETE | `/api/chat/:chatId` | `deleteChat` | Yes | OK |

Issues:
- `backend/src/controllers/chatController.js:73, 112, 187` — **Medium** — `chat.participants.includes(req.user._id)` compares an ObjectId array against a Mongoose ObjectId via `Array.prototype.includes` which uses strict equality. This frequently returns false even when the user IS a participant. Use `chat.participants.some(p => p.equals(req.user._id))`.

### OTP (`backend/src/routes/otpRoutes.js`)

All routes `protected`. Driver-side endpoints have `authorize('DRIVER','ADMIN')`.

Issues:
- `backend/src/controllers/otpController.js:115-120` — **High** — `verifyTripStartOTP` does `trip.availableSeats -= booking.seatsBooked` again, but seats were already subtracted in `createBooking`. Double-decrement; eventually goes negative or fails Mongoose min validator. Suggest delete this line.
- `backend/src/controllers/otpController.js:66-127` — **High** — `verifyTripStartOTP` allows ANY authenticated user (incl. passengers) to start a trip if they know the 6-digit code. No driver-vs-passenger check; flow described in spec says driver enters passenger's code, but the route doesn't enforce who.
- `backend/src/controllers/otpController.js:92` — **Medium** — Wrong-code path increments `attempts` but never enforces the cap (the `verify` instance method on the model does, but route doesn't call it). Suggest use `otpRecord.verify(code)` from `OTP.js:73-83`.
- `backend/src/controllers/otpController.js:264-314` — **Medium** — `verifyCancelBooking` refunds full `totalPrice` without applying the cancellation fee logic from `cancelBooking` — inconsistent business rules between the two cancel paths.
- `backend/src/controllers/otpController.js` (all `requestX` handlers) — **Medium** — Generates OTP and "sends" it without ever invoking SMS/email. There's no out-of-band delivery; OTP only exists in DB, which is fine for dev but means the response would need to surface it for testing. The route doesn't return it either. Document this gap.

### Colleges (`backend/src/routes/collegeRoutes.js`)

Issues:
- `backend/src/routes/collegeRoutes.js:140-149` and `155-165` — **Low** — `/state/:state` and `/city/:city` are defined AFTER routes like `/states`, `/cities`, `/search`, `/verify-email` (line 13-133), so they don't shadow. But `/nearby` (line 172) is defined AFTER `/state/:state` and `/city/:city` patterns — Express will match `/nearby` to none and fall through correctly. OK overall but ordering is fragile.
- `backend/src/routes/collegeRoutes.js:13-19` — **Low** — Returns the full `COLLEGES` array (~90 items) on `GET /`. No pagination. OK for now.

### Driver (`backend/src/routes/driverRoutes.js`)

All routes guarded by `protect` + `authorize('DRIVER','ADMIN')`.

Issues:
- `backend/src/controllers/driverController.js:9-49` — **Medium** — `getDriverDashboard` populates all bookings and trips, then filters in JS. With many trips/bookings this is O(N*M). Should use aggregation.
- `backend/src/controllers/driverController.js:188-200` — **Medium** — Auto-grants `isVerified=true` purely from `collegeEmail` domain match — see auth bug above.
- `backend/src/controllers/driverController.js:222-262` — **High** — `uploadDriverDocument` accepts a raw `fileUrl` from the client and stores it. There is no Cloudinary integration; the client sends a data URL or arbitrary string and it's persisted. The frontend (`DriverVerification.jsx:101-103`) actually sends `previews[field]` which is a base64 `data:` URL — these can be tens of MB and will blow past MongoDB's 16 MB document limit. Suggest implement real upload to S3/Cloudinary and validate URLs.

### Locations (`backend/src/routes/locationRoutes.js`)

All routes public. Issues:
- `backend/src/routes/locationRoutes.js:165-192` — **High** — `/autocomplete` returns suggestions without coordinates. The frontend `LocationSearch` expects `suggestion.coordinates` but it's always `undefined`. This is the root cause of the maps-don't-render bug. See §5.

---

## 2. Frontend Routes

Defined in `frontend/src/App.jsx`:

| Path | Component | Guarded | Notes |
|---|---|---|---|
| `/` | `Landing` | No | OK |
| `/login` | `Login` | No | OK |
| `/register` | `Register` | No | OK |
| `/trips` | `Trips` | No | OK |
| `/trips/:id` | `TripDetail` | No | OK |
| `/bookings` | `Bookings` | Yes (USER/DRIVER/ADMIN) | OK |
| `/wallet` | `Wallet` | Yes (USER/DRIVER/ADMIN) | OK |
| `/chat` | `Chat` | Yes (USER/DRIVER/ADMIN) | OK |
| `/admin` | `AdminDashboard` | Yes (ADMIN) | OK |
| `/dashboard` | `Dashboard` | Yes (USER/DRIVER/ADMIN) | OK |
| `/create-trip` | `CreateTrip` | Yes (DRIVER/ADMIN) | OK |
| `/driver-dashboard` | `DriverDashboard` | Yes (DRIVER/ADMIN) | OK |
| `/driver-verification` | `DriverVerification` | Yes (DRIVER/ADMIN) | OK |

Issues:
- `frontend/src/components/Footer.jsx:23-44` — **High** — Footer links to 9 routes (`/about`, `/careers`, `/blog`, `/help`, `/contact`, `/safety`, `/privacy`, `/terms`, `/cookies`) that are not defined in `App.jsx`. Clicking any of them shows a blank page under the Layout (no fallback 404). Suggest add a `*` fallback route or create placeholder pages.
- `frontend/src/pages/DriverDashboard.jsx:386-391` — **High** — Quick-action link to `/profile` exists, but no `/profile` route is defined. Same issue.
- `frontend/src/pages/Login.jsx:106-108` — **Medium** — Link to `/forgot-password` — no such route. Either delete the link or add the page.
- `frontend/src/App.jsx:22-66` — **Low** — Mixed leading-slash inconsistency: `path="login"` (relative) vs `path="/chat"` (absolute). Both work because they're nested under `path="/"`, but the absolute form is misleading inside a nested route.

---

## 3. Route Contract Mismatches (frontend ↔ backend)

| Frontend call | Expected backend | Actual backend | Severity | File |
|---|---|---|---|---|
| `GET /chat/${chatId}` | `GET /chat/:chatId` (no such route) | `GET /chat/:chatId/messages` | **Critical** | `frontend/src/pages/Chat.jsx:193` |
| `GET /bookings/my` | `GET /bookings/my` (no such route) | `GET /bookings/driver/my` | **Critical** | `frontend/src/services/bookingService.js:8` |
| `DELETE /trips/${id}` | `DELETE /trips/:id` (no such route) | Only `PUT /trips/:id/cancel` | **High** | `frontend/src/services/tripService.js:8` |
| `bookingService.cancelBooking(id)` sends no body | Controller reads `req.body.reason` | Works but `reason` always undefined | **Low** | `frontend/src/services/bookingService.js:7` |
| `paymentService.verify({ amount })` posts amount alongside Razorpay fields | Controller trusts client-sent amount | Security issue (already in §7) | **High** | `frontend/src/services/paymentService.js:5` |
| `Chat.jsx` payload shape `{ messages, participants }` parsed as raw array via `m.sender === user._id` | Backend returns `{ data: { messages: [...] } }` where each message's `sender` is an ObjectId | String comparison `m.sender === user._id` is comparing ObjectId object to string — always false; all messages render as "other" | **Medium** | `frontend/src/pages/Chat.jsx:197` |
| `walletService.getTransactions()` calls `/wallet/transactions` (returns `{data:[...]}`) but `Wallet.jsx` never calls it | Dead code in service | Wallet only displays the `transactions` returned by `GET /wallet`, capped at 50 | **Low** | `frontend/src/services/walletService.js:7` |

---

## 4. Pages — Per-Page Findings

### `Landing.jsx`
Purpose: marketing + quick search. Data: none. API: navigates to `/trips?from=...&to=...`.
- `frontend/src/pages/Landing.jsx:43-55` — **Low** — Two `LocationSearch` components share the page; they each create their own dropdown which is fine, but neither passes `onSelect`, so even when search returned coords (it doesn't) they'd be discarded. Not a current bug since coords aren't returned, but contributes to the maps issue.
- Compared with `screenshot_landing.png` — layout matches.

### `Login.jsx`
- `frontend/src/pages/Login.jsx:23-29` — **Low** — `setSuccessMessage` timeout never cleared on unmount. Setting state on an unmounted component will log a warning in dev.
- `frontend/src/pages/Login.jsx:106-108` — **Medium** — "Forgot password?" links nowhere (no route).

### `Register.jsx`
- `frontend/src/pages/Register.jsx:49-53` — **High** — On successful register, dispatches `registerUser` which in `authSlice.fulfilled` sets `isAuthenticated: true` and saves token, then immediately navigates to `/login`. User is now logged in but sent to the login page. Suggest navigate to `/dashboard` directly, or, if email verification is intended, don't auto-login in the reducer.
- `frontend/src/pages/Register.jsx:14-21` — **Medium** — `role` is required by Zod schema but no default is set and no input is required — if user clicks "Create Account" without picking a role they'll get an obscure Zod error. Suggest set `defaultValues: { role: 'USER' }`.
- `frontend/src/pages/Register.jsx:165-171` — **Low** — `collegeId` input field is a text Input but labeled "Upload your college ID" — confusing.

### `Dashboard.jsx`
- `frontend/src/pages/Dashboard.jsx:19-20` — **Medium** — Filters by `b.status === 'UPCOMING'` but Booking schema enum is `['PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED']`. There is no `UPCOMING` status, so upcoming count is always 0. Same issue in `Bookings.jsx` filter list (`upcoming` → no matches).
- `frontend/src/pages/Dashboard.jsx:40` — **Low** — `balance.toFixed(2)` — if `balance` is `null`/`undefined` (briefly during load) this throws. Wallet slice initializes to 0 so safe in practice, but defensive `Number(balance || 0).toFixed(2)` is safer.

### `Trips.jsx`
- `frontend/src/pages/Trips.jsx:14-16` — **High** — `useEffect` depends only on `[dispatch]` but reads `filters` from the closure. When filters change via Redux, this effect won't re-run; users have to click Search to refresh. Either include `filters` in deps or wire `handleFilterChange` to dispatch a refetch.
- `frontend/src/pages/Trips.jsx:18-21` — **Medium** — `handleSearch` merges `filters` with `searchFrom`/`searchTo` but the merged `from`/`to` are local state, not persisted into Redux `filters`. So `clearFilters()` won't clear them. Inconsistent state.
- `frontend/src/pages/Trips.jsx:93` — **Low** — `Clear Filters` only shows if `from`/`to`/`vehicleType` set; ignores `minPrice`/`maxPrice`. Cosmetic.

### `TripDetail.jsx`
- `frontend/src/pages/TripDetail.jsx:33-47` — **Medium** — `useEffect` deps array is `[currentTrip]` (object), causing a refresh of `routeInfo` on every store update even if coords didn't change. Use `[currentTrip?.fromCoords, currentTrip?.toCoords]`.
- `frontend/src/pages/TripDetail.jsx:65-77` — **High** — "Cancel Booking" button calls `otpService.requestCancelBooking(id)` where `id` is the TRIP id from `useParams`, not a booking id. Backend will 404. The Cancel Booking UI should be on the Bookings page, not TripDetail.
- `frontend/src/pages/TripDetail.jsx:259-261` — **Low** — `[...Array(Math.min(currentTrip.availableSeats, 5))]` — if `availableSeats` is 0 this becomes `[...Array(0)]` and the select has no options; the disabled "Fully Booked" button covers it, but cleaner to guard before rendering the select.
- `frontend/src/pages/TripDetail.jsx:280-284` — **Medium** — Says "Student discount will be applied at checkout" but `totalPrice = currentTrip.pricePerSeat * seats` shown above does NOT apply the discount. The backend will apply it server-side, so the displayed total is wrong for verified students.

### `CreateTrip.jsx`
- `frontend/src/pages/CreateTrip.jsx:47-58` — **High** — `fromCoords`/`toCoords` are always `null` because `LocationSearch.onSelect` passes `coordinates: suggestion.coordinates || null` but backend's `searchLocations` never returns coordinates. Map preview never renders, and the trip is created without coords (search-by-from/to text still works but distance/route on TripDetail is missing). Root cause in `backend/src/utils/cities.js:467-500`.
- `frontend/src/pages/CreateTrip.jsx:80-87` — **Low** — `value={watch('from') || ''}` re-renders the field on every form change. Better to use `Controller` from react-hook-form.

### `Bookings.jsx`
- `frontend/src/pages/Bookings.jsx:247` — **Critical** — `onClick={handleCancelBooking}` references an undefined function. If the cancel modal is ever opened (currently dead because nothing sets `cancelModal.open = true`), clicking Confirm crashes.
- `frontend/src/pages/Bookings.jsx:218-252` — **Medium** — Entire `Modal` with reason textarea is dead code — never opened. The real cancel flow is `OTPModal`.
- `frontend/src/pages/Bookings.jsx:89` — **Low** — Filter "upcoming" maps to status `UPCOMING` which doesn't exist (same as Dashboard above). Probably wants `PENDING`/`CONFIRMED`.
- `frontend/src/pages/Bookings.jsx:175` — **Low** — Reads `booking.trip?.rating` but the rating lives on the BOOKING (`booking.rating`), not the trip. Stars always show 0.

### `Wallet.jsx`
- `frontend/src/pages/Wallet.jsx:16-24` — **Medium** — "Add Money" dispatches `addMoney(amount)` which calls `/wallet/add` — bypasses Razorpay entirely. The UI says "Secured by Razorpay" (line 117) but actually just credits the wallet (see §1 critical wallet bug).
- Compared with `screenshot_wallet.png` — layout matches the screenshot exactly.

### `Chat.jsx`
- `frontend/src/pages/Chat.jsx:50-52` — **High** — Reads `localStorage.getItem('token')` but the auth slice stores under `co-ride-token`. Socket auth always sends `null`, server rejects with "Authentication required", `isConnected` stays false forever.
- `frontend/src/pages/Chat.jsx:193` — **Critical** — Calls `/chat/${chatId}` but route is `/chat/:chatId/messages` — fetch always 404s, falls into mock-data catch block. See §3.
- `frontend/src/pages/Chat.jsx:197` — **Medium** — `m.sender === user._id` compares ObjectId-as-string (from JSON) to user._id; needs `.toString()` on both sides or to check `m.sender._id` if populated. All messages render as "other".
- `frontend/src/pages/Chat.jsx:138-173` — **Medium** — When no conversations exist, injects mock data (`Amit Singh`, `Priya Sharma`). Looks polished but masks the empty state in a real flow. Suggest gate behind a `?demo=true` query param or remove for production.
- `frontend/src/pages/Chat.jsx:54-60` — **Low** — `chatService.socket?.on('connect',...)` registers AFTER `chatService.connect()` is called. Connect handler in service already exists at line 23-25 of `chatService.js`. Order is OK because socket.io supports late `.on` registration, but be aware.

### `AdminDashboard.jsx`
- `frontend/src/pages/AdminDashboard.jsx:99-104` — **Medium** — Displays `stats.revenue.toLocaleString()` — if `revenue` is 0 or null this throws. The backend returns `totalRevenue: 0` when no completed bookings, so it's fine, but defensive check is cheap.
- Compared with `screenshot_admin.png` — layout matches.

### `DriverDashboard.jsx`
- `frontend/src/pages/DriverDashboard.jsx:26-28` — **Medium** — `useEffect(..., [])` with `fetchDashboard` — eslint-react-hooks would flag this. After OTP verification, `verifyOTP` calls `fetchDashboard` but the function isn't memoized; could cause stale closures.
- `frontend/src/pages/DriverDashboard.jsx:386-391` — **High** — Quick-action `/profile` route doesn't exist.

### `DriverVerification.jsx`
- `frontend/src/pages/DriverVerification.jsx:101-103` — **High** — `fileUrl = previews[field]` which is the raw base64 `data:` URL from `FileReader.readAsDataURL`. Sending multi-MB base64 to the backend without checking size will hit body-size limits (no `express.json({limit: ...})` set so Express default is 100kb — will silently 413 for any photo >75kb).
- `frontend/src/pages/DriverVerification.jsx:497-515` — **Low** — College quick-select rebuilds `studentInfo.collegeEmail` from `emailPrefix@domain`. If user types an email then clicks dropdown, the local-part is preserved but the email is silently overwritten — surprising UX.

---

## 5. Map Visibility — Detailed Audit

The project has two map components: `MapComponents.jsx` (Google Maps) and `OpenStreetMap.jsx` (Leaflet). The pages (`TripDetail`, `CreateTrip`) use `OpenStreetMap`. The Google Maps component is loaded by `LocationAutocomplete` in `MapComponents.jsx` (currently unused).

### Critical / High

- `backend/src/utils/cities.js:467-500` (`searchLocations`) — **Critical** — Returns suggestions with no `coordinates` field. `LocationSearch.handleSelect` (`frontend/src/components/LocationSearch.jsx:81-84`) does `coordinates: suggestion.coordinates || null` → always `null`. `CreateTrip.jsx:84-86` then leaves `fromCoords`/`toCoords` as `null` → `OpenStreetMap` falls back to `MapPlaceholder` → user never sees a map. Fix: add `coordinates` to every city/sub-location entry in `cities.js` and include them in the autocomplete response.
- `frontend/src/components/OpenStreetMap.jsx:212-245` (`LiveLocationTracker`) — **Critical** — Assigns `mapInstanceRef.current = map` on line 244, but `mapInstanceRef` is never declared inside `LiveLocationTracker` (the declared one at line 19 is in the `OpenStreetMap` component scope and not accessible). ReferenceError on every mount. The component is not currently rendered anywhere in pages — but it IS exported and the broken `mapInstanceRef.current.setView` block (lines 269-278) would also fail. Suggest add `const mapInstanceRef = useRef(null)` inside the component.
- `frontend/src/components/OpenStreetMap.jsx:23-43` (`OpenStreetMap`) — **High** — Loads Leaflet CSS + JS via script-tag injection from CDN every component mount. Race condition: if `useEffect` runs before the script `onload` fires, the next effect (line 45) bails because `isLoaded=false`. When both effects run in sequence on a fast network, the second effect runs before the first finishes injecting the script. Suggest install `leaflet` via npm + import normally.
- `frontend/src/components/OpenStreetMap.jsx:49-61` (`OpenStreetMap`) — **High** — Map is initialized only once (`if (!mapInstanceRef.current)`) using the initial `fromCoords`. When `fromCoords`/`toCoords` change to NEW values (e.g. selecting a different trip), the map view DOES update because `routeLine.getBounds().fitBounds(...)` is called on line 123, but if only ONE coord is set (e.g. user types From only), the map stays centered on Delhi default. Edge case but visible during input. Suggest add `map.invalidateSize()` and re-center on prop change.
- `frontend/src/components/OpenStreetMap.jsx:126-128` — **High** — `return () => { /* Cleanup not needed for Leaflet */ }` is wrong. When component unmounts, the Leaflet map instance still holds DOM references and tile-loading timers. Memory leak; on re-mount you may get "Map container is already initialized" error. Suggest `map.remove()` on unmount.

### Medium

- `frontend/src/components/OpenStreetMap.jsx:66-70` — **Medium** — Layer-removal loop uses `instanceof window.L.Marker` which only matches direct Markers. Tile layers (added via `tileLayer(...).addTo`) are L.TileLayer; the check leaves them alone (which is the intent), but Circle/Rectangle/etc would also be left in place. Minor.
- `frontend/src/components/MapComponents.jsx:165-225` (`LocationAutocomplete`) — **Medium** — On every keystroke (`input.length >= 3`), `new window.google.maps.places.Autocomplete(...)` is instantiated AGAIN, attaching a new listener. After typing 20 chars you have 18 listeners; each `place_changed` fires N times. Suggest instantiate once on mount.
- `frontend/src/components/MapComponents.jsx:37-63` (Google Maps loader) — **Medium** — `loadGoogleMapsScript` doesn't pass `&v=weekly` or a callback param. Modern Google Maps API expects `&loading=async&callback=...`; without it you get the well-known "Performance issues: Google Maps JavaScript API loaded without a callback" warning and the deprecated synchronous load path.
- `frontend/src/components/MapComponents.jsx:65-126` (`initMap`) — **Medium** — Markers are created but never stored, and existing markers aren't cleared when coords change. On every coord change `initMap` runs and adds new markers on top of old ones.
- `frontend/src/components/OpenStreetMap.jsx:67-69` — **Medium** — `if (layer instanceof window.L.Marker || layer instanceof window.L.Polyline)` — `instanceof` against `window.L.Marker` works only if Leaflet is fully loaded; before load these are undefined. The earlier `if (!isLoaded || !mapRef.current) return` guard at line 46 protects this, but the dependency on global `window.L` is fragile.
- `frontend/src/components/OpenStreetMap.jsx:50-54` — **Medium** — `[defaultCenter.lat || defaultCenter[0], defaultCenter.lng || defaultCenter[1]]` mixes object-coords and array-coords handling, which is good defense — but if `fromCoords = { lat: 0, lng: 0 }` (valid for equator) the `|| defaultCenter[0]` fallback fires incorrectly. Use `??`.

### Low

- `frontend/src/components/OpenStreetMap.jsx:25-30` — **Low** — Loads `leaflet.css` from `unpkg.com` — production builds will fail if unpkg is blocked. Bundle locally.
- `frontend/src/components/MapComponents.jsx:32-35` — **Low** — `useEffect(() => { ... }, [])` with empty deps means the effect references `mapLoaded` from initial render (false). After load, `mapLoaded=true` won't re-trigger this; relies on a separate effect with the right deps. Works, but pattern is fragile.
- `frontend/src/components/MapComponents.jsx:160` — **Low** — `style={{ width, height }}` directly applies inline styles; combined with `className="rounded-xl overflow-hidden"` is fine but if a parent passes `className` that sets height, it'll be overridden by inline.
- `frontend/src/index.css` does NOT import `leaflet/dist/leaflet.css` — relying on the script-injection of unpkg CSS. The default Leaflet marker icon path bug (broken marker images with Vite) is dodged here because the components use `divIcon` instead — good.

### What works

- Map containers have explicit `height`/`width` props (no zero-height parents). Good.
- `OpenStreetMap` uses Leaflet `divIcon` instead of default markers, avoiding the well-known broken-icon-URL bug.
- Coordinates are normalized to handle both `[lat,lng]` arrays and `{lat,lng}` objects.

---

## 6. Auth & State

- `frontend/src/services/api.js:32-50` — **High** — On 401, hard-redirects to `/login` without attempting `/auth/refresh`. JWT TTL is 15 min, refresh TTL is 7 d. Users will be logged out every 15 minutes of idleness. Suggest a refresh interceptor that calls `authService.refresh(refreshToken)` and retries the original request.
- `frontend/src/store/slices/authSlice.js:6-35` — **Medium** — On app boot, reads token and user from localStorage and trusts both. If the token has expired, `isAuthenticated` is true but the next API call 401s and you bounce to login. Suggest decode the JWT exp claim or hit `/auth/profile` once on mount.
- `frontend/src/pages/Chat.jsx:50` — **High** — `localStorage.getItem('token')` instead of `'co-ride-token'`. Socket auth never carries a valid token; socket connection fails.
- `frontend/src/services/api.js:41-44` — **Low** — `store.dispatch({ type: 'auth/logout/fulfilled' })` is dispatching a magic-string action manually instead of `dispatch(logout())`. Works because the reducer matches by type, but bypasses the thunk that calls `/auth/logout` on the server, leaving `refreshToken` in DB.
- `backend/src/middleware/auth.js:4-49` — **Low** — Logs every auth failure to `console.error` via the outer try/catch (line 43) which is unlikely to trigger but pollutes logs. Inner catches return the response correctly.

---

## 7. Backend Correctness

- `backend/src/index.js:25-41` — **Medium** — CORS allowed origins are hardcoded to `localhost:3000/3001` and `127.0.0.1:3000/3001`. No env-var support. `CLIENT_URL` from `.env` exists but is never read.
- `backend/src/index.js:51-52` — **Medium** — No JSON body-size limit. Combined with the base64 file upload bug (§4), defaults to 100kb which silently 413s photo uploads. Set explicitly: `express.json({ limit: '10mb' })`.
- `backend/src/index.js:180-183` — **Low** — `useNewUrlParser` and `useUnifiedTopology` are deprecated in MongoDB driver 4+; will log "no effect" warnings. Remove.
- `backend/src/index.js:188-190` — **Medium** — In production, `connectDB` swallows errors so the server starts even with no DB connection. Every request will then throw. Better: fail fast or expose DB status in `/health`.
- `backend/src/index.js` — **Low** — No `mongoose.set('strictQuery', ...)` call. Mongoose 7+ defaults to `false`, which is OK but logging a warning. Set explicitly.
- `backend/src/controllers/bookingController.js:55-165` — **High** — `createBooking` is not transactional. See §1.
- `backend/src/controllers/bookingController.js:39` — **High** — Broken authorization check (`booking.trip.driver._id !== req.user._id`). See §1.
- `backend/src/controllers/otpController.js:115-120` — **High** — Double-decrement of `availableSeats`. See §1.
- `backend/src/controllers/walletController.js:24-100` — **Critical** — Free wallet top-up + unverified withdrawal. See §1.
- `backend/src/controllers/paymentController.js:54-105` — **High** — Client-supplied `amount` trusted after signature verify. See §1.
- `backend/src/controllers/driverController.js:222-262` — **High** — `fileUrl` is unvalidated and stored as a base64 data URL. See §1.
- `backend/src/controllers/chatController.js:73, 112, 187` — **Medium** — `participants.includes(req.user._id)` doesn't compare ObjectIds correctly. See §1.
- `backend/src/models/User.js:111-115` — **Low** — Password hash on every save where `password` is modified — correct. But `userSchema.methods.updateRating` (line 122-127) mutates fields without saving; nothing calls it (controller in `bookingController.js:279-281` does its own math). Dead code.
- `backend/src/models/OTP.js:46-48` — **Low** — TTL index on `expiresAt` is set with `expireAfterSeconds: 0` which means "delete when expiresAt is in the past" — correct.

---

## 8. Config & Env

- `frontend/.env:8` — **Critical** — Live Google Maps API key (`AIzaSyB0m5LHjZjdZqWg3WiV-qZ4HE3j09W8EsA`) committed to the repo. Rotate the key immediately and add `.env` to `.gitignore`. Use `.env.example` with placeholders only.
- `backend/.env:2` — **High** — `PORT=5001` in actual `.env` but `backend/.env.example` says `PORT=5000`. `frontend/vite.config.js:17` proxies `/api` to `localhost:5001`. Anyone who copies `.env.example` verbatim will have the frontend pointing at a port no one is listening on. Either align `.env.example` to 5001 or document the proxy port choice.
- `backend/.env:15` — **Medium** — `CLIENT_URL=http://localhost:3001` but the frontend dev server runs on `:3000` (per `vite.config.js:13`). Doesn't matter since `CLIENT_URL` is never read in code, but inconsistent.
- `backend/src/index.js:25-41` — **Medium** — Hardcoded CORS origins. See §7.
- `frontend/src/services/chatService.js:3` — **Medium** — `SOCKET_URL` defaults to `http://localhost:5000`, but backend `.env` sets `PORT=5001`. Production-mode socket connection will fail unless `VITE_SOCKET_URL` is set.
- `backend/.env:9-10` — **High** — JWT secrets are dev defaults (`co-ride-jwt-secret-dev-2024`). If this `.env` is what's deployed, secrets are guessable. Generate strong secrets for any deployed environment.

---

## 9. Lower-Priority Observations

- `frontend/src/components/Footer.jsx:23-44` — many dead links (see §2).
- `frontend/src/components/Navbar.jsx:27-31` — driver users don't see "Find Rides", but they can still hit `/trips` directly. Logic-only, not a bug.
- `frontend/src/pages/Trips.jsx:151` — `seats left` shown but doesn't pluralize.
- `frontend/src/components/Layout.jsx` — Footer renders on EVERY page including the chat page, where vertical space is at a premium. Cosmetic.
- `frontend/src/store/slices/walletSlice.js:67-73` — On `addMoney.fulfilled`, the slice replaces `state.transactions` with `data.transactions` if present, but the controller returns only the latest 10 transactions — older transactions disappear from the list. Suggest merge.
- `frontend/src/components/OTPModal.jsx:31-35` — `useEffect` with `autoClose` triggers `onClose` 1500ms after load even before user has typed. The `autoClose` flag is used in `DriverDashboard.jsx:423` as `autoClose={!otpError && otpLoading}` which is `true` only briefly — works, but tricky.
- `backend/src/controllers/bookingController.js:255-281` (`rateBooking`) — uses raw `driver.rating * driver.totalRatings + rating` computation. The same logic exists as a model method (`User.methods.updateRating`) and isn't reused. Duplication.
- `backend/src/controllers/adminController.js:115-140` and `tripController.js:182-217` — `cancelTrip` exists twice with overlapping but not identical behavior (admin version doesn't set `cancelledBy`). Inconsistent.
- `frontend/src/hooks/index.js`, `frontend/src/utils/index.js` — boilerplate barrels.
- `backend/src/utils/seed.js` (205 lines) — not executed by default; manual `npm run seed`. Not reviewed in depth.

---

## Appendix: Files Reviewed

### Backend
- `backend/src/index.js`
- `backend/src/routes/index.js`, `authRoutes.js`, `tripRoutes.js`, `bookingRoutes.js`, `walletRoutes.js`, `paymentRoutes.js`, `adminRoutes.js`, `chatRoutes.js`, `otpRoutes.js`, `collegeRoutes.js`, `driverRoutes.js`, `locationRoutes.js`
- `backend/src/controllers/index.js`, `authController.js`, `tripController.js`, `bookingController.js`, `walletController.js`, `paymentController.js`, `adminController.js`, `chatController.js`, `driverController.js`, `otpController.js`
- `backend/src/middleware/index.js`, `auth.js`, `errorHandler.js`
- `backend/src/models/index.js`, `User.js`, `Trip.js`, `Booking.js`, `Payment.js`, `WalletTransaction.js`, `Chat.js`, `OTP.js`
- `backend/src/utils/cities.js` (partial), `utils/maps.js`
- `backend/package.json`, `backend/.env`, `backend/.env.example`

### Frontend
- `frontend/src/App.jsx`, `main.jsx`, `index.css`
- `frontend/src/services/index.js`, `api.js`, `authService.js`, `tripService.js`, `bookingService.js`, `walletService.js`, `paymentService.js`, `adminService.js`, `chatService.js`, `driverService.js`, `otpService.js`
- `frontend/src/components/Layout.jsx`, `Navbar.jsx`, `Footer.jsx`, `ProtectedRoute.jsx`, `LocationSearch.jsx`, `OpenStreetMap.jsx`, `MapComponents.jsx`, `OTPModal.jsx`
- `frontend/src/components/common/index.js`
- `frontend/src/store/store.js`, `index.js`, `slices/authSlice.js`, `slices/tripSlice.js`, `slices/bookingSlice.js`, `slices/walletSlice.js`, `slices/adminSlice.js`
- `frontend/src/pages/Landing.jsx`, `Login.jsx`, `Register.jsx`, `Dashboard.jsx`, `Trips.jsx`, `TripDetail.jsx`, `CreateTrip.jsx`, `Bookings.jsx`, `Wallet.jsx`, `Chat.jsx`, `AdminDashboard.jsx`, `DriverDashboard.jsx`, `DriverVerification.jsx`
- `frontend/src/utils/constants.js`, `helpers.js`
- `frontend/index.html`, `vite.config.js`, `package.json`, `.env`

### Other
- `spec.md`
- `comprehensive-test.ps1` (first ~100 lines)
- Screenshots: `screenshot_landing.png`, `screenshot_login_dashboard.png`, `screenshot_trips.png`, `screenshot_trips_after_search.png`, `screenshot_admin.png`, `screenshot_bookings.png`, `screenshot_wallet.png` (referenced visually for layout comparison; matched what code renders).
