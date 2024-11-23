import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface IEventLog extends Document {
  userId: string;
  eventType: string;
  walletAddress: string;
  amount: number;
  from: string;
  to: string;
  txHash: string;
  timestamp: Date;
}

export enum EventTypeEnum {
  SWAP = 'swap',
  PAYMENT = 'payment'
}

const EventLogSchema = new Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  user: {
    type: String,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    enum: Object.values(EventTypeEnum),
    required: true
  },
  walletAddress: { type: String, required: true },
  amount: { type: Number, required: true },
  from: { type: String, },
  to: { type: String, },
  txHash: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const EventLog = model<IEventLog>('EventLog', EventLogSchema);

export { EventLog };