import bcrypt from 'bcryptjs';
import mongoose, { Document, Model, Schema } from 'mongoose';
import * as paseto from 'paseto';
import { v4 as uuidv4 } from 'uuid';

export enum UserStatusEnum {
  ACTIVE = 'active',
  BANNED = 'banned',
  DEACTIVATED = 'deactivated',
  PENDING = 'pending'
}

export enum UserRoleEnum {
  USER = "user",
  ADMIN = "admin",
  SUPERADMIN = "superadmin"
}

interface IUserModel extends Model<IUser> {
  findByCredentials: (
    email: string,
    password: string,
    userAGent: any,
    ipAddress: any) => Promise<IUser>;
}

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  password: string;
  status: UserStatusEnum;
  role: UserRoleEnum;
  permissions: any;
  isRoot: boolean;
  createdAt: Date;
  signOutTime: Date;
  lastLoginTime: Date;
  notificationSettings: any;
  generateAuthToken(): Promise<string>;
  checkAccountStatus(): void;
}

const UserSchema: Schema = new Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  firstName: {
    type: String,
    maxlength: 255,
  },
  lastName: {
    type: String,
    maxlength: 255,
  },
  email: {
    type: String,
    maxlength: 255
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    maxlength: 255,
  },
  status: {
    type: String,
    enum: Object.values(UserStatusEnum),
    default: UserStatusEnum.ACTIVE,
    required: true,
  },
  role: {
    type: String,
    default: UserRoleEnum.USER,
  },
  permissions: {
    type: Map,
    of: Boolean,
  },
  notificationSettings: {
    type: Map,
    of: Boolean,
  },
  isRoot: {
    type: Boolean,
    default: false
  },
  signOutTime: Date,
  lastLoginTime: Date,
  restrictedCountry: {
    type: Boolean,
    default: false
  },
  webhookUrl: {
    type: String,
    default: ''
  },
  redirectUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
});

//hide private data

//Generate auth token
UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const { V4: { sign } } = paseto
  const accessToken = await sign(
    { _id: user._id.toString(), type: 'access', issuedAt: Date.now() },
    process.env.PASETO_SECRET_KEY as string,
    { expiresIn: '7d' }
  );
  const refreshToken = await sign(
    { _id: user._id.toString(), token: uuidv4(), type: 'refresh' },
    process.env.PASETO_SECRET_KEY as string,
    { expiresIn: '7d' }
  );
  await user.save();
  return { accessToken, refreshToken };
};
UserSchema.methods.checkAccountStatus = function () {
  const user = this;
  if (user.status === UserStatusEnum.BANNED || user.status === UserStatusEnum.DEACTIVATED) {
    throw new Error('Your account is disabled, please contact support for further assistance');
  }
};

//login in users
UserSchema.statics.findByCredentials = async (email, password, userAgent, ipAddress,) => {
  const user = await User.findOne({ email })

  if (!user) {
    throw new Error('User is not registered')
  }
  const isMatch = await bcrypt.compare(password, user.password)
  const deviceInfo = `Browser: ${userAgent.browser}, Version: ${userAgent.version}, OS: ${userAgent.os}, Platform: ${userAgent.platform}`;
  if (!isMatch) {
    throw new Error('Credentials do not match')
  }
  return user
}

//Hash plain password before saving
UserSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(8);
    user.password = await bcrypt.hash(user.password as string, salt)
  }
  next()
})

// Ensure virtual fields are included in JSON output
UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });


const User: IUserModel = mongoose.model<IUser, IUserModel>('User', UserSchema);

export { User };

