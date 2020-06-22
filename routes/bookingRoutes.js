const express = require('express');
const bookingController = require('../controllers/bookingController');

const bookingRouter = express.Router();

bookingRouter
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

bookingRouter.route(`/:id`).get(bookingController.getBookingById);

module.exports = bookingRouter;
