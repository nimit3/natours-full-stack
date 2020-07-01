const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) get All Tour data from the collection
  const tours = await Tour.find();

  // 2) BUild template of tour data

  // 3) render that template using tour data from 1 step
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) Get that data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    flields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name!', 404));
  }
  //2) Build template

  // 3) Render template

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
