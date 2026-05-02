const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

// @desc    Create new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { flightId, numberOfSeats } = req.body;

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    if (flight.availableSeats < numberOfSeats) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const totalPrice = flight.price * numberOfSeats;

    const booking = await Booking.create({
      user: req.user._id,
      flight: flightId,
      numberOfSeats,
      totalPrice,
    });

    // Reduce available seats
    flight.availableSeats -= numberOfSeats;
    await flight.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('flight');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('user', 'name email').populate('flight');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // If status changes to canceled, restore seats
    if (status === 'canceled' && booking.status !== 'canceled') {
      const flight = await Flight.findById(booking.flight);
      if (flight) {
        flight.availableSeats += booking.numberOfSeats;
        await flight.save();
      }
    } else if (status === 'confirmed' && booking.status === 'canceled') {
       // If changing back from canceled to confirmed
       const flight = await Flight.findById(booking.flight);
       if (flight) {
         if (flight.availableSeats < booking.numberOfSeats) {
             return res.status(400).json({ message: 'Not enough seats to re-confirm booking' });
         }
         flight.availableSeats -= booking.numberOfSeats;
         await flight.save();
       }
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
