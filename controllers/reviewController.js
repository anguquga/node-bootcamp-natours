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
  console.log('Tour user ids');
  //Para AllReviews y CreateReview
  if (req.user.role === 'user') {
    console.log('user');
    req.query.user = req.user._id;
    req.body.user = req.user._id;
  }

  //Para CreateReview y AllReviews por la ruta /tours/[tourId]/reviews
  if (req.params.tourId) {
    console.log('tourId', req.params.tourId);
    req.body.tour = req.params.tourId;
    req.query.tour = req.params.tourId;
  }
  next();
};
