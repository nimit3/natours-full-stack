const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const { use } = require('../routes/tourRoutes');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  //one way ro loop thorugh objects through keys
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1)Create an erroe if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for updating a password. Please use /updateMyPassword route',
        400
      )
    );
  }

  //2)filter out unwanted fields that are not allowed to be updated/ only name and emaila re allowed at the momment
  const filterBody = filterObj(req.body, 'name', 'email');

  //3)update user document
  const updatedUSer = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUSer,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  console.log(req.xxx);
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet! Please use /signup instead',
  });
};

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

//Do not update password with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
