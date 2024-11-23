
import express from "express";
import SwapController from "../controllers/swap.controller";
import { Auth } from "../middlewares/auth";

export const swapRouter = express.Router();

swapRouter.post("/swap-to-fiat", Auth, SwapController.swapToFiat);

