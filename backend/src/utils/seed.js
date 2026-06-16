import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { User, Trip, Booking } from '../models/index.js'

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/co-ride')
    console.log('MongoDB Connected for seeding...')
    await seedDatabase()
    process.exit(0)
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message)
    process.exit(1)
  }
}

const seedDatabase = async () => {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await User.deleteMany({})
  await Trip.deleteMany({})
  await Booking.deleteMany({})

  // Create pre-hashed password (avoid pre-save hook issues)
  const passwordHash = await bcrypt.hash('password123', 12)

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@coride.com',
    password: passwordHash,
    role: 'ADMIN',
    isStudent: false,
    isVerified: true,
    walletBalance: 10000,
    rating: 5.0,
  })

  const driver1 = await User.create({
    name: 'Amit Singh',
    email: 'amit@coride.com',
    password: passwordHash,
    role: 'DRIVER',
    isStudent: true,
    collegeEmail: 'amit@iitdelhi.edu',
    isVerified: true,
    walletBalance: 5000,
    rating: 4.8,
    totalRatings: 25,
    totalRides: 150,
  })

  const driver2 = await User.create({
    name: 'Priya Sharma',
    email: 'priya@coride.com',
    password: passwordHash,
    role: 'DRIVER',
    isStudent: true,
    collegeEmail: 'priya@iitbombay.edu',
    isVerified: true,
    walletBalance: 3500,
    rating: 4.9,
    totalRatings: 42,
    totalRides: 230,
  })

  const user1 = await User.create({
    name: 'Rahul Verma',
    email: 'rahul@coride.com',
    password: passwordHash,
    role: 'USER',
    isStudent: true,
    collegeEmail: 'rahul@iitdelhi.edu',
    isVerified: true,
    walletBalance: 2000,
    rating: 5.0,
  })

  const user2 = await User.create({
    name: 'Sneha Patel',
    email: 'sneha@coride.com',
    password: passwordHash,
    role: 'USER',
    isStudent: true,
    collegeEmail: 'sneha@iitbombay.edu',
    isVerified: true,
    walletBalance: 1500,
    rating: 5.0,
  })

  // Create trips
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000)

  const trips = await Trip.insertMany([
    {
      driver: driver1._id,
      from: 'IIT Delhi, Hauz Khas',
      to: 'Connaught Place, Central Delhi',
      fromCoords: { lat: 28.5456, lng: 77.1926 },
      toCoords: { lat: 28.6315, lng: 77.2167 },
      departureTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
      pricePerSeat: 150,
      totalSeats: 3,
      availableSeats: 3,
      vehicleType: 'CAR',
      vehicleName: 'Honda City',
      vehicleNumber: 'DL 01 AB 1234',
      status: 'ACTIVE',
      notes: 'AC car, comfortable ride. Pickup from main gate.',
    },
    {
      driver: driver1._id,
      from: 'IIT Delhi, Hauz Khas',
      to: 'Nehru Place',
      fromCoords: { lat: 28.5456, lng: 77.1926 },
      toCoords: { lat: 28.5508, lng: 77.2523 },
      departureTime: new Date(dayAfter.setHours(17, 30, 0, 0)),
      pricePerSeat: 100,
      totalSeats: 3,
      availableSeats: 2,
      vehicleType: 'CAR',
      vehicleName: 'Honda City',
      vehicleNumber: 'DL 01 AB 1234',
      status: 'ACTIVE',
    },
    {
      driver: driver2._id,
      from: 'IIT Bombay, Powai',
      to: 'Dadar Station',
      fromCoords: { lat: 19.1334, lng: 72.9134 },
      toCoords: { lat: 19.0176, lng: 72.8422 },
      departureTime: new Date(tomorrow.setHours(7, 30, 0, 0)),
      pricePerSeat: 80,
      totalSeats: 4,
      availableSeats: 4,
      vehicleType: 'AUTO',
      vehicleName: 'Auto Rickshaw',
      vehicleNumber: 'MH 02 AB 5678',
      status: 'ACTIVE',
      notes: 'Affordable option for students',
    },
    {
      driver: driver2._id,
      from: 'IIT Bombay, Powai',
      to: 'Bandra Terminus',
      fromCoords: { lat: 19.1334, lng: 72.9134 },
      toCoords: { lat: 19.0589, lng: 72.8400 },
      departureTime: new Date(dayAfter.setHours(15, 0, 0, 0)),
      pricePerSeat: 120,
      totalSeats: 3,
      availableSeats: 3,
      vehicleType: 'BIKE',
      vehicleName: 'Honda Activa',
      vehicleNumber: 'MH 02 CD 9012',
      status: 'ACTIVE',
    },
  ])

  // Create some bookings
  await Booking.create({
    trip: trips[0]._id,
    user: user1._id,
    seatsBooked: 1,
    basePrice: 150,
    discount: 45,
    totalPrice: 105,
    status: 'CONFIRMED',
    pickupPoint: 'Main Gate, IIT Delhi',
    dropPoint: 'Exit 1, Connaught Place Metro',
  })

  await Booking.create({
    trip: trips[1]._id,
    user: user2._id,
    seatsBooked: 2,
    basePrice: 200,
    discount: 60,
    totalPrice: 140,
    status: 'CONFIRMED',
    pickupPoint: 'IIT Delhi Hostel',
    dropPoint: 'Nehru Place Metro',
  })

  console.log('✅ Database seeded successfully!')
  console.log('')
  console.log('📧 Test Credentials:')
  console.log('─────────────────────────────────────────────')
  console.log('Admin:    admin@coride.com / password123')
  console.log('Driver 1: amit@coride.com / password123')
  console.log('Driver 2: priya@coride.com / password123')
  console.log('User 1:   rahul@coride.com / password123')
  console.log('User 2:   sneha@coride.com / password123')
  console.log('─────────────────────────────────────────────')
  console.log('')
  console.log('🎉 Demo data created:')
  console.log(`   • ${5} users (1 admin, 2 drivers, 2 users)`)
  console.log(`   • ${trips.length} trips`)
  console.log(`   • 2 bookings`)
}

connectDB()