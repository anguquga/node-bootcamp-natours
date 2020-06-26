const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.createOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getAllTours = factory.getAllDocs(Tour, {
  review: { path: 'reviews', populate: 'user' },
  booking: { path: 'bookings', populate: 'user' }
});

exports.getTourById = factory.getOneById(Tour, {
  review: { path: 'reviews' },
  booking: { path: 'bookings' }
});

exports.top5Cheap = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: {_id: {$ne: 'EASY'}} //Se pueden anidar muchos Match para filtar
    // }
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numTourStarts: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan
    }
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, coordinates, unit } = req.params;
  const [latitude, longitude] = coordinates.split(',');
  //Convert to radiants 3963.2 radius of Earth in radiants
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!latitude || !longitude)
    return next(
      new AppError(
        'Please provide Latitude and Longitude in the format lat,long',
        400
      )
    );

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radius]
      }
    }
  });

  res.status(200).json({
    status: 'sucess',
    results: tours.length,
    data: { tours }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { coordinates, unit } = req.params;
  const [latitude, longitude] = coordinates.split(',');
  const unitConverter = unit === 'mi' ? 0.000621371 : 0.001;

  if (!latitude || !longitude)
    return next(
      new AppError(
        'Please provide Latitude and Longitude in the format lat,long',
        400
      )
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude * 1, latitude * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: unitConverter
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'sucess',
    results: distances.length,
    data: { distances }
  });
});
