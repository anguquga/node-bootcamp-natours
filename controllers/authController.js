const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const validateToken = async (token) => {
  return await jwt.verify(token, process.env.JWT_SECRET);
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

exports.authorize = catchAsync(async (req, res, next) => {
  //1- Getting token from request
  let { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer'))
    return next(new AppError(`Please login to get access`, 401));
  //Token format Bearer [Token]
  authorization = authorization.split(' ')[1];

  //2- Validate Token
  const decoded = await validateToken(authorization);

  //3- Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      new AppError(
        `The user belonging to this token no longer exists. Please login again.`,
        401
      )
    );
  //4- Check if user changed password after the token was issued
  if (user.chagedPasswordAfterLogin(decoded.iat))
    return next(
      new AppError(`Authentication no longer valid. Please login again!!`, 401)
    );
  req.user = user.toObject();
  next();
});
