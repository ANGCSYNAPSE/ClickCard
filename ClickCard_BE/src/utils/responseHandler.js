const sendSuccessResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendErrorResponse = (res, statusCode, message, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || undefined,
  });
};

const responseHandler = (res, statusCode, success, data, message) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  responseHandler,
};
