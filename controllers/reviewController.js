const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.getReviewById = factory.getOneById(Review, {
  tour: {
    path: 'tour',
    select: 'name'
  },
  user: {
    path: 'user',
    select: 'name photo'
  }
});

exports.createReview = factory.createOne(Review);

exports.getAllReviews = factory.getAllDocs(Review, {
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
  //Para get All Reviews /tours/[tourId]/reviews o /reviews
  req.query.tour = req.query.tour || req.params.tourId;
  if (req.user.role !== 'admin') {
    req.query.user = req.user._id;
    req.body.user = req.user._id;
  }

  //Para CreateReview por la ruta /tours/[tourId]/reviews o /reviews
  if (req.params.tourId) req.body.tour = req.params.tourId;
  next();
};
