const Flight = require('../models/Flight');

// @desc    Get all flights or search flights
// @route   GET /api/flights
exports.getFlights = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    
    let query = {};
    if (from) query.from = { $regex: new RegExp(from, 'i') };
    if (to) query.to = { $regex: new RegExp(to, 'i') };
    if (date) {
      // Find flights on the exact day
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      query.date = {
        $gte: searchDate,
        $lt: nextDate
      };
    }

    const flights = await Flight.find(query);
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single flight
// @route   GET /api/flights/:id
exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a flight
// @route   POST /api/flights
exports.createFlight = async (req, res) => {
  try {
    const flight = await Flight.create(req.body);
    res.status(201).json(flight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a flight
// @route   PUT /api/flights/:id
exports.updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a flight
// @route   DELETE /api/flights/:id
exports.deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json({ message: 'Flight removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
