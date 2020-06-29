const path = require('path');
const express = require('express');
const morgan = require('morgan'); //middleware
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

//setting up pug template for rendering html
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//we can even serve static files using build in express middleware ex === serving html file or any images. we only need to apss the directory name and all those files in htat directroy will be accessed
app.use(express.static(path.join(__dirname, 'public'))); //(http://localhost:3000/overview.html  that link will open up that file)

//////////////////////////////////////////MIDDLEWARE/////////////////////////////////
//secrutity http middleware
//setting up http headers using helmet npm package
app.use(helmet());

/////////////////////GLOBAL MIDDLEWARE/////////////////////
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //it will allow only 100 request for same IP address in 1 hour
  message: 'Too many request from this IP, Please try again in one hour',
});

//limiter functionality will apply to all routes which start from /api
app.use('/api', limiter);

// Development logging middleware
//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  // morgan will give us like example ==== GET /api/v1/tours 200 3.154 ms - 9073
  app.use(morgan('dev'));
}

//Body parser, reading data from body into req.body
//when req.body data will be larger than 10kb, it will reject the request
app.use(express.json({ limit: '10kb' }));

//Data sanitization agaoisnt NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization agisnt XSS
app.use(xss());

//prevent parameters pollution. ex. /query?sort=duration&sort=price. it will remove duplicate fileds
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

////////////////////////////////////////////ROUTING///////////////////////////////////////
//////////////////////////////PUG html routes
app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Nimit',
  });
});

//tourRouter will work as a middleware
app.use('/api/v1/tours', tourRouter);
//for user router
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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
