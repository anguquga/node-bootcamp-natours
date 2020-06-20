const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const AppError = require('../utils/appError');

const userRouter = express.Router();

userRouter
  .route('/signup')
  .post(authController.signup)
  .all((req, res) => {
    throw new AppError(`Only POST method allowed for ${req.originalUrl}`, 404);
  });

userRouter
  .route('/login/')
  .post(authController.login)
  .all((req, res) => {
    throw new AppError(`Only POST method allowed for ${req.originalUrl}`, 404);
  });

userRouter
  .route('/forgotPassword/')
  .post(authController.forgotPassword)
  .all((req, res) => {
    throw new AppError(`Only POST method allowed for ${req.originalUrl}`, 404);
  });

userRouter
  .route('/resetPassword/:token')
  .patch(authController.resetPassword)
  .all((req, res) => {
    throw new AppError(`Only PATHC method allowed for ${req.originalUrl}`, 404);
  });

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
