const { query } = require("express");
const fs = require("fs");

const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiFeatures = require("../utils/apiFeatures");
const handlersFactory = require("./handlersFactory");
const multer = require("multer");
const sharp = require("sharp");

// multer storage to store image in memory( as a buffer)
const multerStorage = multer.memoryStorage();

// multer filter to check if the uploaded file is an image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not and image! please upload an image file.", 400));
  }
};
// configuring the multer.
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
// uploading the multiple images in multiple fields
exports.uploadPhoto = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);
// // uploading the single image
// exports.uploadPhoto = upload.single("photo");
// // uploading the multiple images
// exports.uploadPhoto = upload.array("photo");
// Re-size user photos
exports.resizeTourPhoto = catchAsync(async (req, res, next) => {
  // console.log(`req.files is: ${req.files}`);
  console.log("resize is working");
  if (!req.files.imageCover || !req.files.images) return next();
  // 1) for cover image
  req.body.imageCover = `user-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  // 2) for images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (files, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(files.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
  );
  next();
});
// Alias Middleware>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
exports.aliasTopTours = (req, res, next) => {
  console.log("Aliasing");
  req.query.limit = "5";
  req.query.sort = "-price,rating";
  req.query.fields = "name,price,rating";
  next();
};
// const myData = JSON.parse(
//   fs.readFileSync(`${__dirname}/./../data/mydata.json`)
// );

// // param middlware
// exports.checkId = (req, res, next, data) => {
//   console.log(`verifying id:${data}............`);
//   next();
// };

// checker middlware
// exports.checker = (req, res, next) => {
//   if (!req.body) {
//     console.log("good");
//     return res.status(400);
//   }
//   next();
// };

// // GET API
exports.getTour = handlersFactory.getAll(Tour);
//  below is simple handler without factory function
// exports.getTour = async (req, res) => {
//   try {
//     console.log("get tour is working");
// below code should be commented upto features line bcz we use all this stuff in features
// console.log(`limit is : ${req.query.limit}`);
// console.log(`Sort is : ${req.query.sort}`);
// console.log(` fields to show are : ${req.query.fields}`);
// let tour = Tour.find(req.query);

// console.log("all data is here.....");
// const tour = await Tour.find(req.query);

// const tour = await Tour.find({ name: "Zeeshan" });
// const tour = await Tour.find(req.query);
// const tour = await Tour.find(req.query)
//   .where("name")
//   .equals("Magnus Mage")
//   .where("price")
//   .equals("22");
// Excluding Estra fields from query>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// let queryObj = { ...req.query };
// let excludeAbleFields = ["createdAt"];
// excludeAbleFields.forEach((el) => {
//   delete queryObj[el];
// });
// // Advance filtering>>>>>>>>>>>>>>>>>>>>>>>>>>>
// let queryString = JSON.stringify(queryObj);
// // console.log(`This is query object:${queryObj}`);

// // console.log(`This is query string before replacement:${queryString}`);
// queryString = queryString.replace(
//   /\b(gt|gte|lt|lte)\b/,
//   (match) => `$${match}`
// );
// // console.log(`query string after replacement ${queryString}`);
// // console.log("Now in json format");
// // console.log(JSON.parse(queryString));

// let query = Tour.find(JSON.parse(queryString));

// Sorting with multiple parameters
// if (req.query.sort) {
//   let sortBy = req.query.sort.split(",").join(" ");
//   // console.log(`SORTBY IS NOW : ${sortBy}`);
//   query = query.sort(sortBy);
//   // console.log(`lastttttt ${query}`);
// } else {
//   tour = tour.sort("-createdAt");
// }

// // field limiting>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// if (req.query.fields) {
//   let fields = req.query.fields.split(",").join(" ");
//   query = query.select(fields);
// } else {
//   query = query.select("-__v");
// }

// // Pagination>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// if (req.query.page) {
//   const limit = req.query.limit * 1 || 10;
//   const page = req.query.page * 1 || 1;
//   const skip = (page - 1) * limit;
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours) {
//     throw new Error("This page does not exist");
//   } else {
//     query = query.skip(skip).limit(limit);
//   }
// }

//
//     const features = new ApiFeatures(Tour.find(), req.query)
//       .filter()
//       .limitFields()
//       .paginate();
//     // const tour = await query;
//     const tour = await features.query;

//     res.json({
//       status: "Success",
//       results: tour.length,
//       data: {
//         getdata: tour,
//       },
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };

// POST API

// using factory function to creat tour
exports.creatTour = handlersFactory.creatOne(Tour);
// exports.creatTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   // console.log("tourcontroller");
//   res.status(201).json({
//     status: "Sucess",
//     data: {
//       tour: newTour,
//     },
//   });
// });  <---- ----
// try {
//   // const newTour = await Tour.create(req.body);
//   // res.status(201).json({
//   //   status: "Sucess",
//   //   data: {
//   //     tour: Tour,
//   //   },
//   // });
// }
// catch (error) {
//   res.status(404).json({
//     status: "operation failed",
//     message: "Data not created",
//   });
// }
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// GET API usnig parameters
exports.getTourById = handlersFactory.getOne(Tour, {
  path: "reviews",
  select: "-_id",
});
//  below is without factory function code.
// exports.getTourById = catchAsync(async (req, res, next) => {
//   // try {
//   // console.log(req.params.id);
//   const tour = await Tour.findOne({ _id: req.params.id }).populate({
//     path: "reviews",
//     select: "-_id",
//   });
//   //  to populate directly from here
//   // const tour = await Tour.findOne({ _id: req.params.id }).populate("guides");
//   // console.log(tour);
//   if (!tour) {
//     return next(new AppError("Tour not found", 404));
//   }
//   // console.log(tour);
//   // console.log(req.params.id);

//   res.json({
//     status: "Success",

//     data: {
//       getdata: tour,
//     },
//   });
//   // } catch (err) {
//   //   console.log(err);
//   //   res.json({
//   //     status: "Failed",
//   //   });
//   // }
// });

// PATCH API usnig params===================================
exports.updateTour = catchAsync(async (req, res, next) => {
  console.log("in update handler");
  const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "Sucess",
    data: {
      tour: newTour,
    },
  });
});
// using factory function instead
// exports.updateTour = handlersFactory.updateOne(Tour);

// PUT API usnig params
// app.put("/api/v1/data/:id/:x?", (req, res) => {
//   const id = req.params.id * 1;
//   const dataById = myData.find((el) => el.id === id);

//   if (!dataById) {
//     return res.status(404).json({
//       status: "operation failed",
//       message: "location no exist ",
//     });
//   }

//   res.status(200).json({
//     status: "Success..............",
//     data: {
//       dataById,
//       message: "data updated ",
//     },
//   });
// });

// Delete Api////////////////////////////////////////////////
// exports.deleteTour = async (req, res) => {
//   try {
//     // const id = req.params.id;
//     await Tour.findByIdAndDelete(req.params.id);
//     console.log("deleted"),
//       res.status(204).json({
//         status: "Sucess",
//         message: "data deleted",
//       });
//   } catch (error) {
//     res.status(404).json({
//       status: "operation failed",
//       message: "Data not deleted",
//     });
//     console.log(error);
//   }
// };
exports.deleteTour = handlersFactory.deleteOne(Tour);
// ////////Agregation Pipline/////////////////With match& Group
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { rating: { $gte: 4 } },
      },

      // {
      //   $group: {
      //     _id: "$name",
      //     // _id: { $toUpper: "$name" },
      //     numTours: { $sum: 1 },
      //     numRating: { $sum: "$rating" },
      //     avgRating: { $avg: "$rating" },
      //     avgPrice: { $avg: "$price" },
      //     minPrice: { $min: "$price" },
      //     maxPrice: { $max: "$price" },
      //   },
      // },
      // {
      //   $sort: { avgPrice: -1 }, //here we use -1 for decending, we can use 1 for accending
      // },
      // {
      //   $match: { _id: { $ne: "Zahid Saab" } },
      // },
    ]);
    res.status(200).json({
      status: "Sucess",
      data: {
        stats,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "operation failed",
      message: error,
    });
  }
};

// ////////Agregation Pipline/////////////////With match& Group

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  console.log(req.query.year * 1);
  const year = req.query.year * 1;
  const page = req.query.page * 1;
  const limit = req.query.limit * 1;
  const skip = (page - 1) * limit;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDate",
    },

    {
      $match: {
        startDate: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: "$startDate" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },

    {
      $project: {
        numTourStarts: 0,
        _id: 0,
      },
    },

    {
      $sort: {
        numTourStarts: -1,
      },
    },
    // {
    //   // $facet: {
    //   //   // metadata: [{ $count: "total" }, { $addFields: { page: 3 } }],
    //   //   data: [{ $skip: 1 }, { $limit: 1 }],
    //   // },
    //   $data: [{ $skip: 1 }, { $limit: 1 }],
    // },
    //====================
    // pagination in aggregation
    // {
    //   $limit: limit,
    // },
    // {
    //   $skip: skip,
    // },
  ]);

  res.status(200).json({
    status: "Sucess",
    data: {
      plan,
    },
  });
});
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// ========= Finding Tours within a specific distence==========

exports.getTourWithIn = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const radius = unit === "mi" ? distance / 3963.3 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        "please provide latitude and longitude in format lat,lng",
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// ===== Finding distance of a tour from certain point . ( geospatial aggregation)
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const multiplier = unit === "mi" ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        "please provide latitude and longitude in format lat,lng",
        400
      )
    );
  }
  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",

    data: {
      data: distance,
    },
  });
});
