// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripe = require("stripe")(
  "sk_test_51LfeSFFPcxiOmlyFYfcrY9JsYZc17Xf0QtXyBlwR5ysean3uv4DrpmiOfRcpWShanIbnLcusRNTd9RvdV7MiMUY100PlL258F2"
);

const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const handlersFactory = require("./handlersFactory");
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  console.log("In checkout session");
  //   console.log(process.env.STRIPE_SECRET_KEY);
  // get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //  2) creat checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], // these five lines are information about session itself
    success_url: `${req.protocol}://${req.get("host")}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      // this is the information about product which user is going to purchase
      {
        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            // images: [`https://picsum.photos/id/237/200/300`],
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });
  console.log(session);
  //   3) creat a seesion as a response
  res.status(200).json({
    status: "success",
    session,
  });
});

// creating booking when payment is done
exports.creatBookingCheckout = catchAsync(async (req, res, next) => {
  // this is temporary bcz its unsecure.... everyone can make booking without paying
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  const newBooking = await Booking.create({ tour, user, price });
  res.status(201).json({
    status: "success",
    newBooking,
  });
});
