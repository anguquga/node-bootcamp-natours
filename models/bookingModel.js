const mongoose = require('mongoose');

const schemaOptions = {
  virtuals: true,
  versionKey: true,
  transform: function (doc, res) {}
};

const bookingSchema = new mongoose.Schema(
  {
    bookingDate: {
      type: Date,
      required: [true, 'Booking must have a Date!']
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a Tour!!']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a Tour!!']
    },
    __v: { type: Number, select: false }
  },
  {
    toJSON: { ...schemaOptions },
    toObject: { ...schemaOptions }
  }
);

bookingSchema.pre(/^find/, function (next) {
  this.find().populate('tour user');
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
