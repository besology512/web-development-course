const express = require('express');
const { getFlights, getFlightById, createFlight, updateFlight, deleteFlight } = require('../controllers/flightController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getFlights)
  .post(protect, admin, createFlight);

router.route('/:id')
  .get(getFlightById)
  .put(protect, admin, updateFlight)
  .delete(protect, admin, deleteFlight);

module.exports = router;
