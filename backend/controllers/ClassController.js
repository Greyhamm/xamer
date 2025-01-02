const Class = require('../models/Class');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

class ClassController {
  // Create new class
  createClass = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    
    const classData = await Class.create({
      name,
      description,
      teacher: req.user.userId
    });

    res.status(201).json({
      success: true,
      data: classData
    });
  });

  // Get all classes for a teacher
  getClasses = asyncHandler(async (req, res) => {
    const classes = await Class.find({ teacher: req.user.userId })
      .populate('exams')
      .populate('students', 'username email');

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  });

  // Add exam to class
  addExamToClass = asyncHandler(async (req, res) => {
    const { classId, examId } = req.params;
    
    const classData = await Class.findById(classId);
    if (!classData) {
      throw new ErrorResponse('Class not found', 404);
    }

    if (classData.teacher.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized', 403);
    }

    if (!classData.exams.includes(examId)) {
      classData.exams.push(examId);
      await classData.save();
    }

    res.status(200).json({
      success: true,
      data: classData
    });
  });

  // Add student to class
  addStudentToClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { studentId } = req.body;
    
    const classData = await Class.findById(classId);
    if (!classData) {
      throw new ErrorResponse('Class not found', 404);
    }

    if (classData.teacher.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized', 403);
    }

    if (!classData.students.includes(studentId)) {
      classData.students.push(studentId);
      await classData.save();
    }

    res.status(200).json({
      success: true,
      data: classData
    });
  });
}

module.exports = new ClassController();
