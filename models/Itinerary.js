const mongoose = require('mongoose');

const dayPlanSchema = new mongoose.Schema({
  day: { type: Number },
  date: { type: String },
  activities: [{ type: String }],
  meals: [{ type: String }],
  accommodation: { type: String }
});

const itinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upload: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload'
  },
  title: {
    type: String,
    default: 'My Trip'
  },
  destination: {
    type: String,
    default: ''
  },
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  days: [dayPlanSchema],
  shareId: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
