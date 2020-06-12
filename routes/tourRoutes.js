const express = require('express');
const tourController = require('../controllers/tourController');

const tourRouter = express.Router();

//tourRouter.param('id', tourController.checkID);
tourRouter.route('/top-5-cheap').get(tourController.top5Cheap, tourController.getAllTours);

tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
tourRouter
  .route(`/:id`)
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRouter;
