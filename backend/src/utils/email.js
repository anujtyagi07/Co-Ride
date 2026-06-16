import nodemailer from 'nodemailer'

let transporter = null

const getTransporter = () => {
  if (transporter) return transporter

  // Use SMTP settings from env
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  } else {
    // Ethereal test account for development (emails captured, not sent)
    console.log('⚠️  SMTP not configured — emails will be logged to console only')
    return null
  }

  return transporter
}

export const sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter()

  if (!t) {
    console.log(`📧 [EMAIL LOG] To: ${to}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   Body: ${text || '(HTML content)'}`)
    return { success: false, logged: true }
  }

  try {
    const info = await t.sendMail({
      from: process.env.MAIL_FROM || 'noreply@coride.com',
      to,
      subject,
      html,
      text,
    })
    console.log(`📧 Email sent to ${to}: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(`📧 Email failed to ${to}:`, error.message)
    return { success: false, error: error.message }
  }
}

// OTP Email template
export const sendOTPEmail = async (email, otp, type = 'verification') => {
  const titles = {
    verification: 'Verify your email',
    login: 'Login verification code',
    booking_cancel: 'Booking cancellation code',
    trip_start: 'Trip start verification',
    trip_end: 'Trip completion verification',
    trip_cancel: 'Trip cancellation code',
    password_reset: 'Password reset code',
  }

  const title = titles[type] || 'Your verification code'

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Co-Ride</h1>
        <p style="color: white/80; margin: 8px 0 0;">${title}</p>
      </div>
      <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #374151;">Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 16px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6366f1;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #6b7280;">This code expires in 10 minutes. Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: `${title} — ${otp} | Co-Ride`,
    html,
    text: `Your Co-Ride ${title} code is: ${otp}. Valid for 10 minutes.`,
  })
}

// Password reset email
export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Co-Ride</h1>
        <p style="color: white/80; margin: 8px 0 0;">Password Reset Request</p>
      </div>
      <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #374151;">You requested to reset your password.</p>
        <p style="font-size: 14px; color: #6b7280;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #9ca3af;">If you didn't request this, ignore this email. Your password will remain unchanged.</p>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: 'Reset your Co-Ride password',
    html,
    text: `Reset your Co-Ride password: ${resetUrl}`,
  })
}

// Welcome email
export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Co-Ride! 🚗</h1>
      </div>
      <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #374151;">Hi ${name}!</p>
        <p style="font-size: 14px; color: #6b7280;">Your account has been created successfully. Start finding rides or offer trips today.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="http://localhost:3000/trips" style="background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Find Rides</a>
        </div>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: `Welcome to Co-Ride, ${name}!`,
    html,
    text: `Welcome to Co-Ride, ${name}! Find rides at http://localhost:3000/trips`,
  })
}
