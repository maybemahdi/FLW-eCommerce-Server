import config from "@/config";
import catchAsync from "@/shared/catchAsync";
import sendResponse from "@/shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "./auth.service";
import AppError from "@/app/errors/AppError";

const registerUser = catchAsync(async (req, res) => {
  const result = await AuthService.registerUser(req.body);
  sendResponse(res, {
    success: true,
    message: "User created successfully!",
    statusCode: StatusCodes.CREATED,
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);
  const { refreshToken, accessToken, ...user } = result;

  // Expire the previous token if it exists
  if (req.cookies.token) {
    res.clearCookie("token");
  }

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: config.node_env === "production",
    sameSite: config.node_env === "production" ? "none" : "strict",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.node_env === "production",
    sameSite: config.node_env === "production" ? "none" : "strict",
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Logged in successfully!",
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);

  const { accessToken, ...user } = result;

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Token Refreshed!",
    data: {
      user,
      accessToken,
    },
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const email = req?.body?.email;
  const result = await AuthService.forgetPassword(email);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Password Reset link has been sent!",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Unauthorized Attempt!");
  }

  const { accessToken, refreshToken, ...user } =
    await AuthService.resetPassword(req.body, token);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Password reset successfully!",
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await AuthService.changePassword(req.body, req.user);
  sendResponse(res, {
    success: result?.success,
    statusCode: StatusCodes.OK,
    message: result?.message,
    data: null,
  });
});

const getMe = catchAsync(async (req, res) => {
  const result = await AuthService.getMe(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User profile retrieved successfully",
    data: result,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  refreshToken,
  forgetPassword,
  resetPassword,
  changePassword,
  getMe,
};
