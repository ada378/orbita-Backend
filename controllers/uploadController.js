const Upload = require('../models/Upload');
const path = require('path');
const fs = require('fs');
const { extractTextFromFile } = require('../utils/fileProcessor');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const extractedText = await extractTextFromFile(filePath);

    const upload = new Upload({
      user: req.user.id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText
    });

    await upload.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      upload: {
        id: upload._id,
        originalName: upload.originalName,
        fileType: upload.fileType,
        extractedText: upload.extractedText,
        uploadedAt: upload.uploadedAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

exports.getUploads = async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user.id })
      .sort({ uploadedAt: -1 });

    res.json(uploads);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUpload = async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    res.json(upload);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
