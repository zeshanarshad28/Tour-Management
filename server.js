const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
// handling uncatched exceptions rejection
// process.on("uncaughtException", (err) => {
//   console.log(err.name, err.message);
//   // console.log(err);
//   console.log("Uncaught Exception. Shutting down...");
//   process.exit(1);
// });

const app = require("./app");

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );
const DB = process.env.DATABASEE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(
    `App running on port ${port}... and runing in ${process.env.NODE_ENV} Environment`
  );
});
// handling un-handled rejection
// process.on("unhandledRejection", (err) => {
//     console.log(err.name, err.message);
//     console.log("Unhandled rejection. Shutting down...");
//     server.close(() => {
//       process.exit(1);
//     });
//   });
