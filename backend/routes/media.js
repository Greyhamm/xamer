const express = require('express');
const router = express.Router();
const multer = require('multer');
const MediaService = require('../services/MediaService');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

router.post(
  '/upload',
  protect,
  upload.single('media'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file'
      });
    }

    const media = await MediaService.saveFile(req.file);

    res.status(200).json({
      success: true,
      data: media
    });
  })
);

module.exports = router;