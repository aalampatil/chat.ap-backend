import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { userModel } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { log } from "console";

const options = {
  httpOnly: true,
  secure: true, // true if using HTTPS
  sameSite: "none", // required when frontend is on another domain
};

//use raw if you are not working with file
//formdata works when you deal with multipart data
//json error in column x or line y, it might be because route is not defined or may be some typo
//undefined error might be because of may be you forget to send required data while create entry in db model, or may be becuase of some typos in defining parameters or may be you have called methods on DB model on the document

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const signup = asyncHandler(async (req, res) => {
  //console.log("req.body", req.body);
  const { fullName, email, password, bio } = req?.body;

  if (
    [fullName, email, password, bio].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = await userModel.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "user already exists with these credentials");
  }

  const user = await userModel.create({
    fullName,
    email,
    password,
    bio,
  });

  const signedUpUser = await userModel
    .findById(user._id)
    .select("-password -refreshToken");

  if (!signedUpUser) {
    throw new ApiError(500, "failed to sign up");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, signedUpUser, "signed up successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "missing email");
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    throw new ApiError(400, "user does not exist with this email");
  }
  if (user) {
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(400, "invalid password");
    }
  }

  const loggedInUser = await userModel
    .findById(user._id)
    .select("-password -refreshToken");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );



  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "logged in successfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "logged out successfully"));
});

const updateprofile = asyncHandler(async (req, res) => {
  const { bio, fullName } = req.body;
  console.log("req.body", req.body);
  console.log("req.file", req.file);
  
  

  if (!fullName || fullName.trim() === "") {
    throw new ApiError(400, "Full name is required");
  }

  let profilePicLocalPath;

  if (req.file && req.file.path) {
    profilePicLocalPath = req.file.path;
  }

  const profilePicture = await uploadOnCloudinary(profilePicLocalPath);
  //console.log("url", profilePicture);

  const user = await userModel.findById(req.user?._id);

  if (profilePicture && user?.profilePicturePublicId) {
    await deleteFromCloudinary(user.profilePicturePublicId);
  }

  const updatedProfile = await userModel
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullName,
          bio,
          profilePicture: profilePicture?.url || user.profilePicture || "",
          profilePicturePublicId:
            profilePicture?.public_id || user.profilePicturePublicId || "",
        },
      },
      { new: true }
    )
    .select("-password -refreshToken");

  if (!updatedProfile) {
    throw new ApiError(500, "failed to update profile");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "profile updated"));
});

const checkAuth = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user feteched successfully"));
});

export { signup, login, logout, updateprofile, checkAuth };
