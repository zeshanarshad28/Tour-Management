const express = require("express");
const bookingControllers = require("../controllers/bookingControllers");
const authControllers = require("../controllers/authControllers");

const router = express.Router();
router.get(
  "/checkout-session/:tourId",
  // authControllers.protect,
  bookingControllers.getCheckoutSession
);
router.get("/", bookingControllers.creatBookingCheckout);

module.exports = router;
