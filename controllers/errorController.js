const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

const handleCastErrorDB = (error) => {
  return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
};

const handleDuplicateFieldsDB = (error) => {
  return new AppError(
    `Duplicate key value: ${
      error.keyValue[Object.keys(error.keyValue)[0]]
    } in field: ${Object.keys(error.keyPattern)[0]}. Please use another value`,
    400
  );
};

const handleValidationErrorDB = (error) => {
  const valErrors = Object.values(error.errors).map((el) => {
    return el.properties.message;
  });
  return new AppError(valErrors.join('. '), 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
