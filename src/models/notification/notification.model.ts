import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export enum Priority {
  LOW = 'low',
  HIGH = 'high',
  NORMAL = 'normal',
}

export interface INotification extends Document {
  user: string;
  priority: Priority;
  message: string;
  relatedId?: string;
  relatedType?: string;
  isOpened: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  user: {
    type: String,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: Object.values(Priority),
    default: Priority.LOW
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: String
  },
  relatedType: {
    type: String
  },
  isOpened: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Notification = model<INotification>('Notification', notificationSchema);
export { Notification }