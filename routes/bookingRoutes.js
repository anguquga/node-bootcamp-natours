const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const bookingRouter = express.Router({ mergeParams: true });

bookingRouter
  .route('/')
  .get(
    authController.authorize(),
    bookingController.setTourUserIds,
    bookingController.getAllBookings
  )
  .post(
    authController.authorize(),
    bookingController.setTourUserIds,
    bookingController.createBooking
  );

bookingRouter
  .route(`/:id`)
  .get(authController.authorize(), bookingController.getBookingById)
  .delete(authController.authorize(), bookingController.deleteBooking)
  .patch(authController.authorize(), bookingController.updateBooking);

module.exports = bookingRouter;
