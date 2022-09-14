const Review = require("../models/reviews");
const catchAsync = require("../utils/catchAsync");
const handlersFactory = require("./handlersFactory");
exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: "Sucess",
    data: {
      reviews,
    },
  });
});

exports.creatReview = catchAsync(async (req, res, next) => {
  // Allow,Nested Routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  // console.log(`NOW THE TOUR ID IS ${req.params.tourId}`);
  // console.log(req.body.user);

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: "Sucess",
    data: {
      newReview,
    },
  });
});

//  deleting review
exports.deleteReview = handlersFactory.deleteOne(Review);

exports.updateReview = handlersFactory.updateOne(Review);
