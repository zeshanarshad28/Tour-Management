const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewsSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, "Please enter name"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a User"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// indexing the review schema for preventing duplicate reviews from same user on same tour
reviewsSchema.index({ tour: 1, user: 1 }, { unique: true });

// reviewsSchema.pre(/^find/, function (next) {
//   // this.populate({
//   //   path: "tour",
//   //   select: "name",
//   // }).populate({
//   //   path: "user",
//   //   select: "name",
//   // });
//   // to only populate user.... as to use it from tour id to get reviews by tour id .
//   this.populate({
//     path: "user",
//     select: "name",
//   });
//   next();
// });

// ::::::::::::::::::::::::calculating the average rating:::::::::::::::::::::::::::
reviewsSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
// calling the static method for average ratings after new document is added
reviewsSchema.post("save", function () {
  // "this" points the current review(document)
  this.constructor.calcAverageRatings(this.tour);
});
// calling the static method for average ratings in Update/Delete Case . bcz this will be a query middlware
reviewsSchema.pre(/^findOneAnd/, async function (next) {
  console.log("this: ", this);
  // "this" points the current query
  // console.log(this);
  this.currentDocument = await this.findOne(); // getting the current document and storung in "currentDocument" property of "this"(make new property)
  //console.log("this.Document", this.currentDocument);
  next();
});

// now use below middlware to change values in db
reviewsSchema.post(/^findOneAnd/, async function () {
  // "this" points the current review(document)
  // console.log("this.Document", this.currentDocument);
  let doc = await { ...this.currentDocument };
  // console.log(doc);
  await this.currentDocument.constructor.calcAverageRatings(
    this.currentDocument.tour // here "tour is the name of tour id property in reviews collection"
  );
});
const Review = mongoose.model("Review", reviewsSchema);
module.exports = Review;
