// backend/controllers/CodeExecutionController.js
const { VM } = require('vm2');
const { spawn } = require('child_process');
const fs = require('fs'); // File System module
const path = require('path'); // Path module for handling file paths
const { v4: uuidv4 } = require('uuid'); // UUID module for generating unique identifiers

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

  // Existing Python execution method
  static executePython(req, res) {
    const { code } = req.body;
    console.log('Received Python code for execution:', code);

    try {
      // Spawn a Python process with a timeout of 2 seconds
      const pythonProcess = spawn('python', ['-c', code], { timeout: 2000 });

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

      // Handle timeout
      pythonProcess.on('error', (err) => {
        console.error('Python Execution error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
      });

    } catch (error) {
      console.error('Python Execution error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

   // Enhanced Java execution method supporting multiple classes and initial code
  // Enhanced Java execution method supporting multiple classes and initial code
  static executeJava(req, res) {
    const { initialCode, userCode } = req.body; // Expecting initialCode and userCode
    console.log('Received Java code for execution.');

    // Initialize temporary directory variable
    let tmpDir;

    try {
      // Generate a unique temporary directory for this execution
      tmpDir = path.join(__dirname, '../../temp', uuidv4());

      // Create the temporary directory
      fs.mkdirSync(tmpDir, { recursive: true });

      // Function to extract public class names using regex
      const extractPublicClasses = (code) => {
        const regex = /public\s+class\s+(\w+)/g;
        let match;
        const classNames = [];
        while ((match = regex.exec(code)) !== null) {
          classNames.push(match[1]);
        }
        return classNames;
      };

      // Function to extract all class declarations (public or not)
      const extractAllClasses = (code) => {
        const regex = /class\s+(\w+)/g;
        let match;
        const classNames = [];
        while ((match = regex.exec(code)) !== null) {
          classNames.push(match[1]);
        }
        return classNames;
      };

      // Extract public class names from initialCode and userCode
      const initialPublicClasses = extractPublicClasses(initialCode);
      const userPublicClasses = extractPublicClasses(userCode);

      // Extract all class names to handle non-public classes
      const initialAllClasses = extractAllClasses(initialCode);
      const userAllClasses = extractAllClasses(userCode);

      // Prepare a map to store className -> code
      const classCodeMap = {};

      // Handle Initial Code
      if (initialPublicClasses.length > 0) {
        initialPublicClasses.forEach((className) => {
          const regex = new RegExp(`public\\s+class\\s+${className}[\\s\\S]*?\\}`, 'g');
          const match = initialCode.match(regex);
          if (match) {
            classCodeMap[className] = match[0];
          }
        });
      } else if (initialAllClasses.length > 0) {
        // If no public classes, assume entire code is a non-public class
        initialAllClasses.forEach((className) => {
          const regex = new RegExp(`class\\s+${className}[\\s\\S]*?\\}`, 'g');
          const match = initialCode.match(regex);
          if (match) {
            classCodeMap[className] = match[0];
          }
        });
      } else {
        // If no class declarations, treat entire code as part of a default class
        classCodeMap['InitialCode'] = initialCode;
      }

      // Handle User Code
      if (userPublicClasses.length > 0) {
        userPublicClasses.forEach((className) => {
          const regex = new RegExp(`public\\s+class\\s+${className}[\\s\\S]*?\\}`, 'g');
          const match = userCode.match(regex);
          if (match) {
            classCodeMap[className] = match[0];
          }
        });
      } else if (userAllClasses.length > 0) {
        // If no public classes, assume entire code is a non-public class
        userAllClasses.forEach((className) => {
          const regex = new RegExp(`class\\s+${className}[\\s\\S]*?\\}`, 'g');
          const match = userCode.match(regex);
          if (match) {
            classCodeMap[className] = match[0];
          }
        });
      } else {
        // If no class declarations, treat entire code as part of a default class
        classCodeMap['UserCode'] = userCode;
      }

      // Write each class to its own .java file
      for (const [className, code] of Object.entries(classCodeMap)) {
        const filePath = path.join(tmpDir, `${className}.java`);
        fs.writeFileSync(filePath, code);
      }

      // Read all .java files in the temporary directory
      const allFiles = fs.readdirSync(tmpDir);
      const javaFiles = allFiles.filter(file => file.endsWith('.java'));

      if (javaFiles.length === 0) {
        throw new Error('No Java files found to compile.');
      }

      // Compile all Java files by passing each filename as an argument
      const javacProcess = spawn('javac', javaFiles, { cwd: tmpDir });

      let compileError = '';

      javacProcess.stderr.on('data', (data) => {
        compileError += data.toString();
      });

      javacProcess.on('close', (codeExit) => {
        if (codeExit !== 0) {
          // Compilation error
          console.error('Java Compilation Error:', compileError.trim());
          res.status(400).json({ error: compileError.trim() });

          // Clean up temporary directory
          fs.rmSync(tmpDir, { recursive: true, force: true });
        } else {
          // Determine which class contains the main method
          const classFiles = fs.readdirSync(tmpDir).filter(file => file.endsWith('.java'));
          let executionClassName = null;

          for (const file of classFiles) {
            const filePath = path.join(tmpDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            if (content.includes('public static void main')) {
              executionClassName = path.basename(file, '.java');
              break;
            }
          }

          if (!executionClassName) {
            // No class with main method found
            console.error('No class with main method found for execution.');
            res.status(400).json({ error: 'No class with main method found for execution.' });

            // Clean up temporary directory
            fs.rmSync(tmpDir, { recursive: true, force: true });
            return;
          }

          // Execute the Java program
          const javaProcess = spawn('java', [executionClassName], { cwd: tmpDir });

          let stdout = '';
          let stderr = '';

          javaProcess.stdout.on('data', (data) => {
            stdout += data.toString();
          });

          javaProcess.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          javaProcess.on('close', (codeExec) => {
            // Clean up temporary directory
            fs.rmSync(tmpDir, { recursive: true, force: true });

            if (codeExec === 0) {
              console.log('Java Execution Output:', stdout.trim());
              res.status(200).json({ result: stdout.trim() });
            } else {
              console.error('Java Execution Error:', stderr.trim());
              res.status(400).json({ error: stderr.trim() });
            }
          });
        }
      });

      // Handle compilation process errors
      javacProcess.on('error', (err) => {
        console.error('Java Compilation Process Error:', err.message);
        res.status(500).json({ error: 'Internal Server Error during compilation.' });

        // Clean up temporary directory
        fs.rmSync(tmpDir, { recursive: true, force: true });
      });

    } catch (error) {
      console.error('Java Execution error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });

      // Cleanup if temporary directory was created
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    }
  }
  // Implement execution for other languages as needed
}

module.exports = CodeExecutionController;
