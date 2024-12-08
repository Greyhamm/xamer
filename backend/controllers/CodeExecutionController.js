// backend/controllers/CodeExecutionController.js
const { VM } = require('vm2');
const { spawn } = require('child_process');

class CodeExecutionController {
  // Existing JavaScript execution method
  static executeJavaScript(req, res) {
    const { code } = req.body;
    console.log('Received JavaScript code for execution:', code);

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

      console.log('JavaScript Execution output:', responsePayload);

      res.status(200).json(responsePayload);
    } catch (error) {
      console.error('JavaScript Execution error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  // New Python execution method
  static executePython(req, res) {
    const { code } = req.body;
    console.log('Received Python code for execution:', code);

    try {
      // Spawn a Python process
      const pythonProcess = spawn('python', ['-c', code]);

      let stdout = '';
      let stderr = '';

      // Capture standard output
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      // Capture standard error
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle process exit
      pythonProcess.on('close', (codeExit) => {
        if (codeExit === 0) {
          res.status(200).json({ result: stdout.trim() });
        } else {
          res.status(400).json({ error: stderr.trim() });
        }
      });

    } catch (error) {
      console.error('Python Execution error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // New Java execution method
  static executeJava(req, res) {
    const { code } = req.body;
    console.log('Received Java code for execution.');

    try {
      // Java requires compiling the code before execution.
      // We'll wrap the user's code inside a class with a main method.

      const wrappedCode = `
      public class UserCode {
          public static void main(String[] args) throws Exception {
              ${code}
          }
      }`;

      const fs = require('fs');
      const path = require('path');
      const tmpDir = path.join(__dirname, '../../temp');
      
      // Ensure the temp directory exists
      if (!fs.existsSync(tmpDir)){
          fs.mkdirSync(tmpDir);
      }

      const filePath = path.join(tmpDir, 'UserCode.java');

      // Write the code to a temporary Java file
      fs.writeFileSync(filePath, wrappedCode);

      // Spawn a Java compiler process
      const javacProcess = spawn('javac', [filePath]);

      let compileError = '';

      javacProcess.stderr.on('data', (data) => {
        compileError += data.toString();
      });

      javacProcess.on('close', (codeExit) => {
        if (codeExit !== 0) {
          // Compilation error
          res.status(400).json({ error: compileError.trim() });
        } else {
          // Compilation successful, execute the program
          const javaProcess = spawn('java', ['-cp', tmpDir, 'UserCode']);

          let stdout = '';
          let stderr = '';

          javaProcess.stdout.on('data', (data) => {
            stdout += data.toString();
          });

          javaProcess.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          javaProcess.on('close', (codeExec) => {
            // Clean up the temporary files
            fs.unlinkSync(filePath);
            fs.unlinkSync(path.join(tmpDir, 'UserCode.class'));

            if (codeExec === 0) {
              res.status(200).json({ result: stdout.trim() });
            } else {
              res.status(400).json({ error: stderr.trim() });
            }
          });
        }
      });

    } catch (error) {
      console.error('Java Execution error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Implement execution for other languages as needed
}

module.exports = CodeExecutionController;
