import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import crypto from 'crypto';
import { CustomRequest } from '../../middlewares/auth';
import { Response } from 'express';
import { ApiKey } from '../../models/user/apiKey.model';

export function generateSecretKey() {
  return crypto.randomBytes(32).toString('hex');
}

export const regenerateApiKeys = async (req: CustomRequest, res: Response) => {

  try {
    console.log(req.user!)
    const publicKey = uuidv4();
    const secretKey = generateSecretKey();

    const newKey = new ApiKey({ user: req.user!._id, publicKey, secretKey });
    await newKey.save();
    return res.status(201).send({
      message: 'API key created',
      data: { publicKey, secretKey }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
}


export const revokeKey = async (req: CustomRequest, res: Response) => {
  const { publicKey } = req.body;
  const key = await ApiKey.findOne({ publicKey });

  if (key) {
    key.revoked = true;
    await key.save();
    return res.status(200).json({ message: 'API key revoked' });
  } else {
    return res.status(404).json({ message: 'API key not found' });
  }
}