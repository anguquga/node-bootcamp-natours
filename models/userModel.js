const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const AppError = require('../utils/appError');

const usersSchema = new mongoose.Schema({
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
  photo: String,
  password: {
    type: String,
    minlength: [8, 'Password must have at least 8 characters'],
    required: [true, 'Please provide a password']
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password']
  }
});

usersSchema.pre('validate', function (next) {
  if (this.password !== this.passwordConfirm) {
    this.invalidate(
      'passwordConfirm',
      'Password Confirm must be identical to password',
      this.passwordConfirm
    );
  }
  this.passwordConfirm = this.password;
  next();
});

usersSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

usersSchema.pre('findOneAndUpdate', async function (next) {
  if (this._update.password) {
    this._update.password = await bcrypt.hash(this._update.password, 12);
    this._update.passwordConfirm = undefined;
    next();
  } else {
    next(new AppError('Please provide a Password', 404));
  }
});

usersSchema.methods.validatePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', usersSchema);

module.exports = User;
