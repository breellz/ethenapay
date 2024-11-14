
import { Document, Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IUser } from './user.model';
import sendEmail from '../../services/email.service';

export interface IOtp extends Document {
  user: IUser;
  code: string;
  type: OtpTypeEnum
  isActive: boolean;
  expiresIn: Date;
}

export enum OtpTypeEnum {
  EMAIL_VERIFICATION = 'Email Verification',
  PASSWORD_RESET = 'Password Reset',
  PHONE_VERIFICATION = 'Phone Verification',
  ADMIN_LOGIN = "admin login"
}

const otpSchema = new Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  user: {
    type: String,
    ref: 'User',
    required: true,
  },
  code: {
    type: String,
    required: true,
    minlength: 6,
  },
  type: {
    type: String,
    enum: Object.values(OtpTypeEnum),
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresIn: {
    type: Date,
    default: Date.now() + 500000,
  }
}, {
  timestamps: true
})

otpSchema.pre('save', async function (this: IOtp, next) {
  try {
    if (this.isModified('code') && this.type !== OtpTypeEnum.PHONE_VERIFICATION) {
      const populatedDoc = await this.model('Otp').populate(this, { path: 'user' }) as IOtp;
      await sendEmail(
        'otp-verification-mail',
        {
          to: populatedDoc.user.email,
          subject: 'OTP',
          message: `Your OTP is ${this.code}`,
          html: `<p>Your OTP is <strong>${this.code}</strong></p>`
        }
      )
    }
    next()
  } catch (error) {
    console.log(error)
  }
});

export const Otp = model<IOtp>('Otp', otpSchema);
