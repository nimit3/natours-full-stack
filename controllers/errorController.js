const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} ${err.value}!`;
  return new AppError(message, 400);
};

// const handleDuplicateFieldDB = err => {
//     const value = err.message.match(/(["'])(?:\\.|[^\\])*?\1/);
//     const message = `Duplicate field value: x. Please use another value!`
//     return new AppError(message, 400)
// }

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data! ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token, Please log in again!', 401);

const handleJWTExpireError = () =>
  new AppError('Your token has expired. Please log in once again!', 401);

const sendErrorDev = (err, req, res) => {
  ///////////////////API    A)
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }
  // RENDER WEBSITE      B)
  console.log('Error', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //A) for API
  if (req.originalUrl.startsWith('/api')) {
    //Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      //programming or other unknown error: don't leak the details with client
    }
    //1) LOG THE ERROR
    console.error('Error!!!', err);
    //2) SEND GENERIC ERROR
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong!',
    });
  }

  // A) THIS IS FOR RENDERED WEBISTE ON LIVE
  //Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B) programming or other unknown error: don't leak the details with client
  //1) LOG THE ERROR
  console.error('Error!!!', err);
  //2) SEND GENERIC ERROR
  return res.status(500).json({
    status: 'error',
    message: 'Please try again later!',
  });
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = {
      ...err,
    };
    error.message = err.message;
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    // if (error.code === 11000) error = handleDuplicateFieldDB(error)
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpireError();

    sendErrorProd(error, req, res);
  }
};
