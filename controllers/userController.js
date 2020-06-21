const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (tmpObj, allowedFields) => {
  const newObj = {};
  Object.keys(tmpObj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = tmpObj[el];
    }
  });
  return newObj;
};

//---------------------BEGIN Current User Methods -----------------
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        `Password information is not allowed in this route. Please use /users/updatePassword`,
        400
      )
    );

  const allowedAttrs = ['name', 'photo'];
  const newObj = filterObj(req.body, allowedAttrs);
  const userTmp = await User.findByIdAndUpdate(
    { _id: req.user._id },
    { ...newObj },
    {
      new: true,
      runValidators: true
    }
  );

  const usrObj = userTmp.createObject();
  res.status(201).json({
    status: 'success',
    data: {
      user: usrObj
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate({ _id: req.user._id }, { active: false });
  res.status(204).json({
    status: 'success'
  });
});
//---------------------END Current User Methods -----------------

exports.updateUser = catchAsync(async (req, res, next) => {});

exports.deleteUser = (req, res) => {};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  console.log('Get ALl users');
});

exports.createUser = (req, res) => {};

exports.getUserById = (req, res) => {
  console.log('Get user by id');
};
