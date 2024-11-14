import { Schema, Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IExpoToken extends Document {
  user: string;
  expoToken: string;
  sessionID?: string;
}

const ExpoTokenSchema = new Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  user: {
    type: String,
    ref: 'User',
    required: true
  },
  expoToken: {
    type: String,
    required: true
  },
  sessionID: {
    type: String,
    required: false
  },
});

const ExpoToken = model<IExpoToken>('ExpoToken', ExpoTokenSchema);

export { ExpoToken }