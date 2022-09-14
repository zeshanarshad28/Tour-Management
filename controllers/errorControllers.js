const AppError = require("../utils/appError");

const handleCastErrorDb = (err) => {
  const message = `invalid ${err.path}:${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldErrorDb = (err, res) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  console.log(value);

  const message = `Duplicate value:${value} please use another value .`;
  return new AppError(message, 400);
};
const handleValidationErrorDb = (err, res) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleJwtError = () =>
  next(new AppError("Invalid token please login again", 401));
const handleJwtExpiredTokenError = () =>
  next(new AppError("Your token is expired please login again", 401));
const sendErrorProd = (err, res) => {
  // operational trusted error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // log error
    // console.error("Error", err);
    // sending generic messages
    res.status(500).json({
      status: "Error",
      message: `Something went wrong. ${err}`,
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log("error handler .....");
  console.log();
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  if (process.env.NODE_ENV === "development") {
    console.log("Dev error");
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else if (process.env.NODE_ENV === "production") {
    // let error = { ...err };
    console.log(err);
    let error = err;
    error.name = "value";
    console.log("error", error);
    console.log("err", err);
    // console.log(`${err.name}  >>>>>>>>>>>>>>>> ${error.name}`);
    // handling invalid id err/ cast error
    if (error.name === "CastError") error = handleCastErrorDb(error);
    // handling duplicate field error
    if (error.code === 11000) error = handleDuplicateFieldErrorDb(error);
    // handling Validation Error
    if (error.name === "ValidationError")
      error = handleValidationErrorDb(error);
    //  json token error. If its invalid token(user manupulate with payload)
    if (error.name === "JsonWebTokenError") error = handleJwtError();
    // handle expired token error
    if (error.name === "TokenExpiredError")
      error = handleJwtExpiredTokenError();
    sendErrorProd(error, res);
    // return res.status(err.statusCode).json({
    //   status: err.status,
    //   error: err,
    //   message: err.message,
    //   stack: err.stack,
    // });
  }
};
