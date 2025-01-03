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


    getClass = asyncHandler(async (req, res) => {
      console.log('Getting class with ID:', req.params.classId);
      
      const classData = await Class.findById(req.params.classId)
        .select('+students +exams') // Explicitly select these fields
        .lean(); // Use lean() for better performance
  
      if (!classData) {
        throw new ErrorResponse('Class not found', 404);
      }
  
      const teacherId = classData.teacher._id.toString();
      const requestUserId = req.user.userId.toString();
  
      if (teacherId !== requestUserId) {
        throw new ErrorResponse('Not authorized to access this class', 403);
      }
  
      res.status(200).json({
        success: true,
        data: classData
      });
    });
  
    // Get classes
    getClasses = asyncHandler(async (req, res) => {
      const classes = await Class.find({ teacher: req.user.userId })
        .select('+students +exams')
        .lean();
  
      res.status(200).json({
        success: true,
        count: classes.length,
        data: classes
      });
    });


  // Update addStudentToClass to track when student was added
  addStudentToClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { studentId } = req.body;
    
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      throw new ErrorResponse('Class not found', 404);
    }

    if (classDoc.teacher.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized', 403);
    }

    // Add student with timestamp
    if (!classDoc.students.includes(studentId)) {
      classDoc.students.push(studentId);
      await classDoc.save();
    }

    // Return populated class data
    const populatedClass = await Class.findById(classId)
      .populate('exams')
      .populate('students', 'username email createdAt')
      .populate('teacher', 'username');

    res.status(200).json({
      success: true,
      data: populatedClass
    });
  });
}


module.exports = new ClassController();