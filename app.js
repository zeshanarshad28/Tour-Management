const express = require("express");

const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const tourRoutes = require("./routes/tourRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const customerRoutes = require("./routes/customerRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorControllers");

// const morgan = require("morgan");
const app = express();

// try {
//   mongoose.connect(
//     DB,
//     {
//       useNewUrlParser: true,
//     },
//     () => {
//       console.log(" DB connected");
//     }
//   );
// } catch (error) {
//   console.log(error);
// }
//  GLOBAL MIDDLWARES
// =====Sanitization=====
// ===== Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// ======== Data sanitization against XSS (protection from malicious html) use pkg name exactly "xss-clean"
app.use(xssClean());
//  Set Security HTTP Headers======
app.use(helmet());
// preventing parameters pollution
app.use(
  hpp({
    whitelist: ["duration", "price"], //only whitelist properties will allow to be duplicate working in parameters and remaining will only work the last one
  })
); // clear the query string

//  Middlware to limit the requests===================
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP , Please try again in 1 hour !",
});
// app.use(limiter)
app.use("/api", limiter);

// app.use(morgan("dev"));
// Body parser, reading data from the body into req.body
// app.use(express.json());
app.use(express.json({ limit: "100kb" }));

// serving static files
app.use(express.static(`./extra`));
// Test middlware
// app.use((req, res, next) => {
//   console.log("Hi... from middleware");
//   next();
// });
app.use("/", bookingRoutes);
app.use("/api/v1/tour", tourRoutes);
// app.use(tourRout
app.use(userRoutes);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/booking", bookingRoutes);

app.use("/api/v1/reviews", reviewRoutes);

// Handling unhandled routes:>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
app.all("*", (req, res, next) => {
  // console.log("wrong url");
  // res.status(404).json({
  //   status: "Fail",
  //   message: `can't find ${req.originalUrl} on this server`,
  // })

  //>>>>>>>> code for error handler midlware with builtin error class >>>>>>>
  // const err = new Error(`can't find ${req.originalUrl} on this server`);
  // err.status = "fail";
  // err.statusCode = 404;
  // next(err);
  //>>>>> code for error handler midlware for own error class ( for refactored class module )<<<<<<<<<<<<<

  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// Error handler middlware
app.use(globalErrorHandler);

// ///////////////////////////////////////////////////////////////
// API's for User

// for data

// users routes
// console.log(`Runing in ${process.env.NODE_ENV} Environment`);
// const port = process.env.PORT;
// const server = app.listen(port, () => {
//   console.log(`Server is runing at port ${port}`);
// });

module.exports = app;
