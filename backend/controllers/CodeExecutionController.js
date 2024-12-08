// backend/controllers/CodeExecutionController.js
const { VM } = require('vm2');

class CodeExecutionController {
  static executeJavaScript(req, res) {
    const { code } = req.body;
    const vm = new VM({
      timeout: 1000,
      sandbox: {},
    });

    try {
      const result = vm.run(code);
      res.status(200).json({ result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Implement execution for other languages as needed
}

module.exports = CodeExecutionController;
