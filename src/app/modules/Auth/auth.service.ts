/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from "@/shared/prisma";
import { ICreateUser, ILoginUser } from "./auth.interface";
import AppError from "@/app/errors/AppError";
import { StatusCodes } from "http-status-codes";
import config from "@/config";
import bcrypt from "@/libs/bcrypt";
import { UserStatus } from "@prisma/client";
import { jwtHelpers } from "@/helpers/jwtHelpers";
import { JwtPayload, Secret } from "jsonwebtoken";
import isPasswordMatched from "@/utils/isPasswordMatched";
import isUserExistsByEmail from "@/utils/isUserExistsByEmail";
import { sendEmail } from "@/utils/sendEmail";

const registerUser = async (payload: ICreateUser) => {
  const isUserExist = await isUserExistsByEmail(payload.email);

  if (isUserExist) {
    throw new AppError(StatusCodes.CONFLICT, "User already exist!");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );
  const result = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });
  const html = `
  <html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to Our Platform!</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <table align="center" width="600" style="background: white; padding: 20px; border-radius: 10px;">
    <tr>
      <td align="center">
        <h2 style="color: #333;">Welcome to Our Platform, ${result?.name}! 🎉</h2>
        <p>We are excited to have you on board. You can now explore and enjoy our services.</p>
        <p>Need help? <a href=${`mailto:${config.emailSender.email}`} style="color:rgb(0, 0, 0);">Contact Support</a></p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  sendEmail("Welcome Onboard", result?.email, html);
  return {
    id: result?.id,
    name: result?.name,
    email: result?.email,
    role: result?.role,
  };
};

const loginUser = async (payload: ILoginUser) => {
  // checking if the user exists
  const user = await isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  // checking if the user is blocked
  const isBlocked = user?.status === UserStatus.BLOCKED;

  if (isBlocked) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "This user is blocked!");
  }

  // checking if the password is correct
  if (!(await isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  // create token and send to the client
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as string,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.jwt_access_secret as Secret,
    config.jwt.jwt_access_expires_in as string,
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expires_in as string,
  );
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as string,
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_refresh_secret as string,
    );
  } catch (err: any) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as string,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.jwt_access_secret as Secret,
    config.jwt.jwt_access_expires_in as string,
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as string,
    accessToken,
  };
};

const forgetPassword = async (email: string) => {
  // checking if the user is exist
  const user = await isUserExistsByEmail(email);

  if (!user || user?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found !");
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === UserStatus.BLOCKED) {
    throw new AppError(StatusCodes.FORBIDDEN, "This user is blocked!");
  }

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  const resetToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string,
  );

  const resetUILink = `${config.reset_pass_ui_link}?id=${user.id}&token=${resetToken}`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #000;
        }
        .message {
            font-size: 16px;
            color: #333;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            background: #000;
            color: #ffffff !important;
            padding: 12px 20px;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
            border-radius: 5px;
            transition: 0.3s;
        }
        .btn:hover {
            background: #000;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #888;
        }
    </style>
  </head>
  <body>
    <div class="container">
        <div class="logo">FreelanceFlow</div>
        <p class="message">We received a request to reset your password. Click the button below to set a new password.</p>
        <a href=${resetUILink} target="_blank" class="btn">Reset Password</a>
        <p class="message">The Link will be valid for 10 minutes.</p>
        <p class="message">If you didn't request this, you can ignore this email.</p>
        <p class="footer">&copy; ${new Date().getFullYear()} FreelanceFlow. All rights reserved.</p>
    </div>
  </body>
 </html>
  `;

  sendEmail("Reset your password", user?.email, html);
  return {
    resetToken: resetToken,
  };
};

const resetPassword = async (
  payload: { email: string; newPassword: string },
  token: string,
) => {
  // checking if the given token is valid
  let decoded: JwtPayload = {} as JwtPayload;
  try {
    decoded = jwtHelpers.verifyToken(
      token,
      config.jwt.reset_pass_secret as Secret,
    );
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new AppError(StatusCodes.FORBIDDEN, "Token is expired!");
    }
    throw new AppError(StatusCodes.FORBIDDEN, "Try again");
  }

  // checking if the user is exist
  const user = await isUserExistsByEmail(payload?.email);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === UserStatus.BLOCKED) {
    throw new AppError(StatusCodes.FORBIDDEN, "This user is blocked!");
  }

  if (payload?.email !== decoded.email) {
    throw new AppError(StatusCodes.FORBIDDEN, "Unauthorized Attempt!");
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: {
      email: decoded.email,
      role: decoded.role,
    },
    data: {
      password: newHashedPassword,
    },
  });

  // create token and send to the client
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as string,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.jwt_access_secret as Secret,
    config.jwt.jwt_access_expires_in as string,
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expires_in as string,
  );
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as string,
    accessToken,
    refreshToken,
  };
};

const changePassword = async (
  payload: {
    currentPassword: string;
    newPassword: string;
  },
  user: any,
) => {
  const { currentPassword, newPassword } = payload;

  const userForCheck = await prisma.user.findUniqueOrThrow({
    where: { id: user?.id, isDeleted: false },
  });

  // Check if the current password matches
  if (!userForCheck?.password) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Password not found");
  }

  if (!(await isPasswordMatched(currentPassword, userForCheck.password))) {
    return {
      success: false,
      message: "Current password is incorrect",
    };
  }

  // Update the password
  const hashedNewPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  return {
    success: true,
    message: "Password changed successfully",
  };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }

  return user;
};


export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
  forgetPassword,
  resetPassword,
  changePassword,
  getMe
};
