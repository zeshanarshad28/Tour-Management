const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Please enter name"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      require: [true, "must enter email"],
      lowercase: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    password: {
      type: String,
      require: [true, "must enter password"],
      minlength: 8,
      select: false,
    },
    confirmPassword: {
      type: String,
      require: true,
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Passwords not matched",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ["user", "guide", "lead-guide", "admin"],
        message: "Enter valid role ",
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
userSchema.pre("save", async function (next) {
  //only run this function if password id actually modified
  if (!this.isModified("password")) return next();
  // Hash the password with cost
  this.password = await bcrypt.hash(this.password, 12);
  // remove(stop) the confirmPassword to store in db. require means necessary to input not to save in db.
  this.confirmPassword = undefined;
  next();
});
// password Tester
userSchema.methods.correctPassword = async function (
  passwordByUser,
  passwordInDb
) {
  return await bcrypt.compare(passwordByUser, passwordInDb);
};

// ========method to protect routes verifies all about token

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// password reset - generate token for password reset
// userSchema.methods.creatPasswordResetToken = function () {
//   console.log("halu");
// };
userSchema.methods.creatPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
// update "passwordChangedAt value in DB whenever we update password "
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; //here -1000 mili seconds is to make sure that it will not creat any problem in login as some times that gets this
  next();
});

// Middleware to only get active=true users
userSchema.pre(/^find/, function (next) {
  // here "this" points to the current property
  this.find({ active: true });
  next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
