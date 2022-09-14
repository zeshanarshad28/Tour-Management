const express = require("express");
const tourControllers = require("../controllers/tourControllers");
const authControllers = require("../controllers/authControllers");
// const reviewsControllers = require("../controllers/reviewControllers"); only require if use simple nested routing.
const reviewRouter = require("./reviewRoutes");
const router = express.Router();
// router.param('id',tourControllers.checkId)
// Routes according to REST>>>
router
  .route("/")
  .get(tourControllers.getTour)
  .post(
    authControllers.protect,
    authControllers.restrictTo("admin", "lead-guide"),
    tourControllers.creatTour
  );
router
  .route("/topRecodes")
  .get(tourControllers.aliasTopTours, tourControllers.getTour);
router
  .route("/tourStats")
  .get(
    authControllers.protect,
    authControllers.restrictTo("admin", "lead-guide", "guide"),
    tourControllers.getTourStats
  );
router.route("/getMonthlyPlan").get(tourControllers.getMonthlyPlan);

router
  .route("/:id")
  .delete(
    authControllers.protect,
    authControllers.restrictTo("admin", "lead-guide"),
    tourControllers.deleteTour
  )
  .patch(
    authControllers.protect,
    authControllers.restrictTo("admin", "lead-guide"),
    tourControllers.uploadPhoto, // runing the middlware for image upload
    tourControllers.resizeTourPhoto,
    tourControllers.updateTour
  )
  .put(tourControllers.updateTour)
  .get(tourControllers.getTourById);

// route for geospatial queries to find tour within specific distance
router
  .route("/toursWithIn/:distance/center/:latlng/unit/:unit")
  .get(tourControllers.getTourWithIn);
// route for geospatial aggregation to calculate distance of specific tour from the given point.
router.route("/distances/:latlng/unit/:unit").get(tourControllers.getDistances);
// ================================Nested Routes --->===================================
// /POST/tour/2342ne24213/reviews/234md342
// For simple nested route >
// router
//   .route("/:tourId/reviews")
//   .post(
//     authControllers.protect,
//     authControllers.restrictTo("user"),
//     reviewsControllers.creatReview
//   );

// nested routes with express ( using {mergeParams=true} in review routes )
router.use("/:tourId/reviews", reviewRouter);
module.exports = router;
