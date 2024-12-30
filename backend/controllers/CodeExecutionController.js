const CodeExecutionService = require('../services/CodeExecutionService');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

class CodeExecutionController {
  // @desc    Execute JavaScript code
  // @route   POST /api/execute/javascript
  // @access  Private
  executeJavaScript = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
      throw new ErrorResponse('Please provide code to execute', 400);
    }

    const result = await CodeExecutionService.executeJavaScript(code);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  // @desc    Execute Python code
  // @route   POST /api/execute/python
  // @access  Private
  executePython = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
      throw new ErrorResponse('Please provide code to execute', 400);
    }

    const result = await CodeExecutionService.executePython(code);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  // @desc    Execute Java code
  // @route   POST /api/execute/java
  // @access  Private
  executeJava = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
      throw new ErrorResponse('Please provide code to execute', 400);
    }

    const result = await CodeExecutionService.executeJava(code);

    res.status(200).json({
      success: true,
      data: result
    });
  });
}

module.exports = new CodeExecutionController();