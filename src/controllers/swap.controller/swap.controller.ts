import { Response } from 'express';
import Stripe from 'stripe';
import { CustomRequest } from '../../middlewares/auth';
import { ApiKey } from '../../models/user/apiKey.model';
import { EventLog } from '../../models/user/event-log.model';
import { verifyEthenaTransaction } from '../../utils/verifyEthTransaction';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const swapToFiat = async (req: CustomRequest, res: Response) => {
  const {
    txHash,
    walletAddress,
    quantity,
    apiKey,
    bankAccountId
  } = req.body


  if (!txHash || !walletAddress || !quantity || !apiKey || !bankAccountId) {
    return res.status(400).send({ error: "provide all required fields" })
  }
  try {
    const eventLogExists = await EventLog.findOne({ txHash })
    if (eventLogExists) {
      return res.status(400).send({ error: "Transaction already exists" })
    }
    const url = process.env.NODE_ENV === "development" ? process.env.ETH_TEST_NETWORK : process.env.ETH_NETWORK
    const response = await verifyEthenaTransaction(
      18,
      txHash,
      url!,
      walletAddress,
      quantity
    )

    if (!response.success) {
      return res.status(400).send({ error: "Transaction not confirmed" })
    }

    const api = await ApiKey.findOne({ publicKey: apiKey })
    if (!api) {
      throw new Error("Invalid API Key")
    }


    const payout = await stripe.payouts.create({
      amount: quantity * 100, // amount in cents
      currency: 'usd',
      destination: bankAccountId,
    });

    const eventLog = new EventLog({
      user: api.user,
      eventType: "payment",
      walletAddress,
      txHash,
      amount: quantity
    })
    await eventLog.save()

    return res.status(200).send({ success: true, payout: "payout" });

  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: error.raw.message })
  }
}