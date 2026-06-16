import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '../components/common'

const TABS = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms of Service' },
  { id: 'cookies', label: 'Cookie Policy' },
  { id: 'safety', label: 'Safety' },
]

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    body: [
      'Co-Ride respects your privacy. This policy explains how we collect, use, and protect your personal information.',
      'We collect information you provide during registration, profile creation, and ride booking. This includes your name, email, phone number, and college details for verified students.',
      'Your location data is used only to show trip routes and enable live tracking when you explicitly start sharing your location.',
      'We do not sell your personal data to third parties. Payment information is handled securely by Razorpay.',
      'You can request deletion of your account and data by contacting support.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [
      'By using Co-Ride, you agree to these terms. If you do not agree, please do not use the platform.',
      'Users must be at least 18 years old to create an account and book or offer rides.',
      'Drivers are responsible for ensuring their vehicle is roadworthy, insured, and complies with local laws.',
      'Co-Ride is a platform that connects riders and drivers. We are not responsible for disputes, accidents, or losses during rides.',
      'We reserve the right to suspend accounts that violate these terms or engage in fraudulent activity.',
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    body: [
      'Co-Ride uses cookies and similar technologies to provide and improve our services.',
      'Essential cookies are required for authentication and core platform functionality.',
      'Analytics cookies help us understand how users interact with the platform so we can improve the experience.',
      'You can disable non-essential cookies through your browser settings.',
    ],
  },
  safety: {
    title: 'Safety',
    body: [
      'Your safety is important to us. Follow these guidelines when using Co-Ride.',
      'Verify the vehicle and driver details before starting a trip.',
      'Share your live trip status with friends or family when possible.',
      'Use in-app chat and OTP verification for secure handshakes between drivers and riders.',
      'Report any suspicious behaviour or safety concerns immediately through the app.',
    ],
  },
}

function Legal() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.toString().replace('=', '') || 'privacy'
  const validTab = TABS.find((t) => t.id === initialTab)?.id || 'privacy'
  const [activeTab, setActiveTab] = useState(validTab)

  useEffect(() => {
    const tab = searchParams.toString().replace('=', '')
    if (tab && TABS.find((t) => t.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Legal & Safety</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <Card>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{CONTENT[activeTab].title}</h2>
        <div className="space-y-4 text-gray-600">
          {CONTENT[activeTab].body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Legal
