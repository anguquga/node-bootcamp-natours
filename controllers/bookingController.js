const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');

exports.getBookingById = factory.getOneById(Booking, {
  tour: {
    path: 'tour',
    select: 'name'
  },
  user: {
    path: 'user',
    select: 'name photo'
  }
});
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.createBooking = factory.updateOne(Booking);
exports.getAllBookings = factory.getAllDocs(Booking, {
  tour: {
    path: 'tour',
    select: 'name'
  },
  user: {
    path: 'user',
    select: 'name photo'
  }
});

exports.setTourUserIds = (req, res, next) => {
  //Para get All Bookings /tours/[tourId]/bookings o /bookings
  req.query.tour = req.params.tourId || undefined;
  if (req.user.role !== 'admin') {
    req.query.user = req.user._id;
    req.body.user = req.user._id;
  }

  //Para CreateReview por la ruta /tours/[tourId]/reviews o /reviews
  if (req.params.tourId) req.body.tour = req.params.tourId;
  next();
};
