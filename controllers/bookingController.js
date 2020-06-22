const Booking = require('../models/bookingModel');

const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Booking.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const bookings = await features.query;

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});

exports.getBookingById = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return next(
      new AppError(`No booking found with ID: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    results: booking.length,
    data: {
      booking
    }
  });
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const data = Object.assign(req.body);
  const newBooking = await Booking.create({ ...data });
  if (!newBooking) {
    return next(new AppError(`Error while creating new Booking`, 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      booking: newBooking
    }
  });
});
