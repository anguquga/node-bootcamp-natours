const mongoose = require('mongoose');
const slugify = require('slugify');

const schemaOptions = {
  virtuals: true,
  versionKey: false
};

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have max 40 characters'],
      minlength: [10, 'A tour name must have at least 10 characters']
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
      required: [true, 'A tour must have a difficulty'],
      enum: {
        //Only for Strings
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price; //pricediscount debe ser menos a price siempre
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
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
    slug: String,
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number], //Latitude,Longitude
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number], //Latitude,Longitude
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
  },
  {
    toJSON: {
      ...schemaOptions,
      transform: function (doc, res) {
        delete res.secretTour;
      }
    },
    toObject: {
      ...schemaOptions,
      transform: function (doc, res) {
        //Definir que quitar
      }
    }
  }
);

toursSchema.index({ price: 1, ratingsAverage: -1 });
toursSchema.index({ slug: 1 });

toursSchema.virtual('durationWeeks').get(function () {
  //Campos virtuales basados en otros campos q no estan realmente en la BD
  return this.isSelected('durationWeeks') ? this.duration / 7 : undefined;
});

toursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //Campo en el modelo a unir
  localField: '_id' //Campo que identifica mi modelo para relacionarlo a la otra entidad
});

toursSchema.virtual('bookings', {
  ref: 'Booking',
  foreignField: 'tour', //Campo en el modelo a unir
  localField: '_id' //Campo que identifica mi modelo para relacionarlo a la otra entidad
});

//Document Middleware runs before .save() and .create() doesnt work in insertMany()
toursSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('name'))
    this.slug = slugify(this.name, { lower: true });
  next();
});

//Query Middleware
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }) // No muestra los tours que tengan secretTour en true funciona en todos los metodos find
    .populate({ path: 'guides', select: 'name photo' });
  this.start = Date.now(); //Setea una propiedad start en el objeto llamada start
  next();
});

toursSchema.pre('findOneAndUpdate', async function (next) {
  if (this._update.priceDiscount && this._update.priceDiscount < this.price) {
    return next(
      this.invalidate(
        'priceDiscount',
        'Discount price ({VALUE}) should be below regular price',
        this._update.priceDiscount
      )
    );
  }
  next();
});

toursSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

//Aggregation Middleware
toursSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //unshift method agrega elemento al comienzo de un array
  next();
});

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
