import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../service/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.accessToken = accessToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};
const options = {
  httpOnly: true,
  secure: true,
};

const registerUser = async (req, res) => {
  const { email, username, password } = req.body;
  if ([username, email, password].some((field) => field?.trim === "")) {
    throw new ApiError(400, "All Fields are required");
  }
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(409, "Email or username already in use");
  }
  const imageLocalPath = req.files?.image[0]?.path;
  const image = await uploadOnCloudinary(imageLocalPath);

  if (!image) {
    throw new ApiError(400, "Image is required");
  }
  const user = await User.create({
    username,
    email,
    password,
    image: image?.url || "",
  });

  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createUser) {
    throw new ApiError(500, "Something went wrong while registering");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createUser, "user created successfully"));
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Email doesnt exist");
  }
  const isValidatePw = await user.isPasswordCorrect(password); //check back later for user pw

  if (!isValidatePw) {
    throw new ApiError(400, "Invalid password");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh token");
    }
    if (incomingRefreshToken !== user?._id) {
      throw new ApiError(401, "Refresh token expired");
    }
    const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id);
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(new ApiResponse(200, {
        accessToken, refreshToken: newRefreshToken
      }, "Access token refreshed successfully"));
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token')
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
