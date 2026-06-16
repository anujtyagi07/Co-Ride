import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Card, Button, Input, Loader } from '../components/common'
import driverService from '../services/driverService'
import { COLLEGES } from '../utils/constants'

// List of college domains for verification
const COLLEGE_DOMAINS = COLLEGES.map(c => c.domain)

function DriverVerification() {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState(null)
  const [documents, setDocuments] = useState({
    aadharFront: null,
    aadharBack: null,
    drivingLicense: null,
    vehicleRC: null,
    vehicleInsurance: null,
  })
  const [previews, setPreviews] = useState({
    aadharFront: '',
    aadharBack: '',
    drivingLicense: '',
    vehicleRC: '',
    vehicleInsurance: '',
  })
  const [studentInfo, setStudentInfo] = useState({
    isStudent: false,
    collegeEmail: '',
  })
  const [uploadStatus, setUploadStatus] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [collegeList, setCollegeList] = useState([])

  useEffect(() => {
    fetchVerificationStatus()
    setCollegeList(COLLEGES.slice(0, 50)) // Load first 50 colleges
  }, [])

  const fetchVerificationStatus = async () => {
    try {
      const response = await driverService.getVerificationStatus()
      setVerificationStatus(response.data)
      
      // Set student info if already verified
      if (user?.isStudent) {
        setStudentInfo({
          isStudent: user.isStudent,
          collegeEmail: user.collegeEmail || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (field, file) => {
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      alert('File must be an image (JPEG, PNG) or PDF')
      return
    }

    setDocuments(prev => ({ ...prev, [field]: file }))
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [field]: reader.result }))
      }
      reader.readAsDataURL(file)
    } else {
      setPreviews(prev => ({ ...prev, [field]: 'pdf' }))
    }
  }

  const uploadDocument = async (field) => {
    const file = documents[field]
    if (!file) return

    try {
      setUploadStatus(prev => ({ ...prev, [field]: 'uploading' }))
      
      // In production, upload to cloud storage first
      // For demo, simulate upload with a placeholder URL
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const fileUrl = previews[field] // In production, this would be the cloud URL
      
      await driverService.uploadDocument(field, fileUrl)
      
      setUploadStatus(prev => ({ ...prev, [field]: 'success' }))
      fetchVerificationStatus()
    } catch (error) {
      setUploadStatus(prev => ({ ...prev, [field]: 'error' }))
      console.error('Upload failed:', error)
    }
  }

  const handleStudentToggle = (checked) => {
    setStudentInfo(prev => ({ ...prev, isStudent: checked }))
  }

  const handleCollegeEmailChange = (email) => {
    setStudentInfo(prev => ({ ...prev, collegeEmail: email }))
  }

  const verifyCollegeEmail = () => {
    const email = studentInfo.collegeEmail
    const domain = email.split('@')[1]
    
    if (!domain) {
      alert('Please enter a valid email address')
      return
    }

    const isValidCollege = COLLEGE_DOMAINS.includes(domain.toLowerCase())
    
    if (isValidCollege) {
      alert('College email verified! You will receive a discount on rides.')
    } else {
      alert('This email domain is not from a recognized college. Students from IITs, NITs, and other major universities are eligible.')
    }
  }

  const submitVerification = async () => {
    // Check if all required documents are uploaded
    const requiredDocs = ['aadharFront', 'aadharBack', 'drivingLicense', 'vehicleRC']
    const missingDocs = requiredDocs.filter(doc => !documents[doc])
    
    if (missingDocs.length > 0) {
      alert('Please upload all required documents')
      return
    }

    try {
      setSubmitting(true)
      await driverService.updateProfile({
        ...studentInfo,
        ...Object.fromEntries(
          Object.entries(documents).map(([key, value]) => [key, value ? previews[key] : ''])
        ),
      })
      alert('Documents submitted for verification. You will be notified once approved.')
      fetchVerificationStatus()
    } catch (error) {
      alert('Failed to submit documents. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader size="lg" />
      </div>
    )
  }

  const isVerified = verificationStatus?.isVerified
  const hasAllDocuments = verificationStatus?.hasAllDocuments

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Driver Verification</h1>
        <p className="mt-2 text-gray-600">Complete your profile to start accepting rides</p>
      </div>

      {/* Status Banner */}
      {isVerified ? (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Verification Complete</h3>
            <p className="text-sm text-green-600">You are approved to drive and accept rides</p>
          </div>
        </div>
      ) : verificationStatus?.status === 'PENDING' ? (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800">Verification Pending</h3>
            <p className="text-sm text-yellow-600">Your documents are being reviewed. This usually takes 24-48 hours.</p>
          </div>
        </div>
      ) : null}

      <div className="space-y-8">
        {/* Identity Documents */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Identity Documents</h2>
          <p className="text-sm text-gray-500 mb-6">Required for driver verification</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Aadhar Front */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhar Card (Front) <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-4 text-center ${
                previews.aadharFront ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}>
                {previews.aadharFront ? (
                  previews.aadharFront === 'pdf' ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">PDF uploaded</span>
                    </div>
                  ) : (
                    <img src={previews.aadharFront} alt="Aadhar Front" className="max-h-32 mx-auto rounded-lg" />
                  )
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('aadharFront', e.target.files[0])}
                      className="hidden"
                      id="aadharFront"
                    />
                    <label htmlFor="aadharFront" className="cursor-pointer">
                      <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-500">Upload Aadhar Front</span>
                    </label>
                  </>
                )}
              </div>
              {documents.aadharFront && (
                <Button 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => uploadDocument('aadharFront')}
                  loading={uploadStatus.aadharFront === 'uploading'}
                >
                  {uploadStatus.aadharFront === 'success' ? 'Uploaded' : 'Upload'}
                </Button>
              )}
            </div>

            {/* Aadhar Back */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhar Card (Back) <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-4 text-center ${
                previews.aadharBack ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}>
                {previews.aadharBack ? (
                  previews.aadharBack === 'pdf' ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">PDF uploaded</span>
                    </div>
                  ) : (
                    <img src={previews.aadharBack} alt="Aadhar Back" className="max-h-32 mx-auto rounded-lg" />
                  )
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('aadharBack', e.target.files[0])}
                      className="hidden"
                      id="aadharBack"
                    />
                    <label htmlFor="aadharBack" className="cursor-pointer">
                      <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-500">Upload Aadhar Back</span>
                    </label>
                  </>
                )}
              </div>
              {documents.aadharBack && (
                <Button 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => uploadDocument('aadharBack')}
                  loading={uploadStatus.aadharBack === 'uploading'}
                >
                  {uploadStatus.aadharBack === 'success' ? 'Uploaded' : 'Upload'}
                </Button>
              )}
            </div>

            {/* Driving License */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driving License <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-4 text-center ${
                previews.drivingLicense ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}>
                {previews.drivingLicense ? (
                  <img src={previews.drivingLicense} alt="Driving License" className="max-h-32 mx-auto rounded-lg" />
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('drivingLicense', e.target.files[0])}
                      className="hidden"
                      id="drivingLicense"
                    />
                    <label htmlFor="drivingLicense" className="cursor-pointer">
                      <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-500">Upload Driving License</span>
                    </label>
                  </>
                )}
              </div>
              {documents.drivingLicense && (
                <Button 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => uploadDocument('drivingLicense')}
                  loading={uploadStatus.drivingLicense === 'uploading'}
                >
                  {uploadStatus.drivingLicense === 'success' ? 'Uploaded' : 'Upload'}
                </Button>
              )}
            </div>

            {/* Vehicle RC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Registration (RC) <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-4 text-center ${
                previews.vehicleRC ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}>
                {previews.vehicleRC ? (
                  <img src={previews.vehicleRC} alt="Vehicle RC" className="max-h-32 mx-auto rounded-lg" />
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('vehicleRC', e.target.files[0])}
                      className="hidden"
                      id="vehicleRC"
                    />
                    <label htmlFor="vehicleRC" className="cursor-pointer">
                      <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-500">Upload Vehicle RC</span>
                    </label>
                  </>
                )}
              </div>
              {documents.vehicleRC && (
                <Button 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => uploadDocument('vehicleRC')}
                  loading={uploadStatus.vehicleRC === 'uploading'}
                >
                  {uploadStatus.vehicleRC === 'success' ? 'Uploaded' : 'Upload'}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Vehicle Documents */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Documents</h2>
          <p className="text-sm text-gray-500 mb-6">Optional but recommended</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Vehicle Insurance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Insurance
              </label>
              <div className={`border-2 border-dashed rounded-xl p-4 text-center ${
                previews.vehicleInsurance ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}>
                {previews.vehicleInsurance ? (
                  <img src={previews.vehicleInsurance} alt="Vehicle Insurance" className="max-h-32 mx-auto rounded-lg" />
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('vehicleInsurance', e.target.files[0])}
                      className="hidden"
                      id="vehicleInsurance"
                    />
                    <label htmlFor="vehicleInsurance" className="cursor-pointer">
                      <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-500">Upload Insurance</span>
                    </label>
                  </>
                )}
              </div>
              {documents.vehicleInsurance && (
                <Button 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => uploadDocument('vehicleInsurance')}
                  loading={uploadStatus.vehicleInsurance === 'uploading'}
                >
                  {uploadStatus.vehicleInsurance === 'success' ? 'Uploaded' : 'Upload'}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Student Verification */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Student Verification</h2>
          <p className="text-sm text-gray-500 mb-6">Get exclusive student discounts on rides</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Are you a student?</div>
                <div className="text-sm text-gray-500">Verified students get 30% off on all rides</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={studentInfo.isStudent}
                  onChange={(e) => handleStudentToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {studentInfo.isStudent && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College Email
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="yourname@college.edu.in"
                      value={studentInfo.collegeEmail}
                      onChange={(e) => handleCollegeEmailChange(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={verifyCollegeEmail}>
                      Verify
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Use your official college email for verification. Supported domains include IITs, NITs, and major universities.
                  </p>
                </div>

                {/* College Quick Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or select your college
                  </label>
                  <select
                    className="input-field w-full"
                    onChange={(e) => {
                      const college = COLLEGES.find(c => c.name === e.target.value)
                      if (college) {
                        const emailPrefix = studentInfo.collegeEmail.split('@')[0]
                        setStudentInfo(prev => ({
                          ...prev,
                          collegeEmail: emailPrefix ? `${emailPrefix}@${college.domain}` : `student@${college.domain}`
                        }))
                      }
                    }}
                  >
                    <option value="">Select a college...</option>
                    {COLLEGE_DOMAINS.map((college, idx) => (
                      <option key={idx} value={COLLEGES[idx]?.name}>
                        {COLLEGES[idx]?.name} - {COLLEGES[idx]?.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={fetchVerificationStatus}>
            Refresh Status
          </Button>
          <Button 
            onClick={submitVerification}
            loading={submitting}
            disabled={!hasAllDocuments}
          >
            Submit for Verification
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DriverVerification