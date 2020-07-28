const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const stream = require('stream');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

/*const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/img/users');
  },
  filename: (req, file, callback) => {
    const ext = file.mimetype.split('/')[1];
    callback(null, `photo-${req.user._id}.${ext}`);
  }
});*/

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(new AppError('Only Images are allowed', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.resizeUserImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `photo-${req.user._id}.jpeg`;

  let dir = `${process.env.IMAGES_FOLDER}`;
  if (process.env.NODE_ENV === 'development') dir = '/home/andres-dev/Pictures';

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`${dir}/${req.file.filename}`);

  next();
});

exports.uploadUserPhoto = upload.single('photo');

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
  if (req.file) newObj.photo = req.file.filename;
  const userTmp = await User.findByIdAndUpdate(
    { _id: req.user._id },
    { ...newObj },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(201).json({
    status: 'success',
    data: {
      user: userTmp
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate({ _id: req.user._id }, { active: false });
  res.status(204).json({
    status: 'success'
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getImageMe = async (req, res, next) => {
  const user = await User.findById(req.user._id).select('photo');
  let dir = `${process.env.IMAGES_FOLDER}`;
  if (process.env.NODE_ENV === 'development') dir = '/home/andres-dev/Pictures';
  const r = fs.createReadStream(`${dir}/${user.photo}`); // or any other way to get a readable stream
  const ps = new stream.PassThrough(); // <---- this makes a trick with stream error handling
  stream.pipeline(
    r,
    ps, // <---- this makes a trick with stream error handling
    (err) => {
      if (err) {
        console.log(err); // No such file or any other kind of error
        return res.sendStatus(400);
      }
    }
  );
  ps.pipe(res);
};
//---------------------END Current User Methods -----------------

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllUsers = factory.getAllDocs(User);
exports.getUserById = factory.getOneById(User);
