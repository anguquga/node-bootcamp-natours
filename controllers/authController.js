const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.signup = catchAsync(async (req, res, next) => {
  const data = Object.assign(req.body);
  const newUser = await User.create({ ...data });
  if (!newUser) {
    return next(new AppError(`Error while signinup the user`, 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const data = Object.assign(req.body);
  const newUser = await User.create({ ...data });
  if (!newUser) {
    return next(new AppError(`Error while signinup the user`, 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});
