const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
