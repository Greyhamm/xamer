// backend/controllers/CodeExecutionController.js
const { VM } = require('vm2');
const { spawn } = require('child_process');
const fs = require('fs'); // File System module
const path = require('path'); // Path module for handling file paths
const { v4: uuidv4 } = require('uuid'); // UUID module for generating unique identifiers

class CodeExecutionController {
  // Existing JavaScript execution method remains unchanged
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

  // Existing Python execution method remains unchanged
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

      // Handle timeout and other errors
      pythonProcess.on('error', (err) => {
        console.error('Python Execution error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
      });

    } catch (error) {
      console.error('Python Execution error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Updated Java execution method to handle multiple classes
  static executeJava(req, res) {
    const { code } = req.body; // Expecting a single 'code' field
    console.log('Received Java code for execution.');

    // Initialize temporary directory variable
    let tmpDir;

    try {
      // Validate that code is provided
      if (!code || !code.trim()) {
        throw new Error('No Java code provided for execution.');
      }

      // Generate a unique temporary directory for this execution
      tmpDir = path.join(__dirname, '../../temp', uuidv4());

      // Create the temporary directory
      fs.mkdirSync(tmpDir, { recursive: true });

      // Split the code into individual class blocks
      const classBlocks = splitClasses(code);

      if (classBlocks.length === 0) {
        throw new Error('No class declarations found in the Java code.');
      }

      // Validate that there is at least one class with a main method
      const classesWithMain = classBlocks.filter(block => block.includes('public static void main'));
      if (classesWithMain.length === 0) {
        throw new Error('No class with main method found for execution.');
      }

      // Enforce only one public class per file as per Java rules
      classBlocks.forEach(block => {
        const publicClassCount = (block.match(/public\s+class\s+\w+/g) || []).length;
        if (publicClassCount > 1) {
          throw new Error('A class cannot have more than one public class declaration.');
        }
      });

      // Write each class to its own .java file
      classBlocks.forEach(block => {
        const classNameMatch = block.match(/public\s+class\s+(\w+)/) || block.match(/class\s+(\w+)/);
        if (!classNameMatch) {
          throw new Error('Unable to determine class name from the code block.');
        }
        const className = classNameMatch[1];
        const filePath = path.join(tmpDir, `${className}.java`);
        fs.writeFileSync(filePath, block);
      });

      // Read all .java files in the temporary directory
      const allFiles = fs.readdirSync(tmpDir);
      const javaFiles = allFiles.filter(file => file.endsWith('.java'));

      if (javaFiles.length === 0) {
        throw new Error('No Java files found to compile.');
      }

      // Compile all Java files
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
      res.status(500).json({ error: error.message });

      // Cleanup if temporary directory was created
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    }
  }

  // Implement execution for other languages as needed
}

// Helper function to split Java code into individual class blocks
function splitClasses(code) {
  const classes = [];
  const classRegex = /(?:public\s+)?class\s+\w+/g;
  let match;
  let lastIndex = 0;

  const regexMatches = [];
  while ((match = classRegex.exec(code)) !== null) {
    regexMatches.push({ index: match.index, name: match[0] });
  }

  for (let i = 0; i < regexMatches.length; i++) {
    const currentMatch = regexMatches[i];
    const nextMatch = regexMatches[i + 1];

    const classStart = currentMatch.index;
    let classEnd;

    if (nextMatch) {
      classEnd = nextMatch.index;
    } else {
      classEnd = code.length;
    }

    const classCode = code.substring(classStart, classEnd).trim();

    // Ensure braces are balanced
    if (isBracesBalanced(classCode)) {
      classes.push(classCode);
    } else {
      console.warn(`Unbalanced braces detected in class starting at index ${classStart}. Attempting to fix.`);
      const fixedClassCode = fixUnbalancedBraces(code, classStart, classEnd);
      if (fixedClassCode) {
        classes.push(fixedClassCode);
      } else {
        console.error('Unable to fix unbalanced braces.');
      }
    }
  }

  return classes;
}

// Helper function to check if braces are balanced
function isBracesBalanced(code) {
  let stack = [];
  for (let char of code) {
    if (char === '{') {
      stack.push(char);
    } else if (char === '}') {
      if (stack.length === 0) {
        return false;
      }
      stack.pop();
    }
  }
  return stack.length === 0;
}

// Helper function to fix unbalanced braces by adding missing closing braces
function fixUnbalancedBraces(code, start, end) {
  const classCode = code.substring(start, end).trim();
  let stack = [];
  let fixedCode = classCode;

  for (let char of classCode) {
    if (char === '{') {
      stack.push(char);
    } else if (char === '}') {
      if (stack.length > 0) {
        stack.pop();
      } else {
        // Extra closing brace found, remove it
        fixedCode = fixedCode.replace('}', '');
      }
    }
  }

  // Add missing closing braces
  while (stack.length > 0) {
    fixedCode += '}';
    stack.pop();
  }

  // Re-validate
  if (isBracesBalanced(fixedCode)) {
    return fixedCode;
  } else {
    return null;
  }
}

module.exports = CodeExecutionController;
