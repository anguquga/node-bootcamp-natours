const fs = require('fs');

const toursSimple = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

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
  const idParam = req.params.id * 1;
  const tourTemp = toursSimple.find((tour) => tour.id === idParam);

  if (tourTemp) {
    res.status(200).json({
      status: 'sucess',
      results: 1,
      data: {
        tours: tourTemp,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
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
  const idParam = req.params.id * 1;
  let tourPos;
  let tourTemp = toursSimple.find((tour, index) => {
    if (tour.id === idParam) {
      tourPos = index;
      return tour;
    }
    return null;
  });
  const data = Object.assign(req.body);
  if (tourTemp && data) {
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
  } else if (tourTemp) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid Data',
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
};

exports.deleteTour = (req, res) => {
  const idParam = req.params.id * 1;
  let tourPos;
  let tourTemp = toursSimple.find((tour, index) => {
    if (tour.id === idParam) {
      tourPos = index;
      return tour;
    }
    return null;
  });

  if (tourTemp) {
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
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
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
      return;
    }
  );
};
