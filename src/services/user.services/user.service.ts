import { Otp, OtpTypeEnum } from '../../models/user/otp.model';
import { User } from '../../models/user/user.model';

export const getOtpByCode = async (code: string) => {
  try {
    const otp = await Otp.findOne({ code }).populate('user');
    return otp
  } catch (error) {
    throw error
  }
};

export const changePassword = async (email: string, password: string) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    user.password = password;
    await user.save();
  } catch (error) {
    throw error
  }
}

export const getUserById = async (userId: string) => {
  try {
    return await User.findOne({ _id: userId })
  } catch (error) {
    throw error
  }
}

export const createOtp = async (otp: { userId: string, token: string, type: OtpTypeEnum }) => {
  const { userId, token, type } = otp;
  try {
    const existingOtp = await Otp.findOne({ user: userId });
    if (existingOtp) {
      existingOtp.code = token;
      existingOtp.type = type;
      existingOtp.isActive = true;
      existingOtp.expiresIn = new Date(Date.now() + 500000);
      await existingOtp.save();
      return
    } else {
      const otp = new Otp({
        user: userId,
        code: token,
        type,
        isActive: true,
        expiresIn: new Date(Date.now() + 500000)
      });
      await otp.save();
      return
    }
  } catch (error) {
    throw error
  }
}

export const getOtpByToken = async (userId: string, token: string) => {
  try {
    return await Otp.findOne({ user: userId, code: token })
  } catch (error) {
    throw error
  }
}