import { Card } from '../components/common'

function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About Co-Ride</h1>
      <Card className="mb-8">
        <p className="text-gray-600 mb-4">
          Co-Ride is a smart ride-sharing platform built for Indian cities. We connect
          students and daily commuters with verified drivers to make travel affordable,
          social, and sustainable.
        </p>
        <p className="text-gray-600 mb-4">
          Whether you are heading to college, work, or a weekend trip, Co-Ride helps you
          find or offer rides with people going your way.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Our Mission</h2>
        <p className="text-gray-600">
          To reduce traffic congestion, lower travel costs, and build a community of
          responsible travellers across India.
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Careers</h2>
          <p className="text-gray-600">
            Want to build the future of mobility in India? We are always looking for
            passionate people. Send your resume to careers@co-ride.example.com.
          </p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Blog</h2>
          <p className="text-gray-600">
            Stories, travel tips, and updates from the Co-Ride community. Check back soon
            for our latest posts.
          </p>
        </Card>
      </div>
    </div>
  )
}

export default About
