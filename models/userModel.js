const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    loginType: {
      type: Number, //0 for google login 1 for basic login
      required: true,
    },
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "Users" }
);

module.exports = mongoose.model("Users", userSchema);
