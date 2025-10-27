const asyncHandler = (requestHanler) => {
  return (req, res, next) => {
    Promise.resolve(requestHanler(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

export {asyncHandler}