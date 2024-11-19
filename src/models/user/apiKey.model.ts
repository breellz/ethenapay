import mongoose, { Document, Model, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface IApiKey extends Document {
  user: string
  publicKey: string;
  secretKey: string;
  expiresAt: Date;
  revoked: boolean;
}

const ApiKeySchema: Schema = new Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  user: {
    type: String,
    ref: 'User',
    required: true
  },
  publicKey: {
    type: String,
    required: true,
    unique: true
  },
  secretKey: {
    type: String,
    required: true,
    unique: true
  },
  revoked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


const ApiKey = mongoose.model<IApiKey>('ApiKey', ApiKeySchema);

export { ApiKey };