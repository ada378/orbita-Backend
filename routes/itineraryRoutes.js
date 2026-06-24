const express = require('express');
const router = express.Router();
const {
  createItinerary,
  getItineraries,
  getItinerary,
  deleteItinerary,
  getSharedItinerary
} = require('../controllers/itineraryController');
const auth = require('../middleware/auth');

router.post('/', auth, createItinerary);
router.get('/', auth, getItineraries);
router.get('/shared/:shareId', getSharedItinerary);
router.get('/:id', auth, getItinerary);
router.delete('/:id', auth, deleteItinerary);

module.exports = router;
