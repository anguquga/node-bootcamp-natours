const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const validateToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  if (!newUser) {
    return next(new AppError(`Error while signinup the user`, 404));
  }
  const token = generateToken(newUser._id);
  const usrObj = newUser.toObject();
  delete usrObj.password;
  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: usrObj
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1- CHeck Email and Password
  if (!email || !password) {
    return next(new AppError(`Please provide email and password`, 400));
  }

  //2- Find user by email and check password
  const user = await User.findOne({ email: email });

  if (!user || !(await user.validatePassword(password, user.password))) {
    return next(new AppError(`Incorrect email or password`, 401));
  }
  const token = generateToken(user._id);
  res.status(201).json({
    status: 'success',
    data: {
      token: token
    }
  });
});
