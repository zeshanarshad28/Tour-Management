const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASEE;
const Tour = require("./models/tourModel");
// Strarting database
mongoose.connect(
  DB,
  {
    useNewUrlParser: true,
  },
  () => {
    console.log("connected");
  }
);
// Reading  data from json file

const tours = JSON.parse(fs.readFileSync("./data.json", "utf-8"));

// Importing data to the database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("data saved to db");
  } catch (error) {
    console.log(error);
  }
};
importData();
