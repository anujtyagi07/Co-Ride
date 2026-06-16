import { Card, Button } from '../components/common'

function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Help Center & Contact</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900">How do I book a ride?</h3>
              <p>Search for trips, select one that matches your route, and click Book Now.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">How do I become a driver?</h3>
              <p>Register as a driver, complete verification, and start offering rides.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Is my payment secure?</h3>
              <p>Yes. We use Razorpay for secure payment processing.</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            Have a question or need support? Reach out to our team.
          </p>
          <div className="space-y-3 text-gray-600">
            <p><span className="font-medium">Email:</span> support@co-ride.example.com</p>
            <p><span className="font-medium">Phone:</span> +91 98765 43210</p>
            <p><span className="font-medium">Hours:</span> Mon-Sat, 9 AM - 7 PM IST</p>
          </div>
          <Button className="w-full mt-6" onClick={() => window.location.href = 'mailto:support@co-ride.example.com'}>
            Send Email
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default Contact
