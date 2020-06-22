const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const tourRouter = express.Router();

tourRouter.use('/:tourId/reviews', reviewRouter);

//tourRouter.param('id', tourController.checkID);
tourRouter
  .route('/top-5-cheap')
  .get(tourController.top5Cheap, tourController.getAllTours);
tourRouter.route('/tourStats').get(tourController.getTourStats);
tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

tourRouter
  .route('/')
  .get(authController.authorize(), tourController.getAllTours)
  .post(tourController.createTour);
tourRouter
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(
    authController.authorize('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = tourRouter;
