const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  console.log('Get ALl users');
});

exports.createUser = (req, res) => {};

exports.getUserById = (req, res) => {
  console.log('Get user by id');
};

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    { _id: req.params.id },
    { ...req.body },
    {
      new: true,
      runValidators: true
    }
  );
  if (!user) {
    return next(new AppError(`No user found with ID: ${req.params.id}`, 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      user: user
    }
  });
});

exports.deleteUser = (req, res) => {};
