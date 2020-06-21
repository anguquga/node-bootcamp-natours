const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter
  .route('/signup')
  .post(authController.signup)
  .all(authController.unauthorizedRoute);

userRouter
  .route('/login/')
  .post(authController.login)
  .all(authController.unauthorizedRoute);

userRouter
  .route('/forgotPassword/')
  .post(authController.forgotPassword)
  .all(authController.unauthorizedRoute);

userRouter
  .route('/resetPassword/:token')
  .patch(authController.resetPassword)
  .all(authController.unauthorizedRoute);

userRouter
  .route('/updatePassword/')
  .patch(authController.authorize(), authController.updatePassword)
  .all(authController.unauthorizedRoute);

userRouter
  .route('/updateMe/')
  .patch(authController.authorize(), userController.updateMe)
  .all(authController.unauthorizedRoute);

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
