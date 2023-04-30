const User = require("../../models/userModel");
const { OAuth2Client } = require("google-auth-library");;
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  errorCodes,
} = require("../../utils/constants");

const {
  fillUserDetailsBodyValidation,
  hasFilledDetailsBodyValidation,
  updateRequestBodyValidation,
} = require("./validationSchema");

const client = new OAuth2Client(process.env.CLIENT_ID);
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });


exports.fillUserDetails = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = fillUserDetailsBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  await User.updateOne(
    { _id: req.user._id },
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobileNumber: req.body.mobileNumber,
        regNo: req.body.regNo,
        hasFilledDetails: true,
      },
    }
  );

  res.status(201).json({
    message: "User Details Filled successfully",
    userId: req.user._id,
  });
});

exports.hasFilledDetails = catchAsync(async (req, res, next) => {
  const { error } = hasFilledDetailsBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  const token = req.body.token;
  const emailFromClient = req.body.email;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  if (!ticket) {
    return next(
      new AppError(
        "Please SignOut and SignIn Again",
        401,
        errorCodes.INVALID_TOKEN
      )
    );
  }

  const { email } = ticket.getPayload();
  if (email !== emailFromClient) {
    return next(
      new AppError(
        "Please SignOut and SignIn Again",
        401,
        errorCodes.INVALID_TOKEN
      )
    );
  }

  const user = await User.findOne({ email: emailFromClient });

  return res.status(201).json({
    message: "Checking User Successfull",
    impetusTeamId: user.impetusTeamId,
    eHackTeamId: user.eHackTeamId,
    innoventureTeamId: user.innoventureTeamId,
    hasFilledDetails: user.hasFilledDetails,
  });
});



//--------------------------------------------------------->

exports.getDetails = catchAsync(async (req, res, next) => {
  // const user = await User.findById(
  //   { _id: req.user._id },
  //   {
  //     email: 1,
  //     firstName: 1,
  //     lastName: 1,
  //     mobileNumber: 1,
  //   }
  // );
  const user = await User.findById({ _id: req.user._id });
  res.status(200).json({
    message: "Getting User Details Successfull",
    user,
  });
});
