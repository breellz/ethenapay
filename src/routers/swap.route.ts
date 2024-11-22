
import express from "express";
import SwapController from "../controllers/swap.controller";

export const swapRouter = express.Router();

swapRouter.post("/swap-to-fiat", SwapController.swapToFiat);

