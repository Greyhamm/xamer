const ipcAsyncHandler = fn => async (...args) => {
    try {
      const result = await fn(...args);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('IPC Error:', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode || 500
      };
    }
  };
  
  module.exports = ipcAsyncHandler;