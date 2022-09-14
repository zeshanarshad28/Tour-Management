const Customer = require("../models/customer");
const catchAsync = require("../utils/catchAsync");

exports.creatCustomer = catchAsync(async (req, res, next) => {
  const newCustomer = await Customer.create({
    name: req.body.name,
    email: req.body.email,
  });

  res.status(201).json({
    status: "Success",
    data: {
      user: newCustomer,
    },
  });
});
