const ipcAsyncHandler = fn => async (...args) => {
  try {
      // Ensure args are properly serializable
      const sanitizedArgs = args.map(arg => {
          if (arg instanceof Error) {
              return { message: arg.message, stack: arg.stack };
          }
          return arg;
      });

      const result = await fn(...sanitizedArgs);
      
      // Ensure the result is serializable
      const sanitizedResult = JSON.parse(JSON.stringify(result));
      
      return {
          success: true,
          data: sanitizedResult
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