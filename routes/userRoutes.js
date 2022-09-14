const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers");
const authControllers = require("../controllers/authControllers");

// Auth routes
router.post("/api/v1/user/signup", authControllers.signup);
router.post("/api/v1/user/login", authControllers.login);
router.post("/api/v1/user/forgotPassword", authControllers.forgotPassword);
router.patch(
  "/api/v1/user/resetPassword/:token",
  authControllers.resetPassword
);

router.use(authControllers.protect); // it will work as middlware for all the below routes to authenticate them.
router.patch(
  "/api/v1/user/updateMyPassword",
  // authControllers.protect,
  authControllers.updatePassword
);

// Routes according to REST

// router
//   .route("/api/v1/user")
//   .get(userControllers.getUser)
//   .post(userControllers.addUser);
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.patch(
  "/api/v1/user/updateMe",
  authControllers.protect,
  // userControllers.uploadPhoto, // runing the middlware for image upload
  userControllers.resizeUserPhoto,
  userControllers.updateMe
);
router.delete(
  "/api/v1/user/deleteMe",
  // authControllers.protect,
  userControllers.deleteMe
);
router.get(
  "/api/v1/user/getMe",
  // authControllers.protect,
  userControllers.getMe,
  userControllers.getUser
);

// router;
//   .route("/api/v1/user/:id/:subId?")
//   .delete(userControllers.getUserById)
//   .patch(userControllers.updateUser)
//   .get(userControllers.getUserById);

router.use(authControllers.restrictTo("admin")); // This midlware will only allow admin to use below all routes.
router.get("/api/v1/user/getUserAtAll", userControllers.getUserAtAll);
router.get("/api/v1/user/getAllInOne", userControllers.getAllInOne);
module.exports = router;
