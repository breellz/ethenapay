
import express from "express";
import UserController from '../controllers/user.controller'
import { Auth } from "../middlewares/auth";

export const userRouter = express.Router();

userRouter.post("/regenerate-api-keys", Auth, UserController.regenerateApiKeys);

