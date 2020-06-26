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
  //Para AllBookings y CreateBooking
  if (req.user.role === 'user') {
    req.query.user = req.user._id;
    req.body.user = req.user._id;
  }

  //Para AllBookings y CreateBooking por la ruta /tours/[tourId]/bookings
  if (req.params.tourId) {
    req.body.tour = req.params.tourId;
    req.query.tour = req.params.tourId;
  }
  next();
};
