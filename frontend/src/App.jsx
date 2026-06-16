import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DriverDashboard from './pages/DriverDashboard'
import DriverVerification from './pages/DriverVerification'
import Trips from './pages/Trips'
import TripDetail from './pages/TripDetail'
import CreateTrip from './pages/CreateTrip'
import Bookings from './pages/Bookings'
import Wallet from './pages/Wallet'
import Chat from './pages/Chat'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import Notifications from './pages/Notifications'
import LiveTracking from './pages/LiveTracking'
import About from './pages/About'
import Contact from './pages/Contact'
import Legal from './pages/Legal'
import ProtectedRoute from './components/ProtectedRoute'

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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="trips" element={<Trips />} />
        <Route path="trips/:id" element={<TripDetail />} />
        <Route path="bookings" element={
          <ProtectedRoute roles={['USER', 'DRIVER', 'ADMIN']}>
            <Bookings />
          </ProtectedRoute>
        } />
        <Route path="wallet" element={
          <ProtectedRoute roles={['USER', 'DRIVER', 'ADMIN']}>
            <Wallet />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute roles={['USER', 'DRIVER', 'ADMIN']}>
            <Chat />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="dashboard" element={
          <ProtectedRoute roles={['USER', 'DRIVER', 'ADMIN']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="create-trip" element={
          <ProtectedRoute roles={['DRIVER', 'ADMIN']}>
            <CreateTrip />
          </ProtectedRoute>
        } />
        <Route path="driver-dashboard" element={
          <ProtectedRoute roles={['DRIVER', 'ADMIN']}>
            <DriverDashboard />
          </ProtectedRoute>
        } />
        <Route path="driver-verification" element={
          <ProtectedRoute roles={['DRIVER', 'ADMIN']}>
            <DriverVerification />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute roles={['USER', 'DRIVER', 'ADMIN']}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="notifications" element={
          <ProtectedRoute roles={['USER', 'DRIVER', 'ADMIN']}>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="live-tracking" element={
          <ProtectedRoute roles={['DRIVER', 'ADMIN']}>
            <LiveTracking />
          </ProtectedRoute>
        } />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="legal" element={<Legal />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App