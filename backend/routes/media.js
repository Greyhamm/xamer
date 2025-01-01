const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  }
});

// Update the upload route
router.post('/upload', protect, upload.single('media'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Please upload a file'
    });
  }

  // Create the media response object
  const media = {
    name: req.file.originalname,
    type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
    url: `/uploads/${req.file.filename}`
  };

  res.status(200).json({
    success: true,
    data: media
  });
}));

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  next();
});

module.exports = router;