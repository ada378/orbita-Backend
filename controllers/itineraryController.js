const Itinerary = require('../models/Itinerary');
const Upload = require('../models/Upload');
const { generateItineraryFromText } = require('../utils/aiHelper');
const { v4: uuidv4 } = require('uuid');

exports.createItinerary = async (req, res) => {
  try {
    const { uploadId } = req.body;

    const upload = await Upload.findOne({
      _id: uploadId,
      user: req.user.id
    });

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    if (!upload.extractedText) {
      return res.status(400).json({ message: 'No extracted text found in upload' });
    }

    const aiResult = await generateItineraryFromText(upload.extractedText);
    let itineraryData;

    try {
      itineraryData = typeof aiResult === 'string' ? JSON.parse(aiResult) : aiResult;
    } catch (e) {
      itineraryData = { summary: aiResult, days: [] };
    }

    const shareId = uuidv4().slice(0, 8);

    const itinerary = new Itinerary({
      user: req.user.id,
      upload: upload._id,
      title: itineraryData.title || 'My Trip',
      destination: itineraryData.destination || '',
      startDate: itineraryData.startDate || '',
      endDate: itineraryData.endDate || '',
      summary: itineraryData.summary || '',
      days: itineraryData.days || [],
      shareId
    });

    await itinerary.save();

    res.status(201).json({
      message: 'Itinerary generated successfully',
      itinerary
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate itinerary', error: err.message });
  }
};

exports.getItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user.id })
      .populate('upload', 'originalName')
      .sort({ createdAt: -1 });

    res.json(itineraries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('upload', 'originalName');

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json(itinerary);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json({ message: 'Itinerary deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSharedItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ shareId: req.params.shareId })
      .populate('upload', 'originalName');

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json(itinerary);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
