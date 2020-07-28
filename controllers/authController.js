const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const hashUtils = require('../utils/hashUtils');
const Email = require('../utils/email');

const createSendToken = (user, statusCode, onlyToken, res) => {
  const token = hashUtils.generateJWTToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  let resJson = {
    status: 'success',
    token: token
  };
  if (!onlyToken) {
    resJson = { ...resJson, data: { user: user } };
  }
  res.status(statusCode).json(resJson);
};

const getJWTToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer')) return undefined;
  //Token format Bearer [Token]
  const authorization = authHeader.split(' ')[1];
  return authorization;
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

  createSendToken(newUser, 201, false, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1- CHeck Email and Password
  if (!email || !password) {
    return next(new AppError(`Please provide email and password`, 400));
  }

  //2- Find user by email and check password
  const user = await User.findOne({ email: email }).select(
    '+loginAttempts +lastLoginAttempt +password'
  );

  if (!user) return next(new AppError(`Incorrect email or password`, 401));

  const loginAttempts = user.loginAttempts * 1 || 0;
  if (loginAttempts >= process.env.MAX_LOGIN_ATTEMPTS) {
    const remainingMins = new Date(
      new Date(
        user.lastLoginAttempt.getTime() +
          process.env.LOGIN_RETRY_TIMEOUT * 60 * 1000
      ) - Date.now()
    ).getMinutes();
    if (remainingMins < process.env.LOGIN_RETRY_TIMEOUT)
      return next(
        new AppError(
          `Account is locked please wait ${remainingMins} minutes and try again!!`,
          401
        )
      );
    user.loginAttempts = 0;
  }

  let validatePasswrd = true;
  if (!(await user.validatePassword(password))) {
    user.loginAttempts = user.loginAttempts + 1 || 1;
    user.lastLoginAttempt = Date.now();
    validatePasswrd = false;
  } else {
    user.loginAttempts = 0;
    user.lastLoginAttempt = undefined;
  }
  await user.save({
    new: true,
    runValidators: true
  });
  if (validatePasswrd) createSendToken(user, 201, true, res);
  else return next(new AppError(`Incorrect email or password`, 401));
});

exports.authorize = (...roles) => {
  return catchAsync(async (req, res, next) => {
    //1- Getting token from request
    const authorization = getJWTToken(req.headers.authorization);
    if (!authorization)
      return next(new AppError(`Please login to get access`, 401));

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

  try {
    const email = new Email(
      {
        email: userTmp.email,
        name: userTmp.name
      },
      resetURL
    );
    await email.resetPassword();
  } catch (err) {
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
  createSendToken(userTmp, 200, true, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1- Get user from the collection
  const userTmp = await User.findById(req.user._id).select('+password');
  if (!userTmp)
    return next(
      new AppError(`Invalid Token information. Please Log In again!!`, 400)
    );

  //2- Check if posted password is correct
  if (
    !req.body.password ||
    !(await userTmp.validatePassword(req.body.oldPassword))
  )
    return next(new AppError(`Invalid Password. Please try again!!`, 400));

  //3- Update Password
  userTmp.password = req.body.password;
  userTmp.passwordConfirm = req.body.passwordConfirm;
  await userTmp.save();

  //4- Login again
  createSendToken(userTmp, 200, true, res);
});

exports.unauthorizedRoute = (req, res, next) => {
  next(new AppError(`Unauthorized Method for ${req.originalUrl}`, 404));
};
