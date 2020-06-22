const Review = require('../models/reviewModel');

const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  req.query.tour = req.params.tourId || undefined;

  const features = new APIFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.getReviewById = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError(`No review found with ID: ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    results: review.length,
    data: {
      review: review
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  //Permite crear un Review en la ruta /tours/[tourId]/reviews
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;

  const data = Object.assign(req.body);
  const newReview = await Review.create({ ...data });
  if (!newReview) {
    return next(new AppError(`Error while creating new Review`, 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});
