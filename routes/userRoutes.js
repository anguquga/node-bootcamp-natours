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

userRouter.use(authController.authorize());

userRouter
  .route('/updatePassword/')
  .patch(authController.updatePassword)
  .all(authController.unauthorizedRoute);

userRouter
  .route('/updateMe/')
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserImage,
    userController.updateMe
  )
  .all(authController.unauthorizedRoute);

userRouter
  .route('/deleteMe/')
  .delete(userController.deleteMe)
  .all(authController.unauthorizedRoute);

userRouter
  .route('/me/')
  .get(userController.getMe, userController.getUserById)
  .all(authController.unauthorizedRoute);

userRouter
  .route('/imageMe/')
  .get(userController.getImageMe)
  .all(authController.unauthorizedRoute);

userRouter.use(authController.authorize('admin'));

userRouter.route('/').get(userController.getAllUsers);

userRouter
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
