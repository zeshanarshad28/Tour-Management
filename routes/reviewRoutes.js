const express = require("express");
const reviewController = require("../controllers/reviewControllers");
const authControllers = require("../controllers/authControllers");

const router = express.Router({ mergeParams: true });
router.use(authControllers.protect); // middlware to protect all routes
router.route("/").get(reviewController.getAllReviews).post(
  // authControllers.protect,
  authControllers.restrictTo("user"),
  reviewController.creatReview
);
router
  .route("/:id")
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = router;
