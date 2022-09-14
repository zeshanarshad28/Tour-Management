const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");
const User = require("./userModel");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal then 40 characters"],
      minlength: [10, "A tour name must have more or equal then 10 characters"],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
      // CUSTOM validation in models
      // validate: function (val) {
      //   return val > 500; }
      // we can also use this keyword here which have current document.
      // This only points to current doc and can only be use in creat() method . we cannot use it for update.
      // validate: {
      //   validator: function (val) {
      //     return val > 5000000;
      //   },
      //   message: "Value {VALUE} should not by be below 500",
      // },
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // Geo JSON Object
      type: {
        type: String,
        default: "point",
        // enum: ["point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "point",
          // enum: ["point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, // for embedding data
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Indexing the schema.
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });
// Virtual properties==========================================
tourSchema.virtual("duration-weeks").get(function () {
  return this.duration / 7;
});

// Virtual populate=============================================
tourSchema.virtual("reviews", {
  ref: "Review", // refernce schema name
  foreignField: "tour",
  localField: "_id",
});
// Document Middlware. only for creat() & Save()>>>>>>>>>>>>>>>>>>>>>>>>>>>
tourSchema.pre("save", function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// // middlware to [[embedd ]] User document in this tour documents . ( document middlware)
// tourSchema.pre("save", async function (next) {
//   console.log(this.guides);
//  const guidesPromises = this.guides.map(
//     async (element) => await User.findById(element)
//   );
//    this.guides = await Promise.all(guidesPromises);
//   console.log(this.guides);
//  next();
// });

// ===============================================
// tourSchema.pre("save", function (next) {
//   console.log(this);
//   next();
// });

// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next;
// });

// Query Middleware>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// tourSchema.pre("find", function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $eq: false } });
  this.start = Date.now();
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordResetExpires", // excluding some fields
  });
  next();
});
tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} milli-seconds`);
  next();
});

// Aggregation Middlware>>>>>>[here we comment this code because we are using "$geoNear" stage in geospatial aggregation (which should always be the first stage in aggregation ) to find distance of tous ]
// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline);
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;

//   testing
// const testTour = new Tour({
//   name: "Pakistaneeeeeeeeeeeeeeeeeeeeeeeeeeeee",
//   price: 255555555555,
// });

// testTour.save().then((doc) => {
//   console.log(doc);
// });
