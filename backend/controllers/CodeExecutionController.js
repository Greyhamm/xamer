// backend/controllers/CodeExecutionController.js
const { VM } = require('vm2');

class CodeExecutionController {
  static executeJavaScript(req, res) {
    const { code } = req.body;
    console.log('Received code for execution:', code);

    let logs = [];

    const vm = new VM({
      timeout: 1000,
      sandbox: {
        console: {
          log: (...args) => {
            const log = args.join(' ');
            console.log(`console.log: ${log}`);
            logs.push(log);
          }
        }
      }
    });

    try {
      const result = vm.run(code);
      
      // Prepare the response with separate logs and result
      let responsePayload = {};

      if (logs.length > 0) {
        responsePayload.logs = logs;
      }

      if (result !== undefined) {
        responsePayload.result = String(result);
      }

      // For scenarios where there's only logs or only result
      if (logs.length > 0 && result === undefined) {
        responsePayload.result = '';
      }

      console.log('Execution output:', responsePayload);

      res.status(200).json(responsePayload);
    } catch (error) {
      console.error('Execution error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  // Implement execution for other languages as needed
}

module.exports = CodeExecutionController;
