const fs = require('fs');

const toursSimple = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

exports.checkID = (req, res, next, val) => {
  const idParam = val * 1;
  let tourPos;
  const tourTemp = toursSimple.find((tour, index) => {
    if (tour.id === idParam) {
      tourPos = index;
      return tour;
    }
    return null;
  });
  if (!tourTemp) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.locals.tour = tourTemp;
  res.locals.tourPos = tourPos;
  next();
};

exports.checkBody = (req, res, next) => {
  try {
    const data = JSON.parse(JSON.stringify(req.body));
    if (Object.keys(data).length <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing Data',
      });
    }
    res.locals.bodyData = data;
    next();
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Data',
    });
  }
};

const updateToursFile = () => {
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(toursSimple),
    'utf-8',
    (err) => {
      if (err) throw err;
    }
  );
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'sucess',
    results: toursSimple.length,
    data: {
      toursSimple,
    },
  });
};

exports.getTourById = (req, res) => {
  const tourTemp = res.locals.tour;

  res.status(200).json({
    status: 'sucess',
    results: 1,
    data: {
      tours: tourTemp,
    },
  });
};

exports.createTour = (req, res) => {
  const newID = toursSimple[toursSimple.length - 1].id + 1;
  let data = Object.assign(req.body);
  data = {
    ...data,
    id: newID,
  };
  toursSimple.push(data);
  try {
    updateToursFile();
    res.status(201).json({
      status: 'success',
      data: {
        tour: data,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateTour = (req, res) => {
  const tourPos = res.locals.tourPos;
  let tourTemp = res.locals.tour;
  const data = res.locals.bodyData;
  tourTemp = {
    ...tourTemp,
    ...data,
  };
  toursSimple[tourPos] = tourTemp;

  try {
    updateToursFile();
    res.status(201).json({
      status: 'success',
      data: {
        tour: tourTemp,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteTour = (req, res) => {
  const tourPos = res.locals.tourPos;

  toursSimple.splice(tourPos, 1);

  try {
    updateToursFile();
    res.status(204).json({
      status: 'success',
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
