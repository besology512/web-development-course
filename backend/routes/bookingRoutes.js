const express = require('express');
const { createBooking, getMyBookings, updateBookingStatus, getAllBookings } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createBooking)
  .get(protect, admin, getAllBookings);

router.route('/mybookings')
  .get(protect, getMyBookings);

router.route('/:id/status')
  .put(protect, admin, updateBookingStatus);

module.exports = router;
