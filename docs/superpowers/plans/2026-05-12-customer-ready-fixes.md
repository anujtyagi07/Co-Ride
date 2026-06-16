# Customer-Ready Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all blocking and high-severity bugs across routes, pages, maps, auth, and config so Co-Ride is fully functional for end customers.

**Architecture:** Fixes are split into 5 independent groups that can be executed sequentially. Each group targets one concern area and leaves the app in a working, verifiable state after completion.

**Tech Stack:** React 18 + Vite (frontend), Node/Express + Mongoose (backend), Redux Toolkit, React Hook Form + Zod, Socket.io, Leaflet (maps), express-rate-limit (already installed).

**Working directory:** `D:/Github`  
**Frontend:** `D:/Github/frontend`  
**Backend:** `D:/Github/backend`

---

## Group 1 — Render Crashes & Dead Routes

**Goal:** Make every existing page render without crashing and every navigation link go somewhere real.

**Files modified:**
- `frontend/src/pages/Bookings.jsx` — remove undefined reference that crashes page
- `frontend/src/pages/Register.jsx` — fix post-registration redirect
- `frontend/src/App.jsx` — add 404 fallback route
- `frontend/src/components/Footer.jsx` — remove dead links
- `frontend/src/pages/Login.jsx` — remove dead forgot-password link
- `frontend/src/pages/DriverDashboard.jsx` — remove dead /profile link

---

### Task 1.1 — Fix Bookings page crash (`handleCancelBooking` undefined)

**Root cause:** `Bookings.jsx:247` references `handleCancelBooking` which is never declared in this file. When React evaluates the JSX, it hits `onClick={handleCancelBooking}` → `ReferenceError` → entire page is blank. The Modal block (lines 218–252) is dead code — nothing ever sets `cancelModal.open = true`. The real cancel flow uses `OTPModal` at lines 253+.

**Files:**
- Modify: `frontend/src/pages/Bookings.jsx`

- [ ] **Step 1: Delete the dead Modal block and its state**

  Open `frontend/src/pages/Bookings.jsx`.

  Remove the two state lines at the top of the component (lines 14–15):
  ```jsx
  // DELETE these two lines:
  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null })
  const [cancelReason, setCancelReason] = useState('')
  ```

  Remove the entire `{/* Cancel Modal */}` block (currently lines 218–252). Delete from `{/* Cancel Modal */}` through the closing `</Modal>` tag inclusive:
  ```jsx
  // DELETE this entire block:
  {/* Cancel Modal */}
  <Modal
    isOpen={cancelModal.open}
    onClose={() => setCancelModal({ open: false, bookingId: null })}
    title="Cancel Booking"
  >
    <div className="space-y-4">
      <p className="text-gray-600">
        Are you sure you want to cancel this booking? This action cannot be undone.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for cancellation (optional)
        </label>
        <textarea
          className="input-field"
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Let us know why you're cancelling..."
        />
      </div>
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => setCancelModal({ open: false, bookingId: null })}
        >
          Keep Booking
        </Button>
        <Button variant="danger" onClick={handleCancelBooking}>
          Confirm Cancel
        </Button>
      </div>
    </div>
  </Modal>
  ```

  Also remove `Modal` from the import line at line 4 (keep `Card`, `Button`, `Loader`):
  ```jsx
  // BEFORE:
  import { Card, Button, Loader, Modal } from '../components/common'
  // AFTER:
  import { Card, Button, Loader } from '../components/common'
  ```

- [ ] **Step 2: Verify build passes**
  ```
  cd D:/Github/frontend && npm run build
  ```
  Expected: build completes with no errors mentioning `Bookings.jsx`.

- [ ] **Step 3: Manual verify**

  Start backend (`cd D:/Github/backend && npm run dev`) and frontend (`cd D:/Github/frontend && npm run dev`). Log in as a USER. Navigate to `/bookings`. Confirm the page renders (either a booking list or "No bookings found" — either is correct). Open DevTools console — confirm no `ReferenceError`.

- [ ] **Step 4: Commit**
  ```
  git -C D:/Github add frontend/src/pages/Bookings.jsx
  git -C D:/Github commit -m "fix: remove undefined handleCancelBooking that crashed Bookings page"
  ```

---

### Task 1.2 — Fix Register redirect (sends authenticated user to login)

**Root cause:** After successful registration, `authSlice` sets `isAuthenticated: true` AND stores the token, but `Register.jsx` then navigates to `/login`. The user is already logged in and gets stuck on the login page.

**Files:**
- Modify: `frontend/src/pages/Register.jsx`

- [ ] **Step 1: Change navigate target**

  In `frontend/src/pages/Register.jsx`, find the `onSubmit` function:
  ```jsx
  // BEFORE (around line 50-53):
  if (registerUser.fulfilled.match(result)) {
    // Registration successful, redirect to login
    navigate('/login', { state: { message: 'Registration successful! Please login.' } })
  }

  // AFTER:
  if (registerUser.fulfilled.match(result)) {
    navigate('/dashboard')
  }
  ```

- [ ] **Step 2: Verify build**
  ```
  cd D:/Github/frontend && npm run build
  ```
  Expected: no errors.

- [ ] **Step 3: Manual verify**

  Navigate to `/register`. Fill the form and submit. Confirm you are redirected to `/dashboard` (not `/login`).

- [ ] **Step 4: Commit**
  ```
  git -C D:/Github add frontend/src/pages/Register.jsx
  git -C D:/Github commit -m "fix: redirect to dashboard after successful registration"
  ```

---

### Task 1.3 — Add 404 fallback route

**Root cause:** Any unknown URL (e.g. from Footer links that still exist temporarily, or a typo) renders a blank page because there is no catch-all route.

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Add a NotFound component inline and wire a `*` route**

  At the top of `frontend/src/App.jsx`, add a simple inline 404 component (no new file needed):
  ```jsx
  // Add after the last import line, before `function App()`:
  function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page not found</h2>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist yet.</p>
        <a href="/" className="text-primary-600 hover:underline font-medium">Go home</a>
      </div>
    )
  }
  ```

  Inside the `<Route path="/" element={<Layout />}>` block, add the catch-all as the LAST child route (after `driver-verification`):
  ```jsx
  <Route path="*" element={<NotFound />} />
  ```

- [ ] **Step 2: Verify build**
  ```
  cd D:/Github/frontend && npm run build
  ```

- [ ] **Step 3: Manual verify**

  Navigate to `/anything-random`. Confirm the 404 page renders inside the Layout (with navbar/footer) instead of a blank page.

- [ ] **Step 4: Commit**
  ```
  git -C D:/Github add frontend/src/App.jsx
  git -C D:/Github commit -m "fix: add 404 fallback route so unknown paths don't show blank page"
  ```

---

### Task 1.4 — Remove dead links from Footer, Login, DriverDashboard

**Root cause:** Footer links to 9 non-existent routes; Login links to `/forgot-password`; DriverDashboard links to `/profile`. All cause the new 404 page to show, which is confusing.

**Files:**
- Modify: `frontend/src/components/Footer.jsx`
- Modify: `frontend/src/pages/Login.jsx`
- Modify: `frontend/src/pages/DriverDashboard.jsx`

- [ ] **Step 1: Read Footer to find the dead links block**

  Read `frontend/src/components/Footer.jsx`. Find the links section. Replace each `<Link to="/about">`, `<Link to="/careers">`, etc. with plain `<span>` so they exist visually but don't navigate:
  ```jsx
  // BEFORE pattern (example):
  <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>

  // AFTER pattern — keep the text, remove the link:
  <span className="text-gray-400 cursor-default">About</span>
  ```
  Apply this to ALL Footer links pointing to non-existent routes: `/about`, `/careers`, `/blog`, `/help`, `/contact`, `/safety`, `/privacy`, `/terms`, `/cookies`.

  Keep any links that DO exist in App.jsx (`/trips`, `/`, etc.) as `<Link>`.

- [ ] **Step 2: Remove forgot-password link from Login**

  In `frontend/src/pages/Login.jsx`, find and remove the "Forgot password?" link element (around line 106-108):
  ```jsx
  // DELETE this element:
  <Link to="/forgot-password" className="...">Forgot password?</Link>
  ```

- [ ] **Step 3: Remove dead /profile link from DriverDashboard**

  In `frontend/src/pages/DriverDashboard.jsx`, find the quick-action link to `/profile` (around line 386-391) and either remove it or change it to `/dashboard`:
  ```jsx
  // BEFORE:
  <Link to="/profile">
    ...Profile...
  </Link>

  // AFTER — point to dashboard instead:
  <Link to="/dashboard">
    ...Profile...
  </Link>
  ```

- [ ] **Step 4: Verify build**
  ```
  cd D:/Github/frontend && npm run build
  ```

- [ ] **Step 5: Manual verify**

  Click Footer links — they should be unclickable text. Click "Forgot password?" area — it should be gone. Driver dashboard quick action should navigate to /dashboard.

- [ ] **Step 6: Commit**
  ```
  git -C D:/Github add frontend/src/components/Footer.jsx frontend/src/pages/Login.jsx frontend/src/pages/DriverDashboard.jsx
  git -C D:/Github commit -m "fix: remove dead links from Footer, Login, and DriverDashboard"
  ```

---

## Group 2 — Maps & Location Pipeline

**Goal:** Make the location picker return coordinates so the Leaflet map renders actual routes instead of the placeholder. Fix Leaflet memory leaks and the CDN race condition.

**Files modified:**
- `backend/src/routes/locationRoutes.js` — add lat/lng to autocomplete response
- `backend/src/utils/cities.js` — add coordinates to city data
- `frontend/src/components/OpenStreetMap.jsx` — fix mapInstanceRef, map.remove(), CDN race
- `frontend/package.json` — add leaflet npm dependency

---

### Task 2.1 — Return coordinates from location autocomplete

**Root cause:** `searchLocations` in `cities.js` returns city/subLocation entries without a `coordinates` field. `locationRoutes.js` maps results and also never adds coordinates. `LocationSearch.handleSelect` does `suggestion.coordinates || null` — always null. `CreateTrip` and `TripDetail` receive `null` coords and `OpenStreetMap` falls back to showing a placeholder.

**Files:**
- Modify: `backend/src/utils/cities.js`
- Modify: `backend/src/routes/locationRoutes.js`

- [ ] **Step 1: Add approximate coordinates to each city in `cities.js`**

  In `backend/src/utils/cities.js`, add a `coordinates` field (as `[lat, lng]`) to each city object in `INDIAN_CITIES`. Add to every city entry:

  ```js
  // Example — add coordinates to Mumbai:
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    coordinates: [19.0760, 72.8777],   // ← add this
    subLocations: { ... },
    metro: true,
    majorColleges: [...],
  },
  ```

  Use these approximate city center coordinates for each city currently in the file:
  - Mumbai: `[19.0760, 72.8777]`
  - Pune: `[18.5204, 73.8567]`
  - Nagpur: `[21.1458, 79.0882]`
  - Delhi: `[28.6139, 77.2090]`
  - Bengaluru: `[12.9716, 77.5946]`
  - Chennai: `[13.0827, 80.2707]`
  - Hyderabad: `[17.3850, 78.4867]`
  - Kolkata: `[22.5726, 88.3639]`
  - Ahmedabad: `[23.0225, 72.5714]`
  - Jaipur: `[26.9124, 75.7873]`
  - Surat: `[21.1702, 72.8311]`
  - Lucknow: `[26.8467, 80.9462]`
  - Kanpur: `[26.4499, 80.3319]`
  - Indore: `[22.7196, 75.8577]`
  - Bhopal: `[23.2599, 77.4126]`

  For any other cities in the file not listed above, use the pattern `[state_center_lat, state_center_lng]` as a reasonable fallback — look them up or use the state capital's coordinates.

- [ ] **Step 2: Update `searchLocations` to include coordinates in its results**

  In `backend/src/utils/cities.js`, update the `searchLocations` function:

  ```js
  // BEFORE — city match push:
  results.push({
    type: 'city',
    city: city.name,
    state: city.state,
    text: `${city.name}, ${city.state}`,
  })

  // AFTER:
  results.push({
    type: 'city',
    city: city.name,
    state: city.state,
    text: `${city.name}, ${city.state}`,
    coordinates: city.coordinates || null,
  })
  ```

  ```js
  // BEFORE — subLocation match push:
  results.push({
    type: 'subLocation',
    city: city.name,
    state: city.state,
    subLocation: location,
    category,
    text: `${location}, ${city.name}`,
  })

  // AFTER:
  results.push({
    type: 'subLocation',
    city: city.name,
    state: city.state,
    subLocation: location,
    category,
    text: `${location}, ${city.name}`,
    coordinates: city.coordinates || null,  // sublocations use city center
  })
  ```

- [ ] **Step 3: Pass coordinates through the autocomplete route**

  In `backend/src/routes/locationRoutes.js`, update the suggestions map in the `/autocomplete` handler:

  ```js
  // BEFORE:
  const suggestions = results.map(r => ({
    id: r.type === 'city' ? `city-${r.city}` : `loc-${r.city}-${r.subLocation}`,
    text: r.text,
    type: r.type,
    city: r.city,
    state: r.state,
    subLocation: r.subLocation || null,
  }))

  // AFTER:
  const suggestions = results.map(r => ({
    id: r.type === 'city' ? `city-${r.city}` : `loc-${r.city}-${r.subLocation}`,
    text: r.text,
    type: r.type,
    city: r.city,
    state: r.state,
    subLocation: r.subLocation || null,
    coordinates: r.coordinates || null,
  }))
  ```

- [ ] **Step 4: Manual verify**

  Restart backend. In a browser or curl:
  ```
  curl "http://localhost:5001/api/locations/autocomplete?input=mumbai"
  ```
  Expected: each item in `data` has a `coordinates: [19.076, 72.877]` field.

- [ ] **Step 5: Commit**
  ```
  git -C D:/Github add backend/src/utils/cities.js backend/src/routes/locationRoutes.js
  git -C D:/Github commit -m "fix: return coordinates in location autocomplete so maps can render"
  ```

---

### Task 2.2 — Fix Leaflet: install via npm, add cleanup, fix mapInstanceRef

**Root cause (3 sub-bugs):**
1. Leaflet loaded from CDN via script injection — race condition where the init effect runs before the script loads → silent failure on slow networks.
2. `map.remove()` never called on unmount → "Map container is already initialized" error on re-mount + memory leak.
3. `LiveLocationTracker` sub-component references `mapInstanceRef` from parent scope → `ReferenceError` on every render.

**Files:**
- Modify: `frontend/package.json` (install leaflet)
- Modify: `frontend/src/index.css` (import leaflet CSS)
- Modify: `frontend/src/components/OpenStreetMap.jsx`

- [ ] **Step 1: Install leaflet via npm**
  ```
  cd D:/Github/frontend && npm install leaflet
  ```
  Expected: leaflet added to `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Add leaflet CSS import to `frontend/src/index.css`**

  At the very top of `frontend/src/index.css`, add:
  ```css
  @import 'leaflet/dist/leaflet.css';
  ```

- [ ] **Step 3: Replace CDN script injection with npm import in `OpenStreetMap.jsx`**

  Open `frontend/src/components/OpenStreetMap.jsx`. The component currently injects `<script>` and `<link>` tags from unpkg.com in a useEffect. Replace that entire loading mechanism.

  At the top of the file, add the import:
  ```jsx
  import L from 'leaflet'
  ```

  Remove the `isLoaded` state and the CDN-loading useEffect entirely:
  ```jsx
  // DELETE: const [isLoaded, setIsLoaded] = useState(false)
  // DELETE: the entire useEffect that injects leaflet script/link tags from unpkg
  ```

  In all places where the code checks `if (!isLoaded || ...)` — remove the `!isLoaded` check, since the library is now synchronously available.

  Replace all `window.L.` references with `L.` (the npm import). For example:
  ```jsx
  // BEFORE:
  const map = window.L.map(mapRef.current, { ... })
  // AFTER:
  const map = L.map(mapRef.current, { ... })
  ```
  ```jsx
  // BEFORE:
  layer instanceof window.L.Marker
  // AFTER:
  layer instanceof L.Marker
  ```

- [ ] **Step 4: Add `map.remove()` on unmount**

  In `OpenStreetMap`, the map init useEffect has a cleanup function that currently says `/* Cleanup not needed for Leaflet */`. Replace it:
  ```jsx
  // BEFORE:
  return () => {
    /* Cleanup not needed for Leaflet */
  }

  // AFTER:
  return () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }
  }
  ```

- [ ] **Step 5: Fix `LiveLocationTracker` missing `mapInstanceRef`**

  Inside the `LiveLocationTracker` component (still in `OpenStreetMap.jsx`), add a ref declaration at the top of the component function:
  ```jsx
  // Add as the first line inside LiveLocationTracker:
  const mapInstanceRef = useRef(null)
  ```

  Make sure `useRef` is already imported at the top of the file (it should be — check the import line).

- [ ] **Step 6: Verify build**
  ```
  cd D:/Github/frontend && npm run build
  ```
  Expected: no errors about `window.L`, leaflet, or `mapInstanceRef`.

- [ ] **Step 7: Manual verify — map renders**

  Start both servers. Go to `/trips`, search "Mumbai to Pune", click a trip. On the TripDetail page, the map should now render tiles and show a route line between the two city markers instead of a grey placeholder box. If coordinates were added correctly in Task 2.1, this will work end-to-end.

- [ ] **Step 8: Commit**
  ```
  git -C D:/Github add frontend/package.json frontend/src/index.css frontend/src/components/OpenStreetMap.jsx
  git -C D:/Github commit -m "fix: install leaflet via npm, add map cleanup on unmount, fix LiveLocationTracker ref"
  ```

---

## Group 3 — Auth & Chat Fixes

**Goal:** Socket connects with the right token, chat messages load, JWT refresh prevents 15-min logouts, and driver bookings API path is correct.

**Files modified:**
- `frontend/src/pages/Chat.jsx` — fix localStorage key, fix message URL, fix sender comparison
- `frontend/src/services/api.js` — add refresh interceptor
- `frontend/src/services/bookingService.js` — fix driver bookings URL
- `frontend/src/services/chatService.js` — fix socket URL default port
- `backend/src/controllers/chatController.js` — fix participants ObjectId comparison

---

### Task 3.1 — Fix Chat socket auth (wrong localStorage key)

**Root cause:** `Chat.jsx:50` reads `localStorage.getItem('token')` but the auth slice stores the token under `co-ride-token`. The socket sends `null` as auth token → server rejects the connection → `isConnected` stays `false` forever.

**Files:**
- Modify: `frontend/src/pages/Chat.jsx`

- [ ] **Step 1: Fix the localStorage key**

  In `frontend/src/pages/Chat.jsx`, find the `initializeSocket` function:
  ```jsx
  // BEFORE:
  const initializeSocket = () => {
    const token = localStorage.getItem('token')
    chatService.setToken(token)
    chatService.connect(token)
  ```

  ```jsx
  // AFTER:
  const initializeSocket = () => {
    const token = localStorage.getItem('co-ride-token')
    chatService.setToken(token)
    chatService.connect(token)
  ```

- [ ] **Step 2: Commit**
  ```
  git -C D:/Github add frontend/src/pages/Chat.jsx
  git -C D:/Github commit -m "fix: read co-ride-token from localStorage for socket auth"
  ```

---

### Task 3.2 — Fix chat messages URL and sender comparison

**Root cause (2 bugs):**
1. `Chat.jsx` calls `GET /chat/${chatId}` but the backend route is `GET /chat/:chatId/messages` → 404, falls to mock data.
2. `m.sender === user._id` compares an ObjectId string from JSON to the user's ID string — should work but the check is inconsistent. When the sender is populated, `m.sender` might be an object; when not populated, it's a string. The component mixes both patterns.

**Files:**
- Modify: `frontend/src/pages/Chat.jsx`

- [ ] **Step 1: Fix the messages API URL**

  In `frontend/src/pages/Chat.jsx`, find the `loadMessages` function:
  ```jsx
  // BEFORE (around line 190-197):
  const loadMessages = async (chatId) => {
    try {
      setIsLoading(true)
      const response = await api.get(`/chat/${chatId}`)
      ...
  ```

  ```jsx
  // AFTER:
  const loadMessages = async (chatId) => {
    try {
      setIsLoading(true)
      const response = await api.get(`/chat/${chatId}/messages`)
      ...
  ```

- [ ] **Step 2: Fix sender comparison when mapping messages**

  Still in `loadMessages`, find where messages are mapped. Look for `m.sender === user._id` or similar. The backend returns messages where `sender` is an ObjectId. Update the mapping to convert to string:
  ```jsx
  // Find the messages mapping (after the API call), and replace the sender check:
  // BEFORE:
  sender: m.sender === user._id ? 'me' : 'other',

  // AFTER:
  sender: m.sender?.toString() === user._id?.toString() ? 'me' : 'other',
  ```

  Also check the `initializeSocket` `onMessage` handler for the same pattern (around line 67):
  ```jsx
  // BEFORE:
  sender: message.sender._id === user._id ? 'me' : 'other',

  // AFTER:
  sender: message.sender?._id?.toString() === user._id?.toString() ? 'me' : 'other',
  ```

- [ ] **Step 3: Remove mock conversations**

  Find the mock data injection in `loadConversations` (the block with `Amit Singh`, `Priya Sharma`). Remove the entire mock block so the real empty state shows:
  ```jsx
  // DELETE: the if block that injects mock conversations when data is empty
  // Keep only: setConversations(response.data.data || [])
  ```

- [ ] **Step 4: Verify**

  Start both servers. Go to `/chat`. Open DevTools Network tab. Confirm that when you click a conversation, the request goes to `GET /api/chat/<id>/messages` and gets a 200 (not a 404 to `GET /api/chat/<id>`).

- [ ] **Step 5: Commit**
  ```
  git -C D:/Github add frontend/src/pages/Chat.jsx
  git -C D:/Github commit -m "fix: chat messages URL, sender comparison, remove mock data"
  ```

---

### Task 3.3 — Fix JWT refresh (prevent 15-min logouts)

**Root cause:** `api.js` on 401 immediately dispatches logout and redirects to `/login`. The refresh token (7-day TTL) is never used. Users are logged out after 15 minutes of idleness.

**Files:**
- Modify: `frontend/src/services/api.js`

- [ ] **Step 1: Add refresh logic to the 401 interceptor**

  Replace the entire response interceptor in `frontend/src/services/api.js`:

  ```jsx
  // BEFORE:
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const statusCode = error.response?.status
      
      if (statusCode === 401) {
        try {
          store.dispatch({ type: 'auth/logout/fulfilled' })
        } catch (e) {}
        window.location.href = '/login'
      }
      
      return Promise.reject(error)
    }
  )
  ```

  ```jsx
  // AFTER:
  let isRefreshing = false
  let failedQueue = []

  const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) reject(error)
      else resolve(token)
    })
    failedQueue = []
  }

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          }).catch(err => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        const refreshToken = localStorage.getItem('co-ride-refresh-token')

        if (!refreshToken) {
          isRefreshing = false
          store.dispatch({ type: 'auth/logout/fulfilled' })
          window.location.href = '/login'
          return Promise.reject(error)
        }

        try {
          const { data } = await axios.post(
            (import.meta.env.VITE_API_URL || '/api') + '/auth/refresh',
            { refreshToken }
          )
          const newToken = data.data.token
          const newRefresh = data.data.refreshToken

          localStorage.setItem('co-ride-token', newToken)
          if (newRefresh) localStorage.setItem('co-ride-refresh-token', newRefresh)
          store.dispatch({
            type: 'auth/setAuth/fulfilled',
            payload: { token: newToken, refreshToken: newRefresh }
          })
          setAuthToken(newToken)
          processQueue(null, newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          store.dispatch({ type: 'auth/logout/fulfilled' })
          window.location.href = '/login'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    }
  )
  ```

  Note: `axios` is already imported at line 1 as `import axios from 'axios'` — the raw `axios.post` call bypasses the interceptor to avoid infinite loops. Confirm `axios` is the named import (it is: `import axios from 'axios'`).

  Also update `authSlice.js` to handle the token update — add a `setToken` action to the slice reducers:
  ```jsx
  // In frontend/src/store/slices/authSlice.js, add inside reducers:{}:
  setToken: (state, action) => {
    const { token, refreshToken } = action.payload
    state.token = token
    if (refreshToken) state.refreshToken = refreshToken
    setAuthToken(token)
  },
  ```
  And export it: add `setToken` to the exports at the bottom:
  ```jsx
  export const { clearError, updateUser, setAuth, setToken } = authSlice.actions
  ```

  Then update the dispatch in `api.js` to use this action correctly:
  ```jsx
  // Change this line in the interceptor:
  store.dispatch({ type: 'auth/setAuth/fulfilled', payload: { token: newToken, refreshToken: newRefresh } })
  // To:
  store.dispatch({ type: 'auth/setToken', payload: { token: newToken, refreshToken: newRefresh } })
  ```

- [ ] **Step 2: Verify build**
  ```
  cd D:/Github/frontend && npm run build
  ```

- [ ] **Step 3: Manual verify**

  Log in. Open DevTools → Application → Local Storage. Manually delete `co-ride-token` (keep `co-ride-refresh-token`). Make an API call (refresh the page). Confirm: a new `co-ride-token` is set in localStorage and you stay logged in (not redirected to `/login`).

- [ ] **Step 4: Commit**
  ```
  git -C D:/Github add frontend/src/services/api.js frontend/src/store/slices/authSlice.js
  git -C D:/Github commit -m "fix: add JWT refresh interceptor to prevent 15-min session logouts"
  ```

---

### Task 3.4 — Fix driver bookings URL and socket port

**Root cause (2 bugs):**
1. `bookingService.getMyBookings` calls `GET /bookings/my` but backend route is `GET /bookings/driver/my`.
2. `chatService.js` defaults `SOCKET_URL` to `localhost:5000` but backend runs on `:5001`.

**Files:**
- Modify: `frontend/src/services/bookingService.js`
- Modify: `frontend/src/services/chatService.js`

- [ ] **Step 1: Fix driver bookings URL**

  In `frontend/src/services/bookingService.js`:
  ```js
  // BEFORE:
  getMyBookings: () => api.get('/bookings/my'),

  // AFTER:
  getMyBookings: () => api.get('/bookings/driver/my'),
  ```

- [ ] **Step 2: Fix socket URL default port**

  In `frontend/src/services/chatService.js`, find the `SOCKET_URL` constant:
  ```js
  // BEFORE:
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

  // AFTER:
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'
  ```

- [ ] **Step 3: Commit**
  ```
  git -C D:/Github add frontend/src/services/bookingService.js frontend/src/services/chatService.js
  git -C D:/Github commit -m "fix: driver bookings URL and socket port default"
  ```

---

### Task 3.5 — Fix backend chat participants check

**Root cause:** `chat.participants.includes(req.user._id)` compares Mongoose ObjectId instances with `===`, which always returns `false` even when the IDs match. Users are denied access to their own chats.

**Files:**
- Modify: `backend/src/controllers/chatController.js`

- [ ] **Step 1: Replace `.includes()` with `.some(p => p.equals())`**

  In `backend/src/controllers/chatController.js`, find every occurrence of the pattern:
  ```js
  chat.participants.includes(req.user._id)
  ```

  Replace each with:
  ```js
  chat.participants.some(p => p.equals(req.user._id))
  ```

  There are 3 occurrences (lines 73, 112, 187 per the audit). Apply to all three.

- [ ] **Step 2: Verify**

  Restart backend. Log in as a user who has an existing chat. Navigate to `/chat`. Confirm conversations load and messages are accessible without a 403.

- [ ] **Step 3: Commit**
  ```
  git -C D:/Github add backend/src/controllers/chatController.js
  git -C D:/Github commit -m "fix: use ObjectId .equals() for chat participants check"
  ```

---

## Group 4 — Data Correctness

**Goal:** Fix wrong status filters, double seat decrement, broken booking auth check, and wrong initial booking status.

**Files modified:**
- `frontend/src/pages/Dashboard.jsx` — fix UPCOMING filter
- `frontend/src/pages/Bookings.jsx` — fix UPCOMING filter tabs
- `frontend/src/pages/Trips.jsx` — fix stale filter effect
- `frontend/src/pages/Bookings.jsx` — fix booking.rating read
- `frontend/src/pages/TripDetail.jsx` — fix cancel booking uses wrong id
- `backend/src/controllers/otpController.js` — remove double seat decrement
- `backend/src/controllers/bookingController.js` — fix initial status + fix driver auth check

---

### Task 4.1 — Fix UPCOMING status filter (always shows 0)

**Root cause:** Booking status enum is `PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED`. There is no `UPCOMING` status. Dashboard and Bookings both filter for it, always returning 0 results.

**Files:**
- Modify: `frontend/src/pages/Dashboard.jsx`
- Modify: `frontend/src/pages/Bookings.jsx`

- [ ] **Step 1: Fix Dashboard filter**

  In `frontend/src/pages/Dashboard.jsx` (around line 20):
  ```jsx
  // BEFORE:
  const upcomingBookings = bookings.filter(b => b.status === 'UPCOMING').slice(0, 3) || []

  // AFTER:
  const upcomingBookings = bookings.filter(
    b => b.status === 'PENDING' || b.status === 'CONFIRMED'
  ).slice(0, 3) || []
  ```

- [ ] **Step 2: Fix Bookings filter tabs**

  In `frontend/src/pages/Bookings.jsx`, the filter buttons array is:
  ```jsx
  {['all', 'upcoming', 'completed', 'cancelled'].map(...)}
  ```

  Change to use real statuses:
  ```jsx
  // BEFORE:
  {['all', 'upcoming', 'completed', 'cancelled'].map((status) => (

  // AFTER:
  {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
  ```

  The `filteredBookings` filter logic already uses `.toLowerCase()` comparison on `booking.status`, so it will match correctly.

  Also fix the empty-state message:
  ```jsx
  // BEFORE:
  `No ${filter} bookings`

  // AFTER — already correct, just verify it reads filter variable
  `No ${filter} bookings`
  ```

- [ ] **Step 3: Commit**
  ```
  git -C D:/Github add frontend/src/pages/Dashboard.jsx frontend/src/pages/Bookings.jsx
  git -C D:/Github commit -m "fix: replace non-existent UPCOMING status with PENDING/CONFIRMED filters"
  ```

---

### Task 4.2 — Fix Trips filter effect stale closure

**Root cause:** `Trips.jsx` useEffect depends only on `[dispatch]` but reads `filters` from the closure. When filters change in Redux, the effect doesn't re-run → user must click Search button manually.

**Files:**
- Modify: `frontend/src/pages/Trips.jsx`

- [ ] **Step 1: Add filters to effect dependency and auto-fetch**

  In `frontend/src/pages/Trips.jsx`, find the initial fetch useEffect (around line 14-16):
  ```jsx
  // BEFORE:
  useEffect(() => {
    dispatch(fetchTrips({}))
  }, [dispatch])
  ```

  Read the full Trips.jsx file first to confirm where `filters` comes from (it's from Redux `useSelector`). Then:
  ```jsx
  // AFTER — add filters to deps so changing filters auto-fetches:
  useEffect(() => {
    dispatch(fetchTrips(filters))
  }, [dispatch, filters])
  ```

  This means every filter change triggers a re-fetch without needing to click Search. The Search button can remain for manual refresh.

- [ ] **Step 2: Verify**

  Go to `/trips`. Change the vehicle type filter. Confirm the list updates without clicking Search.

- [ ] **Step 3: Commit**
  ```
  git -C D:/Github add frontend/src/pages/Trips.jsx
  git -C D:/Github commit -m "fix: add filters to Trips effect deps so filter changes auto-fetch"
  ```

---

### Task 4.3 — Fix booking.trip.rating → booking.rating

**Root cause:** `Bookings.jsx:175` reads `booking.trip?.rating` to show stars. The rating field lives on the Booking document (`booking.rating`), not the Trip. Stars always show 0.

**Files:**
- Modify: `frontend/src/pages/Bookings.jsx`

- [ ] **Step 1: Fix the field read**

  In `frontend/src/pages/Bookings.jsx`, find the completed booking rating section (around line 175):
  ```jsx
  // BEFORE:
  {booking.status === 'COMPLETED' && booking.trip?.rating && (
    ...
    i < (booking.trip.rating || 0)
    ...
  )}

  // AFTER:
  {booking.status === 'COMPLETED' && booking.rating && (
    ...
    i < (booking.rating || 0)
    ...
  )}
  ```

- [ ] **Step 2: Commit**
  ```
  git -C D:/Github add frontend/src/pages/Bookings.jsx
  git -C D:/Github commit -m "fix: read booking.rating not booking.trip.rating for star display"
  ```

---

### Task 4.4 — Fix double seat decrement in OTP controller

**Root cause:** `createBooking` already subtracts `seatsBooked` from `availableSeats` when the booking is created. `verifyTripStartOTP` then does it again → seats go negative.

**Files:**
- Modify: `backend/src/controllers/otpController.js`

- [ ] **Step 1: Remove the decrement from verifyTripStartOTP**

  In `backend/src/controllers/otpController.js` (around lines 117-120):
  ```js
  // DELETE these three lines:
  const trip = await Trip.findById(booking.trip)
  trip.availableSeats -= booking.seatsBooked
  await trip.save()
  ```

  Keep everything else in that function (the OTP mark-as-used, booking status update to IN_PROGRESS, the response).

- [ ] **Step 2: Verify**

  Restart backend. Create a booking for a trip with e.g. 3 seats available. Verify the trip afterwards still shows 2 available (not going negative).

- [ ] **Step 3: Commit**
  ```
  git -C D:/Github add backend/src/controllers/otpController.js
  git -C D:/Github commit -m "fix: remove double availableSeats decrement in verifyTripStartOTP"
  ```

---

### Task 4.5 — Fix createBooking initial status and driver auth check

**Root cause (2 bugs):**
1. `createBooking` creates bookings with `status: 'CONFIRMED'` immediately, bypassing the PENDING → CONFIRMED workflow.
2. `getBookingById` compares `booking.trip.driver._id !== req.user._id` but `driver` is an unpopulated ObjectId — `_id` is `undefined` → drivers can't view their own bookings.

**Files:**
- Modify: `backend/src/controllers/bookingController.js`

- [ ] **Step 1: Fix initial booking status**

  In `backend/src/controllers/bookingController.js` in the `createBooking` function, find where the booking is created:
  ```js
  // BEFORE (around line 113-118):
  const booking = await Booking.create({
    ...
    status: 'CONFIRMED',
    ...
  })

  // AFTER:
  const booking = await Booking.create({
    ...
    status: 'PENDING',
    ...
  })
  ```

- [ ] **Step 2: Fix driver authorization check**

  In the same file, in `getBookingById` (around line 37-44):
  ```js
  // BEFORE:
  if (!booking.user.equals(req.user._id) && 
      req.user.role !== 'ADMIN' && 
      booking.trip.driver._id !== req.user._id) {

  // AFTER:
  if (!booking.user.equals(req.user._id) && 
      req.user.role !== 'ADMIN' && 
      booking.trip.driver?.toString() !== req.user._id.toString()) {
  ```

- [ ] **Step 3: Verify**

  Restart backend. Create a new booking. Check its status in MongoDB — should be `PENDING`. As the trip driver, call `GET /api/bookings/:id` — should return 200, not 403.

- [ ] **Step 4: Commit**
  ```
  git -C D:/Github add backend/src/controllers/bookingController.js
  git -C D:/Github commit -m "fix: createBooking starts as PENDING, fix driver auth ObjectId comparison"
  ```

---

## Group 5 — Security & Config

**Goal:** Close the most critical security gaps (free wallet, mass-assignment role, brute-force login) and align environment config so the app works the same for all developers.

**Files modified:**
- `backend/src/controllers/walletController.js` — disable free add/withdraw in production
- `backend/src/routes/authRoutes.js` — add rate limiting
- `backend/src/controllers/authController.js` — strip `role` from register body
- `backend/src/index.js` — CORS from env var
- `backend/.env.example` — align port
- `frontend/src/services/chatService.js` — already fixed in Group 3

---

### Task 5.1 — Disable free wallet top-up and withdrawal

**Root cause:** `POST /wallet/add` credits any amount to a user's wallet with no payment verification. `POST /wallet/withdraw` drains balance with no payout integration. Both are security-critical in production.

**Files:**
- Modify: `backend/src/controllers/walletController.js`

- [ ] **Step 1: Block the endpoints in production**

  In `backend/src/controllers/walletController.js`, add a guard at the top of both `addMoney` and `withdraw`:

  ```js
  // Add at the START of the addMoney handler body:
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Direct wallet top-up is not supported. Use the payment flow.',
    })
  }
  ```

  ```js
  // Add at the START of the withdraw handler body:
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Wallet withdrawal is not currently supported.',
    })
  }
  ```

  This keeps them usable in development (for testing) while blocking them in production.

- [ ] **Step 2: Set NODE_ENV in backend .env**

  In `backend/.env`, confirm or add:
  ```
  NODE_ENV=development
  ```
  In production deployment, set `NODE_ENV=production`.

- [ ] **Step 3: Verify**

  With `NODE_ENV=development`, `POST /wallet/add` should still work. Change env var to `production` temporarily and confirm the 403 response.

- [ ] **Step 4: Commit**
  ```
  git -C D:/Github add backend/src/controllers/walletController.js backend/.env
  git -C D:/Github commit -m "fix: block free wallet add/withdraw in production"
  ```

---

### Task 5.2 — Add rate limiting to login and register

**Root cause:** Login and register share the global rate limit (100 req/15 min per IP). A brute-force attack can try 100 passwords in 15 minutes. `express-rate-limit` is already installed.

**Files:**
- Modify: `backend/src/routes/authRoutes.js`

- [ ] **Step 1: Add a strict rate limiter to login and register**

  In `backend/src/routes/authRoutes.js`, add at the top of the file:
  ```js
  import rateLimit from 'express-rate-limit'

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  })
  ```

  Then add the limiter to the login and register routes:
  ```js
  // BEFORE:
  router.post('/register', register)
  router.post('/login', login)

  // AFTER:
  router.post('/register', authLimiter, register)
  router.post('/login', authLimiter, login)
  ```

- [ ] **Step 2: Verify**

  Restart backend. Submit login 11 times in quick succession. The 11th should return a 429 with the rate limit message.

- [ ] **Step 3: Commit**
  ```
  git -C D:/Github add backend/src/routes/authRoutes.js
  git -C D:/Github commit -m "fix: add rate limiting (10/15min) to login and register endpoints"
  ```

---

### Task 5.3 — Strip `role` from register body (prevent admin self-grant)

**Root cause:** `register` controller reads `role` from `req.body`. Any client can send `role: 'ADMIN'` and create an admin account.

**Files:**
- Modify: `backend/src/controllers/authController.js`

- [ ] **Step 1: Whitelist role to USER or DRIVER**

  In `backend/src/controllers/authController.js`, find the `register` handler where user data is extracted from the body (around lines 55-64). Find where `role` is read:
  ```js
  // Find a line similar to:
  const { name, email, password, role, ... } = req.body

  // Or where role is passed to User.create / new User():
  role: role || 'USER'
  ```

  Replace so that role is always forced to a safe value:
  ```js
  // Replace whatever role assignment exists with:
  const allowedRoles = ['USER', 'DRIVER']
  const safeRole = allowedRoles.includes(req.body.role) ? req.body.role : 'USER'
  ```

  Then use `safeRole` wherever `role` was used in the user creation.

- [ ] **Step 2: Verify**

  Register with `{ ..., role: 'ADMIN' }` in the request body. Confirm the created user has `role: 'USER'` (check DB or the response).

- [ ] **Step 3: Commit**
  ```
  git -C D:/Github add backend/src/controllers/authController.js
  git -C D:/Github commit -m "fix: whitelist role to USER|DRIVER on register, block ADMIN self-grant"
  ```

---

### Task 5.4 — CORS from env var + align port in .env.example

**Root cause (2 config bugs):**
1. CORS `origin` array is hardcoded in `backend/src/index.js`. Production URL is never read from env.
2. `backend/.env.example` says `PORT=5000` but actual `.env` and Vite proxy use `5001`. New devs copying the example get connection errors.

**Files:**
- Modify: `backend/src/index.js`
- Modify: `backend/.env.example`

- [ ] **Step 1: Read CORS origin from env**

  In `backend/src/index.js`, find the CORS config (around lines 25-41):
  ```js
  // BEFORE (hardcoded array):
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', ...]

  // AFTER — read from env:
  origin: (origin, callback) => {
    const allowed = (process.env.CLIENT_URL || 'http://localhost:3000')
      .split(',')
      .map(u => u.trim())
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  ```

- [ ] **Step 2: Align .env.example port**

  In `backend/.env.example`, change:
  ```
  # BEFORE:
  PORT=5000

  # AFTER:
  PORT=5001
  ```

  Also confirm `CLIENT_URL` in `.env.example` matches Vite's dev port:
  ```
  CLIENT_URL=http://localhost:3000
  ```

- [ ] **Step 3: Update backend .env CLIENT_URL**

  In `backend/.env`, confirm:
  ```
  CLIENT_URL=http://localhost:3000
  ```
  (Vite runs on 3000 as per `vite.config.js`.)

- [ ] **Step 4: Verify**

  Restart backend. Frontend requests from `http://localhost:3000` should succeed. A request from a different origin (e.g. test via curl with `Origin: http://evil.com`) should get a CORS error.

- [ ] **Step 5: Commit**
  ```
  git -C D:/Github add backend/src/index.js backend/.env.example backend/.env
  git -C D:/Github commit -m "fix: read CORS origin from CLIENT_URL env var, align .env.example port to 5001"
  ```

---

## Execution Verification Checklist

After all 5 groups are complete, run this browser walk-through:

- [ ] `/register` — complete registration → lands on `/dashboard`
- [ ] `/login` — log in → token in localStorage as `co-ride-token`
- [ ] `/bookings` — page renders (not blank); booking list or "No bookings found" shown
- [ ] `/trips` — search "Mumbai" to "Pune" → results appear; change filter → list updates without clicking Search
- [ ] `/trips/:id` — TripDetail loads; Leaflet map shows tiles and route (not grey placeholder)
- [ ] `/chat` — socket connects (green indicator); click a conversation → messages load from API (not mock data)
- [ ] `/wallet` — page renders; Add Money button present
- [ ] Any unknown URL (e.g. `/foo`) → 404 page renders inside Layout
- [ ] Footer links — clicking "About" etc. does nothing (span, not link)
- [ ] `npm run build` in `frontend/` — completes with 0 errors
