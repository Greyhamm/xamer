const { VM } = require('vm2');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class CodeExecutionService {
  static async executeJavaScript(code) {
    const vm = new VM({
      timeout: 1000,
      sandbox: {
        console: {
          log: (...args) => logs.push(args.join(' '))
        }
      }
    });

    const logs = [];
    try {
      const result = vm.run(code);
      return {
        logs,
        result: result !== undefined ? String(result) : undefined
      };
    } catch (error) {
      throw new Error(`Execution error: ${error.message}`);
    }
  }

  static async executePython(code) {
    try {
      const pythonProcess = spawn('python', ['-c', code], { timeout: 2000 });
      return this._handleProcessExecution(pythonProcess);
    } catch (error) {
      throw new Error(`Python execution error: ${error.message}`);
    }
  }

  static async executeJava(code) {
    const tmpDir = path.join(__dirname, '../../temp', uuidv4());
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      const mainClass = await this._prepareJavaFiles(code, tmpDir);
      const result = await this._compileAndRunJava(mainClass, tmpDir);
      await fs.rm(tmpDir, { recursive: true, force: true });
      return result;
    } catch (error) {
      await fs.rm(tmpDir, { recursive: true, force: true });
      throw new Error(`Java execution error: ${error.message}`);
    }
  }

  static async _handleProcessExecution(process) {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => stdout += data.toString());
      process.stderr.on('data', (data) => stderr += data.toString());

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ result: stdout.trim() });
        } else {
          reject(new Error(stderr.trim()));
        }
      });

      process.on('error', (err) => reject(err));
    });
  }

  static async _prepareJavaFiles(code, tmpDir) {
    const mainClassMatch = code.match(/public\s+class\s+(\w+)/);
    if (!mainClassMatch) {
      throw new Error('No public class found');
    }

    const mainClassName = mainClassMatch[1];
    await fs.writeFile(path.join(tmpDir, `${mainClassName}.java`), code);
    return mainClassName;
  }

  static async _compileAndRunJava(mainClass, tmpDir) {
    const javacProcess = spawn('javac', [`${mainClass}.java`], { cwd: tmpDir });
    await this._handleProcessExecution(javacProcess);

    const javaProcess = spawn('java', [mainClass], { cwd: tmpDir });
    return this._handleProcessExecution(javaProcess);
  }
}

module.exports = CodeExecutionService;