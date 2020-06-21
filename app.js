const express = require('express');
const morgan = require('morgan'); //middleware for makinfg life easier for log in

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//////////////////////////////////////////MIDDLEWARE/////////////////////////////////
//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  // morgan will give us like example ==== GET /api/v1/tours 200 3.154 ms - 9073
  app.use(morgan('dev'));
}
app.use(express.json());

//we can even serve static files using build in express middleware ex === serving html file or any images. we only need to apss the directory name and all those files in htat directroy will be accessed
app.use(express.static(`${__dirname}/public`)); //(http://localhost:3000/overview.html  that link will open up that file)

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

////////////////////////////////////////////ROUTING///////////////////////////////////////
//touRouter will work as a middleware
app.use('/api/v1/tours', tourRouter);
//for user router
app.use('/api/v1/users', userRouter);

//app.all() means it will run for all http methods. get, post, put etc. middleware which will check for incorrect url
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  //whenever we passs anything into next() function then it will assume that it is an error, and it will skip all other middleware fn and pass to to global error middleware function
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//global error handling
//by writing 4 functions express will know that this function if for only handling errors.  SO EXPRESS WILL CALL YHIS FN ONLY WHEN THERE WILL BE ERROR
app.use(globalErrorHandler);

/////////////////////////////////////////LISTENING SERVER///////////////////////////////

module.exports = app;
