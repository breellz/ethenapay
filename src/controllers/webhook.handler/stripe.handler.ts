import { Request, Response } from "express";
import Stripe from 'stripe';
import { transferToken } from "./helpers/transferToken";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export class StripeWebhookHandler {
  static async handleSwapCharge(req: any, res: Response) {
    try {
      const sig = req.headers['stripe-signature'];
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET as string);
      } catch (err) {
        console.error('Error processing webhook:', err);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          const amount = paymentIntent.amount;
          const apiKey = paymentIntent.metadata.apiKey;
          const walletAddress = paymentIntent.metadata.walletAddress;
          // credit walletAddress
          await transferToken(apiKey, walletAddress, amount);

          break;
        case 'payment_intent.payment_failed':
          const paymentFailedIntent = event.data.object;
          // Notify the customer that their payment has failed
          break;
        // Handle other event types as needed
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return res.status(200).send()
    } catch (error) {
      console.log(error)
      return res.status(500).send()
    }
  }
}