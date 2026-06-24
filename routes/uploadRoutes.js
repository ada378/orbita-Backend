const express = require('express');
const router = express.Router();
const { uploadFile, getUploads, getUpload } = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('file'), uploadFile);
router.get('/', auth, getUploads);
router.get('/:id', auth, getUpload);

module.exports = router;
