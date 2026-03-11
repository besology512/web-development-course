const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

const Flight = require('./models/Flight');
const User = require('./models/User');
const Booking = require('./models/Booking');

// Load env vars
dotenv.config();

// We'll connect using the standard MONGODB_URI, but if running from outside Docker,
// we might need to route to localhost. We will try process.env first, or fallback.
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flight-booking';

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB Connected to seed data'))
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });

const flights = [
  { flightNumber: 'MS101', from: 'Cairo', to: 'Dubai', date: new Date('2026-05-01T10:00:00Z'), totalSeats: 150, availableSeats: 150, price: 300 },
  { flightNumber: 'MS102', from: 'Cairo', to: 'London', date: new Date('2026-05-02T14:30:00Z'), totalSeats: 200, availableSeats: 200, price: 450 },
  { flightNumber: 'EK201', from: 'Dubai', to: 'New York', date: new Date('2026-05-05T08:15:00Z'), totalSeats: 300, availableSeats: 300, price: 800 },
  { flightNumber: 'BA305', from: 'London', to: 'Paris', date: new Date('2026-05-10T09:00:00Z'), totalSeats: 100, availableSeats: 100, price: 150 },
  { flightNumber: 'AF401', from: 'Paris', to: 'Cairo', date: new Date('2026-05-15T22:45:00Z'), totalSeats: 180, availableSeats: 180, price: 350 },
  { flightNumber: 'EK205', from: 'Dubai', to: 'Cairo', date: new Date('2026-05-01T10:00:00Z'), totalSeats: 250, availableSeats: 250, price: 250 },
  { flightNumber: 'MS777', from: 'Cairo', to: 'New York', date: new Date('2026-06-01T06:00:00Z'), totalSeats: 280, availableSeats: 280, price: 700 },
];

const seedData = async () => {
  try {
    // Clear existing data
    await Flight.deleteMany();
    await User.deleteMany();
    await Booking.deleteMany();

    console.log('Old Data Cleared!');

    // Create Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('admin123', salt);
    
    await User.create({
      name: 'Admin User',
      email: 'admin@aerobooking.com',
      password: hashedAdminPassword,
      isVerified: true,
      role: 'admin'
    });

    // Create Normal Test User
    const hashedUserPassword = await bcrypt.hash('password123', salt);
    
    await User.create({
      name: 'Test Student',
      email: 'student@test.com',
      password: hashedUserPassword,
      isVerified: true,
      role: 'user'
    });

    console.log('Users Created! Admin (admin@aerobooking.com / admin123) & Student (student@test.com / password123)');

    // Create Flights
    await Flight.insertMany(flights);
    
    console.log('Flights Seeded!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
