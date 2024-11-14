
import express from "express";
import AuthController from "../controllers/auth.controller";
import { Auth } from "../middlewares/auth";

export const authRouter = express.Router();

authRouter.post("/sign-up", AuthController.signUp);
authRouter.post("/sign-in", AuthController.signIn);
authRouter.post("/sign-out", Auth, AuthController.signOut);
authRouter.post(
  "/request-forgot-password",
  AuthController.requestForgotPassword
);
authRouter.post(
  "/verify-password-change-otp",
  AuthController.verifyPasswordChangeOtp
);
authRouter.patch("/change-password", AuthController.changePassword);
authRouter.patch("/reset-password", Auth, AuthController.resetPassword);
authRouter.post(
  "/request-email-verification",
  Auth,
  AuthController.requestEmailVerification
);
authRouter.post("/verify-email", Auth, AuthController.verifyEmail);

