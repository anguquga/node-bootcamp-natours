const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(
          `No ${Model.modelName} found with ID: ${req.params.id}`,
          404
        )
      );
    }

    res.status(204).json();
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
      { _id: req.params.id },
      { ...req.body },
      {
        new: true,
        runValidators: true
      }
    );
    if (!doc) {
      return next(
        new AppError(
          `No ${Model.modelName} found with ID: ${req.params.id}`,
          404
        )
      );
    }

    res.status(201).json({
      status: 'success',
      data: {
        [Model.modelName]: doc
      }
    });
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const data = Object.assign(req.body);
    const newDoc = await Model.create({ ...data });
    if (!newDoc) {
      return next(
        new AppError(`Error while creating new ${Model.modelName}`, 404)
      );
    }
    res.status(201).json({
      status: 'success',
      data: {
        [Model.modelName]: newDoc
      }
    });
  });
};

exports.getOneById = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions)
      Object.keys(populateOptions).forEach((key) => {
        query = query.populate(populateOptions[key]);
      });

    const doc = await query;
    if (!doc) {
      return next(
        new AppError(
          `No ${Model.modelName} found with ID: ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        [Model.modelName]: doc
      }
    });
  });
};

exports.getAllDocs = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    Model.all = true;
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    if (populateOptions)
      Object.keys(populateOptions).forEach((key) => {
        features.query = features.query.populate(populateOptions[key]);
      });

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        [Model.modelName + 's']: docs
      }
    });
  });
};
