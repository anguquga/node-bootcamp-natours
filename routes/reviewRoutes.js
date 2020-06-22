const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

//POST /tours/2452/reviews  por el mergeParams lo permite
//POST /reviews
reviewRouter
  .route('/')
  .get(
    authController.authorize(),
    reviewController.setTourUserIds,
    reviewController.getAllReviews
  )
  .post(
    authController.authorize(),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

reviewRouter
  .route(`/:id`)
  .get(authController.authorize(), reviewController.getReviewById)
  .delete(authController.authorize(), reviewController.deleteReview)
  .patch(authController.authorize(), reviewController.updateReview);

module.exports = reviewRouter;
