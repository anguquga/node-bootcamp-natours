const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

//POST /tours/2452/reviews  por el mergeParams lo permite
//POST /reviews
reviewRouter
  .route('/')
  .get(authController.authorize('user'), reviewController.getAllReviews)
  .post(authController.authorize('user'), reviewController.createReview);

reviewRouter.route(`/:id`).get(reviewController.getReviewById);

module.exports = reviewRouter;
