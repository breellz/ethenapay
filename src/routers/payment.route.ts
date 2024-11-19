
import express from "express";
import { StripeWebhookHandler } from "../controllers/webhook.handler/stripe.handler";

export const paymentRouter = express.Router();

paymentRouter.post("/stripe", StripeWebhookHandler.handleSwapCharge);

