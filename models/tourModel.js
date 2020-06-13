const mongoose = require('mongoose');
const slugify = require('slugify');

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty']
  },
  ratingsAverage: {
    type: Number,
    default: 4.5
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: true
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  slug: String
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

toursSchema.virtual('durationWeeks').get(function() {  //Campos virtuales basados en otros campos q no estan realmente en la BD
  return this.duration/7;
});

//Document Middleware runs before .save() and .create() doesnt work in insertMany()
toursSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {lower: true});
  next();
});

toursSchema.post('save', function(doc, next) {
  if(doc.slug){
    console.log('Slug is working!!!');
  }
  next();
});

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;