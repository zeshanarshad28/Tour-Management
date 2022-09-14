const User = require("../models/userModel");
const multer = require("multer");
const sharp = require("sharp");
const AppErr = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const handlersFactory = require("./handlersFactory");
const { promisify } = require("util");
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
// :::::::::::::: MULTER :::::::::::::::::::::::
// multer storage to store image in disk....
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/user");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

// multer storage to store image in memory( as a buffer)
// const multerStorage = multer.memoryStorage();

// multer filter to check if the uploaded file is an image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppErr("not and image! please upload an image file.", 400));
  }
};
// configuring the multer.
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
// uploading the image
const uploadPhoto = upload.single("photo");
// Re-size user photos
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  console.log(`req.file is: ${req.file}`);
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  console.log(`Resize is working and file name is: ${req.file.filename}`);

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/user/${req.file.filename}.jpeg`);
  next();
});
// Get Me Middlware
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  console.log("getMe working");
  next();
};
// Getting  user by id
exports.getUser = handlersFactory.getOne(User);
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// ======  API for updating already loged in user====================
exports.updateMe = catchAsync(async (req, res, next) => {
  const a = await promisify(uploadPhoto)(req, res, next);
  // console.log(req.body);
  // console.log(req.file);`
  //  1) creat error if user posted password
  console.log(`a::::${a}`);

  if (req.body.password || req.body.confirmPassword) {
    return next(new AppErr("This route is not for update password", 400));
  }
  // 2) Update user document
  const filteredBody = filterObj(req.body, "name", "email");
  // updating the photo name in db
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }
  // console.log(`filename::${req.file.filename}`)
  // console.log(req.user.id);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  console.log(filteredBody);
  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});
// const fs = require("fs");
// const myData = JSON.parse(fs.readFileSync(`${__dirname}/./../data/mydata.json`))

// exports.getUser = (req, res) => {
//   res.json({
//     status: "Success..............",
//     results: myData.length,
//     data: {
//       getdata: myData,
//     },
//   });

//   console.log(myData);
// };

// // POST API

// exports.addUser = (req, res) => {
//   // console.log(req.body);
//   const newId = myData[myData.length - 1].id + 1;
//   const newData = Object.assign({ id: newId }, req.body);
//   myData.push(newData);
//   fs.writeFile(
//     `${__dirname}/data/mydata.json`,
//     JSON.stringify(myData),
//     (err) => {
//       if (err) throw err;
//       res.status(201).json({
//         status: "success",
//         data: {
//           data: newData,
//         },
//       });
//     }
//   );
// };
// // GET API usnig params
// exports.getUserById = (req, res) => {
//   const id = req.params.id * 1;
//   const dataById = myData.find((el) => el.id === id);
//   if (!dataById) {
//     return res.status(404).json({
//       status: "operation failed",
//       message: "data not found across the given id ",
//     });
//   }
//   res.status(200).json({
//     status: "Success..............",
//     data: {
//       dataById,
//     },
//   });

//   console.log(req.params);
//   console.log(dataById);
// };

// // PATCH API usnig params
// exports.updateUser = (req, res) => {
//   const id = req.params.id * 1;
//   const dataById = myData.find((el) => el.id === id);
//   // const myData= myData.find((el) => el.id === id)=req.data;
//   if (!dataById) {
//     return res.status(404).json({
//       status: "operation failed",
//       message: "data not found across the given id ",
//     });
//   }

//   res.status(200).json({
//     status: "Success..............",
//     data: {
//       dataById,
//       message: "data updated ",
//     },
//   });

//   console.log(req.params);
//   console.log(dataById);
// };

// // PUT API usnig params
// // app.put("/api/v1/data/:id/:x?", (req, res) => {
// //   const id = req.params.id * 1;
// //   const dataById = myData.find((el) => el.id === id);

// //   if (!dataById) {
// //     return res.status(404).json({
// //       status: "operation failed",
// //       message: "location no exist ",
// //     });
// //   }

// //   res.status(200).json({
// //     status: "Success..............",
// //     data: {
// //       dataById,
// //       message: "data updated ",
// //     },
// //   });
// // });

// // Delete Api////////////////////////////////////////////////
// exports.deleteUser = (req, res) => {
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
//       message: "data deleted ",
//     },
//   });
// };

//  $lookup Example
exports.getUserAtAll = async (req, res) => {
  try {
    // simple $looup
    // const allData = await User.aggregate([
    //   {
    //     $match: {},
    //   },
    //   {
    //     $lookup: {
    //       from: "customers",
    //       localField: "name",
    //       foreignField: "name",
    //       as: "newName",
    //     },
    //   },

    //   // {
    //   //   $unwind: "newName",
    //   // },
    // ]);

    // $Perform Multiple Joins and a Correlated Subquery with $lookup
    const allData = await User.aggregate([
      // {
      //   $match: {},
      // },
      {
        $lookup: {
          from: "customers",
          let: { userName: "$name" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$name", "$$userName"],
                    },

                    { $eq: ["$name", "user6"] },
                  ],
                },
              },
            },
          ],
          as: "filtered Data",
        },
      },
    ]);

    // console.log(allData[4].newName[0].createdAt);
    res.status(200).json({
      status: "Sucess",
      data: {
        allData,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "operation failed",
      message: error,
    });
  }
};
// $Facet Example
exports.getAllInOne = async (req, res) => {
  try {
    const allData = await User.aggregate([
      {
        $facet: {
          fromBoth: [
            {
              $match: {},
            },
            {
              $lookup: {
                from: "customers",
                localField: "name",
                foreignField: "name",
                as: "newName",
              },
            },
            // {
            //   $unwind: "newName",
            // },
          ],
          specific: [{ $match: {} }, { $project: { _id: 0 } }],
        },
      },
    ]);
    res.status(200).json({
      status: "Sucess",
      data: {
        allData,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "operation failed",
      message: error,
    });
  }
};

// Deleting the users====================
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false }); // here we use active:false is data we want to update
  res.status(204).json({
    status: "success",
    data: null,
  });
});
