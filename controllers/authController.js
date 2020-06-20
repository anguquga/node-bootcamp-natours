const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const hashUtils = require('../utils/hashUtils');

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
  const token = hashUtils.generateJWTToken(newUser._id);
  const usrObj = newUser.toObject();
  delete usrObj.password;
  delete usrObj.passwordChangedAt;
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
  const token = hashUtils.generateJWTToken(user._id);
  res.status(201).json({
    status: 'success',
    token: token
  });
});

exports.authorize = (...roles) => {
  return catchAsync(async (req, res, next) => {
    //1- Getting token from request
    let { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer'))
      return next(new AppError(`Please login to get access`, 401));
    //Token format Bearer [Token]
    authorization = authorization.split(' ')[1];

    //2- Validate Token
    const decoded = await hashUtils.validateJWTToken(authorization);

    //3- Check if user still exists
    const user = await User.findById(decoded.id).select('+passwordChangedAt');
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
        new AppError(
          `Authentication no longer valid. Please login again!!`,
          401
        )
      );
    //5-Verify roles
    if (roles && roles.length > 0 && !roles.includes(user.role))
      return next(
        new AppError(`Access to the selected route is not allowed`, 403)
      );
    req.user = user.toObject();
    next();
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1- Get user by email
  const userTmp = await User.findOne({ email: req.body.email });
  if (!userTmp)
    return next(
      new AppError(`User not found with email: ${req.body.email}`, 404)
    );

  //2- Generate the random reset token
  const resetToken = userTmp.createPasswordResetToken();
  await userTmp.save({ validateBeforeSave: false }); //Actualiza el usuario en la BD con el token encriptado y la fecha limite valida del token

  //3- Send it to the user
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new Password and PasswordConfirm to ${resetURL}. If you don't want to reset your password please ignore this.`;

  try {
    await sendEmail({
      email: userTmp.email,
      subject: 'Reset Password Requested',
      message: message
    });
  } catch (err) {
    console.log(err);
    userTmp.passwordResetToken = undefined;
    userTmp.passwordResetExpires = undefined;
    userTmp.save({ validateBeforeSave: false });
    return next(
      new AppError('Error sending the email. Please try again later!', 500)
    );
  }

  res.status(200).json({
    status: 'sucess',
    message: 'Token sent to email!'
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1- Get user based on token
  const hashedToken = hashUtils.hashCryptoToken(req.params.token);
  const userTmp = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!userTmp)
    return next(
      new AppError(
        `User not found with requested token or token is expired`,
        400
      )
    );

  //2- If token has not expired, set the new password
  userTmp.password = req.body.password;
  userTmp.passwordConfirm = req.body.passwordConfirm;
  userTmp.passwordResetToken = undefined;
  userTmp.passwordResetExpires = undefined;
  await userTmp.save();

  //3- Login user
  const token = hashUtils.generateJWTToken(userTmp._id);

  res.status(200).json({
    status: 'sucess',
    token: token
  });
});
