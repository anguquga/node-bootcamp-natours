const mongoose = require('mongoose');
const validator = require('validator');

const hashUtils = require('../utils/hashUtils');

const schemaOptions = {
  virtuals: true,
  versionKey: false,
  transform: function (doc, res) {
    delete res.password;
    delete res.passwordConfirmed;
    delete res.passwordChangedAt;
    delete res.active;
  }
};

const usersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      maxlength: [40, 'A name must have max 40 characters'],
      minlength: [10, 'A name must have at least 10 characters']
    },
    email: {
      type: String,
      required: [true, 'A user must have an email'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid Email'
      },
      unique: true,
      lowercase: true
    },
    photo: {
      type: String,
      default: 'default.jpg'
    },
    password: {
      type: String,
      minlength: [8, 'Password must have at least 8 characters'],
      required: [true, 'Please provide a password'],
      select: false
    },
    passwordConfirm: {
      type: String,
      select: false
    },
    passwordChangedAt: {
      type: Date,
      select: false
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    loginAttempts: {
      type: Number,
      select: false
    },
    lastLoginAttempt: {
      type: Date,
      select: false
    }
  },
  {
    toJSON: { ...schemaOptions },
    toObject: { ...schemaOptions }
  }
);

usersSchema.pre('validate', function (next) {
  if (!this.isModified('password')) return next();
  if (this.password !== this.passwordConfirm) {
    return next(
      this.invalidate(
        'passwordConfirm',
        'Password Confirm must be identical to password',
        this.passwordConfirm
      )
    );
  }
  this.passwordConfirm = this.password;
  next();
});

usersSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashUtils.bcryptoHash(this.password);
  this.passwordConfirm = undefined;
  if (!this.isNew) this.passwordChangedAt = new Date() - 1000; //En caso de q haya delay en otro proceso ejemplo el JWT se cree antes por el async
  next();
});

usersSchema.pre('findOneAndUpdate', async function (next) {
  if (this._update.password) {
    this._update.password = await hashUtils.bcryptoHash(this._update.password);
    this._update.passwordConfirm = undefined;
    this._update.passwordChangedAt = new Date();
  }
  next();
});

usersSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

usersSchema.methods.validatePassword = async function (candidatePassword) {
  return await hashUtils.bcryptoCompare(candidatePassword, this.password);
};

usersSchema.methods.chagedPasswordAfterLogin = function (JWTTimestamp) {
  const changedTimestamp = this.passwordChangedAt
    ? parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    : JWTTimestamp - 1000;
  return changedTimestamp > JWTTimestamp;
};

usersSchema.methods.createPasswordResetToken = function () {
  const hashCrypto = hashUtils.createCryptoTokens();
  this.passwordResetToken = hashCrypto.hashToken;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return hashCrypto.resetToken;
};

const User = mongoose.model('User', usersSchema);

module.exports = User;
