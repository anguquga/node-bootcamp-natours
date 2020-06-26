const mongoose = require('mongoose');
const Tour = require('./tourModel');

const schemaOptions = {
  virtuals: true,
  versionKey: false,
  transform: function (doc, res) {}
};

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, `Review can't be empty!!`]
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: { type: mongoose.Schema.ObjectId, ref: 'Tour', required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
  },
  {
    toJSON: { ...schemaOptions },
    toObject: { ...schemaOptions }
  }
);

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post('save', function (doc) {
  if (doc) doc.constructor.calcAverageRatings(doc.tour);
});

reviewSchema.post(/^findOneAnd/, function (doc) {
  if (doc) doc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
