const ValidationService = require('../services/ValidationService');
const ErrorResponse = require('../utils/errorResponse');

exports.validateExam = (req, res, next) => {
  const errors = ValidationService.validateExam(req.body);
  
  if (errors.length > 0) {
    throw new ErrorResponse(errors.join(', '), 400);
  }
  
  next();
};

exports.validateSubmission = (req, res, next) => {
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    throw new ErrorResponse('Answers must be an array', 400);
  }

  answers.forEach((answer, index) => {
    if (!answer.questionId) {
      throw new ErrorResponse(`Answer at index ${index} missing questionId`, 400);
    }
    if (!answer.answer && answer.answer !== 0) {
      throw new ErrorResponse(`Answer at index ${index} missing answer`, 400);
    }
  });

  next();
};

exports.validateCodeExecution = (req, res, next) => {
  const { code, language } = req.body;

  if (!code) {
    throw new ErrorResponse('Code is required', 400);
  }

  if (language && !['javascript', 'python', 'java'].includes(language)) {
    throw new ErrorResponse('Invalid programming language', 400);
  }

  next();
};

exports.validateMediaUpload = (req, res, next) => {
  if (!req.file) {
    throw new ErrorResponse('Please upload a file', 400);
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    throw new ErrorResponse('Please upload a valid image or video file', 400);
  }

  if (req.file.size > 5 * 1024 * 1024) { // 5MB
    throw new ErrorResponse('File size cannot exceed 5MB', 400);
  }

  next();
};