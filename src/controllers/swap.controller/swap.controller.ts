import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import crypto from 'crypto';
import { CustomRequest } from '../../middlewares/auth';
import { Response } from 'express';
import Stripe from 'stripe';
import { ApiKey } from '../../models/user/apiKey.model';
import { verifyEtherTransaction } from '../../utils/verifyEthTransaction';
import { EventLog } from 'src/models/user/event-log.model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const swapToFiat = async (req: CustomRequest, res: Response) => {
  const {
    txHash,
    walletAddress,
    quantity,
    apiKey,
    bankAccountId
  } = req.body
  if (!txHash || walletAddress || !quantity || !apiKey || !bankAccountId) {
    return res.status(400).send({ error: "txHash an wallet address are required" })
  }
  try {
    const url = process.env.NODE_ENV === "development" ? process.env.ETH_TEST_NETWORK : process.env.ETH_NETWORK
    const tokenAddress = process.env.NODE_ENV === "development" ? process.env.USDE_SEPOLIA_CONTRACT_ADDRESS : process.env.USDE_MAINNET_CONTRACT_ADDRESS
    const response = await verifyEtherTransaction(
      tokenAddress!,
      18,
      txHash,
      url!,
      walletAddress,
      quantity
    )

    if (!response) {
      return res.status(400).send({ error: "Transaction not confirmed" })
    }

    const api = await ApiKey.findOne({ publicKey: apiKey })
    if (!api) {
      throw new Error("Invalid API Key")
    }
    const eventLog = new EventLog({
      user: api.user,
      eventType: "payment",
      walletAddress,
      amount: quantity
    })
    await eventLog.save()

    const payout = await stripe.payouts.create({
      amount: quantity * 100, // amount in cents
      currency: 'usd',
      destination: bankAccountId,
    });

    return res.status(200).send({ success: true, payout });

  } catch (error) {
    return res.status(500).send({ error: "Something went wrong" })
  }
}