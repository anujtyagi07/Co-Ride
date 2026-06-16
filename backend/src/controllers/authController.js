import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { User } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js'
import { verifyCollegeEmail } from '../utils/colleges.js'

// Generate JWT Token
const generateToken = (userId, secret, expiresIn) => {
  return jwt.sign({ id: userId }, secret, { expiresIn })
}

// Generate both access and refresh tokens
const generateAuthTokens = (userId) => {
  const accessToken = generateToken(
    userId,
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN || '15m'
  )
  
  const refreshToken = generateToken(
    userId,
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  )

  return { accessToken, refreshToken }
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, isStudent, collegeEmail, collegeId } = req.body

  // Whitelist role — never trust client-supplied ADMIN
  const ALLOWED_ROLES = ['USER', 'DRIVER']
  const role = ALLOWED_ROLES.includes(req.body.role) ? req.body.role : 'USER'

  // Check if user exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email',
    })
  }

  // Validate college email for students
  if (isStudent && collegeEmail) {
    // Simple validation - check if it's an email format
    if (!collegeEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid college email',
      })
    }
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    isStudent: isStudent || false,
    collegeEmail,
    collegeId,
    isVerified: isStudent && collegeEmail ? false : true, // Students need verification
  })

  // Generate tokens
  const { accessToken, refreshToken } = generateAuthTokens(user._id)

  // Save refresh token to user
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: user.toJSON(),
      token: accessToken,
      refreshToken,
    },
  })
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Check for user
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    })
  }

  // Check password
  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    })
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateAuthTokens(user._id)

  // Save refresh token
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      token: accessToken,
      refreshToken,
    },
  })
})

// @desc    Get current user
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  res.status(200).json({
    success: true,
    data: user.toJSON(),
  })
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    avatar: req.body.avatar,
  }

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  )

  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: user.toJSON(),
  })
})

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user._id).select('+password')

  // Check current password
  const isMatch = await user.comparePassword(currentPassword)

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    })
  }

  user.password = newPassword
  await user.save()

  // Generate new tokens
  const { accessToken, refreshToken } = generateAuthTokens(user._id)
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: {
      token: accessToken,
      refreshToken,
    },
  })
})

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required',
    })
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

    // Find user and verify refresh token matches
    const user = await User.findById(decoded.id).select('+refreshToken')

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
    }

    // Generate new tokens
    const tokens = generateAuthTokens(user._id)
    user.refreshToken = tokens.refreshToken
    await user.save({ validateBeforeSave: false })

    res.status(200).json({
      success: true,
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    })
  }
})

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null })

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  })
})

// @desc    Verify student
// @route   POST /api/auth/verify-student
// @access  Private
export const verifyStudent = asyncHandler(async (req, res) => {
  const { collegeEmail } = req.body

  if (!collegeEmail) {
    return res.status(400).json({
      success: false,
      message: 'College email is required',
    })
  }

  const verification = verifyCollegeEmail(collegeEmail)
  if (!verification.valid) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid college email address',
    })
  }

  const user = await User.findById(req.user._id)

  if (!user.isStudent) {
    return res.status(400).json({
      success: false,
      message: 'User is not marked as student',
    })
  }

  user.collegeEmail = collegeEmail
  user.collegeId = verification.college.name
  user.isVerified = true
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Student verification successful',
    data: user.toJSON(),
  })
})

// @desc    Forgot password (sends OTP to email)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No account found with this email',
    })
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

  // Store OTP in user document
  user.resetPasswordOTP = otp
  user.resetPasswordOTPExpires = expiresAt
  await user.save({ validateBeforeSave: false })

  // Send OTP via email (async, don't await)
  sendOTPEmail(email, otp, 'password_reset')

  res.status(200).json({
    success: true,
    message: 'Password reset code sent to your email',
    data: { expiresAt },
  })
})

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    })
  }

  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No account found with this email',
    })
  }

  // Verify OTP
  if (user.resetPasswordOTP !== otp) {
    return res.status(400).json({
      success: false,
      message: 'Invalid reset code',
    })
  }

  if (!user.resetPasswordOTPExpires || user.resetPasswordOTPExpires < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Reset code has expired',
    })
  }

  // Set new password
  user.password = newPassword
  user.resetPasswordOTP = ''
  user.resetPasswordOTPExpires = null
  await user.save()

  // Generate new tokens
  const { accessToken, refreshToken } = generateAuthTokens(user._id)
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    data: {
      user: user.toJSON(),
      token: accessToken,
      refreshToken,
    },
  })
})