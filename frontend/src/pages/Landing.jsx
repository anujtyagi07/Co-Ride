import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '../components/common'
import LocationSearch from '../components/LocationSearch'

function Landing() {
  const navigate = useNavigate()
  const [searchFrom, setSearchFrom] = useState('')
  const [searchTo, setSearchTo] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchFrom) params.append('from', searchFrom)
    if (searchTo) params.append('to', searchTo)
    navigate(`/trips?${params.toString()}`)
  }
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Smart Ride-Sharing for
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
                  {' '}Indian Students
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-lg">
                Save money on daily commutes. Find reliable ride partners from your college.
                Travel sustainably with Co-Ride.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg">Get Started Free</Button>
                </Link>
              </div>
              {/* Quick Search Form */}
              <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="flex-1">
                  <LocationSearch
                    placeholder="From (your location)"
                    value={searchFrom}
                    onChange={setSearchFrom}
                  />
                </div>
                <div className="flex-1">
                  <LocationSearch
                    placeholder="To (destination)"
                    value={searchTo}
                    onChange={setSearchTo}
                  />
                </div>
                <Button type="submit" size="lg" className="sm:w-auto">
                  Find Rides
                </Button>
              </form>
            </div>

            {/* Right side - Visual card and stats */}
            <div className="relative hidden lg:block">
              {/* Stats badges */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-200 rounded-full opacity-30 blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-secondary-200 rounded-full opacity-30 blur-3xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                <div className="bg-gray-100 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-xl">A</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Amit Singh</div>
                      <div className="text-sm text-gray-500">Driver • 4.8 Rating</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">From</div>
                      <div className="font-medium text-gray-900">IIT Delhi</div>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">To</div>
                      <div className="font-medium text-gray-900">Connaught Place</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500">Price per seat</div>
                      <div className="text-xl font-bold text-primary-600">Rs. 150</div>
                    </div>
                    <Button size="sm">Book Now</Button>
                  </div>
                </div>
              </div>
              {/* Stats row below card */}
              <div className="mt-8 flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">10K+</div>
                  <div className="text-sm text-gray-500">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">50+</div>
                  <div className="text-sm text-gray-500">Colleges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">1M+</div>
                  <div className="text-sm text-gray-500">Rides Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Choose Co-Ride?</h2>
            <p className="mt-4 text-lg text-gray-600">Everything you need for comfortable and affordable commuting</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Discounts</h3>
              <p className="text-gray-600">Verified students get up to 30% off on all rides. Valid college ID required.</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Matching</h3>
              <p className="text-gray-600">Smart algorithms find the best route matches based on your schedule and preferences.</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Razorpay-powered transactions. Your money is protected until ride completion.</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Chat</h3>
              <p className="text-gray-600">Communicate with your ride partner instantly. Coordinate pickup points easily.</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Route Optimization</h3>
              <p className="text-gray-600">Google Maps integration for accurate ETAs and optimal routes.</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">In-app Wallet</h3>
              <p className="text-gray-600">Add funds easily. Pay for rides with just a tap. No cash needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">Get your first ride in just 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up & Verify</h3>
              <p className="text-gray-600">Register with your college email. Upload your student ID for verification.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Search & Book</h3>
              <p className="text-gray-600">Find rides matching your route. Book seats with instant confirmation.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ride & Save</h3>
              <p className="text-gray-600">Meet your ride partner. Travel comfortably at discounted prices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Saving?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands of students already using Co-Ride for their daily commute.</p>
          <Link to="/register">
            <Button variant="ghost" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Landing