const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try{
    //Filtering
    const queryObj = {...req.query};
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    //Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match =>`$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    //Sorting
    if(req.query.sort){
      query = query.sort(req.query.sort.split(',').join(' ')); //sort=price,ratingsAvg en el QueryString
    }else{
      query = query.sort('-createdAt'); //Ordernarlo por createdAt descendente
    }

    const tours = await query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  }catch(err){
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTourById = async (req, res) => {
  try{
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      results: tour.length,
      data: {
        tour,
      },
    });
  }catch(err){
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const data = Object.assign(req.body);
    const newTour = await Tour.create({ ...data});
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate({_id: req.params.id}, {...req.body}, {
      new: true
    });
    res.status(201).json({
      status: 'success',
      data: {
        tour: tour
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: {
        tour: tour
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};