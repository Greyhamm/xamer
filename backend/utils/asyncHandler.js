const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(err => {
      console.error('Error in async handler:', err);
      next(err);
    });
};

module.exports = asyncHandler;