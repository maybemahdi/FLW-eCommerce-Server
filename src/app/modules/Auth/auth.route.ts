import { Router } from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "@/app/middlewares/validateRequest";
import {
  ChangePasswordValidation,
  ForgetPasswordValidationSchema,
  LoginUserValidationSchema,
  RegisterUserValidationSchema,
  ResetPasswordValidationSchema,
} from "./auth.validation";
import auth from "@/app/middlewares/auth";
import { UserRole } from "@prisma/client";

const AuthRoutes = Router();

AuthRoutes.post(
  "/register",
  validateRequest(RegisterUserValidationSchema),
  AuthController.registerUser,
);

AuthRoutes.post(
  "/login",
  validateRequest(LoginUserValidationSchema),
  AuthController.loginUser,
);

AuthRoutes.get("/refresh-token", AuthController.refreshToken);

AuthRoutes.post(
  "/forgot-password",
  validateRequest(ForgetPasswordValidationSchema),
  AuthController.forgetPassword,
);

AuthRoutes.patch(
  "/reset-password",
  validateRequest(ResetPasswordValidationSchema),
  AuthController.resetPassword,
);

AuthRoutes.patch(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.USER),
  validateRequest(ChangePasswordValidation),
  AuthController.changePassword,
);

AuthRoutes.get(
  "/get-me",
  auth(UserRole.ADMIN, UserRole.USER),
  AuthController.getMe,
);

export default AuthRoutes;
