const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(authController.authorize());

//POST /tours/2452/reviews  por el mergeParams lo permite
//POST /reviews
reviewRouter
  .route('/')
  .get(reviewController.setTourUserIds, reviewController.getAllReviews)
  .post(
    authController.authorize('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

reviewRouter
  .route(`/:id`)
  .get(reviewController.getReviewById)
  .delete(
    authController.authorize('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.authorize('user', 'admin'),
    reviewController.updateReview
  );

module.exports = reviewRouter;
