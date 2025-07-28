import { z } from "zod";

export const RegisterUserValidationSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  email: z
    .string({ required_error: "Email is required" })
    .email("Email must be a valid email address"),
  phone: z.string({ required_error: "Phone is required" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),
});

export const LoginUserValidationSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Email must be a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),
});

export const ForgetPasswordValidationSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Email must be a valid email address"),
});

export const ResetPasswordValidationSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Email must be a valid email address"),
  newPassword: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),
});

export const ChangePasswordValidation = z.object({
  currentPassword: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),
  newPassword: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),
});