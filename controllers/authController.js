const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const { use } = require('../routes/tourRoutes');

//creating a token function
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  //sending cookies for token
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  //remove the password in output sent data when user profile got created
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  //creating jwt
  const token = signToken(newUser._id);

  createSendToken(newUser, 201, res);
});

//issuing jwt to the users when the log in
exports.login = catchAsync(async (req, res, next) => {
  //const email = req.body.email; //similar to below line of code. destrcturing
  const { email, password } = req.body;

  //1) check if email and password exist(provided by user)
  if (!email || !password) {
    return next(new AppError('Please provide valid email and password!', 400));
  }

  // 2) check if user exist && password is correct
  // so we will use explicitly select over there for password fieled so it can be seen here. by default we have disabled in user model schema
  const user = await User.findOne({ email: email }).select('+password');
  //const correct = await user.correctPassword(password, user.password);
  //('1323242') === $2a$vgvhg
  //correctpassword is a instance method that we define in user model
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) is everything is ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

//middleware fn for protecting getalltours function
exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    // Bearer jkevbjrekvnekrvn we want second part which is actual token so split and take first index of array
    //console.log(token);
  }
  //console.log(token);
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access', 401));
  }

  // 2) verify token (using jwt algorithm verification)
  //promisfy function is used when some function returns promise
  //jwt.verify function we can match that token is same or not
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3) check if user exist(ex user's profile got deleted and someone tries to use his old token that hasn't expired yet)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user does no longer exist whom this token was allocated', 401));
  }

  // 4) check if user change password after the jwt token was issued
  //calling instance methods in model
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('user recently changed password! Please log in once again', 401));
  }
  //grand access to rpotecet route(getAllTours route)
  req.user = currentUser;
  next();
});

//restriction deleting tours on based of a role
exports.restrictTo = (...roles) => {
  //console.log(roles); //those values will come from middleware fn in which we have passed admisn and lead-tour explictly
  return (req, res, next) => {
    //roles is an array ==== ['admin', 'lead-guide'] role='user'
    //if role that passed in args is neither of 'admin' or 'lead-guide' then they don't have permission to delete tour
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have a permission to perform this specific permission!', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user for provided email address', 404));
  }

  //2)generate random reset token
  const resetToken = user.createPasswordResetToken();
  //save the resetToken into passwordResetToken field in DB
  await user.save({ validateBeforeSave: false }); //we must use this validateBeforeSave here

  //3)send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \n If you didn't forget your password, please then ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: `Your password reset token (valid for 10 minutes only)`,
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to the email!',
    });
  } catch (err) {
    //reset both token adn expir property
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get use based token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  //get the use from DB and comapre the date expiry
  const user = await User.findOne({
    passwordresetToken: hashedToken,
    passwordresetExpires: { $gt: Date.now() },
  });
  //2) If token hasn't expired and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordresetToken = undefined;
  user.passwordresetExpires = undefined;
  await user.save();
  //3) Update changedPassword property in DB for user
  //4) Log the user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  //2) Check if posted current passsword is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong!', 401));
  }

  //3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4) Log user in, send JWT
  const token = signToken(user._id);
  createSendToken(token, 200, res);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});
