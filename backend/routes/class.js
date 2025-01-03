const express = require('express');
const router = express.Router();
const ClassController = require('../controllers/ClassController');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const Class = require('../models/Class');
const ErrorResponse = require('../utils/errorResponse');

router
  .route('/classes')
  .get(protect, authorize('teacher'), ClassController.getClasses)
  .post(protect, authorize('teacher'), ClassController.createClass);

// Add route for getting a single class
router.get(
  '/classes/:classId',
  protect,
  authorize('teacher'),
  ClassController.getClass
);

router.post(
  '/classes/:classId/exams/:examId',
  protect,
  authorize('teacher'),
  ClassController.addExamToClass
);


router.post(
  '/classes/:classId/students',
  protect,
  authorize('teacher'),
  asyncHandler(async (req, res) => {
      const { classId } = req.params;
      const { studentId } = req.body;

      console.log('Adding student to class:', {
          classId,
          studentId,
          teacherId: req.user.userId
      });

      if (!studentId) {
          throw new ErrorResponse('Student ID is required', 400);
      }

      // Get class and verify ownership
      const classDoc = await Class.findById(classId)
          .populate('teacher');

      if (!classDoc) {
          throw new ErrorResponse('Class not found', 404);
      }

      const teacherId = classDoc.teacher._id.toString();
      if (teacherId !== req.user.userId) {
          throw new ErrorResponse('Not authorized to modify this class', 403);
      }

      // Verify student exists and is not already enrolled
      const student = await User.findOne({
          _id: studentId,
          role: 'student'
      });

      if (!student) {
          throw new ErrorResponse('Student not found', 404);
      }

      if (classDoc.students.includes(studentId)) {
          throw new ErrorResponse('Student already enrolled in this class', 400);
      }

      // Add student to class
      classDoc.students.push(studentId);
      await classDoc.save();

      res.status(200).json({
          success: true,
          data: classDoc
      });
  })
);

// Add this route to the existing router
// Update in backend/routes/class.js

// Update in backend/routes/class.js

router.get(
    '/classes/:classId/search-students',
    protect,
    authorize('teacher'),
    asyncHandler(async (req, res) => {
        const { query } = req.query;
        const { classId } = req.params;

        console.log('Search request:', {
            classId,
            teacherId: req.user.userId,
            query
        });

        // Get current class
        const currentClass = await Class.findById(classId)
            .populate('teacher');

        if (!currentClass) {
            throw new ErrorResponse('Class not found', 404);
        }

        // Compare string versions of ObjectIds
        const teacherId = currentClass.teacher._id.toString();
        const requestingUserId = req.user.userId.toString();

        console.log('Authorization check:', {
            teacherId,
            requestingUserId,
            isMatch: teacherId === requestingUserId
        });

        if (teacherId !== requestingUserId) {
            throw new ErrorResponse('Not authorized to access this class', 403);
        }

        // Proceed with student search
        const searchQuery = {
            role: 'student',
            _id: { $nin: currentClass.students }
        };

        if (query && query.length >= 2) {
            searchQuery.$or = [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ];
        }

        const students = await User.find(searchQuery)
            .select('username email')
            .limit(10);

        res.status(200).json({
            success: true,
            data: students
        });
    })
);


// Updated backend/routes/class.js
router.delete(
  '/classes/:classId/students/:studentId',
  protect,
  authorize('teacher'),
  asyncHandler(async (req, res) => {
      const { classId, studentId } = req.params;
      console.log('Removing student from class:', { classId, studentId });

      // Find the class and populate it
      const classDoc = await Class.findById(classId)
          .populate('teacher')
          .populate('students')
          .populate('exams');

      if (!classDoc) {
          throw new ErrorResponse('Class not found', 404);
      }

      // Verify teacher owns the class
      const teacherId = classDoc.teacher._id.toString();
      if (teacherId !== req.user.userId) {
          throw new ErrorResponse('Not authorized to modify this class', 403);
      }

      // Remove student from the students array
      const studentIndex = classDoc.students.findIndex(
          student => student._id.toString() === studentId
      );

      if (studentIndex === -1) {
          throw new ErrorResponse('Student not found in class', 404);
      }

      // Remove the student
      classDoc.students.splice(studentIndex, 1);
      
      // Save the updated class
      await classDoc.save();

      // Fetch the updated class with populated fields
      const updatedClass = await Class.findById(classId)
          .populate('teacher')
          .populate('students')
          .populate('exams');

      console.log('Student removed successfully:', {
          classId,
          studentId,
          remainingStudents: updatedClass.students.length
      });

      res.status(200).json({
          success: true,
          data: updatedClass
      });
  })
);

module.exports = router;