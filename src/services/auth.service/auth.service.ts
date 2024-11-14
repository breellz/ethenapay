
import { IUser, User, UserRoleEnum } from '../../models/user/user.model';


export interface ISignInData {
  password: string;
  email: string;
  userAgent: any;
  ipAddress?: string;
}

export interface ISignUpData {
  password: string;
  email: string;
  userType: UserRoleEnum
}



export const signUp = async (data: ISignUpData) => {
  try {

    const user = new User({
      ...data,
      role: data.userType
    });
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};


export const getUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({ email })
    return user
  } catch (error) {
    throw error
  }
}


export const signIn = async (data: ISignInData) => {
  try {
    const user = await User.findByCredentials(data.email, data.password, data.userAgent, data.ipAddress);
    user.checkAccountStatus();
    const token = await user.generateAuthToken();
    await user.save()
    return { user, token };
  } catch (error) {
    throw error;
  }
}

export const signOut = async (user: IUser, authToken: string, userAgent: any, ipAddress: string) => {
  try {
    user.signOutTime = new Date();
    const deviceInfo = `Browser: ${userAgent.browser}, Version: ${userAgent.version}, OS: ${userAgent.os}, Platform: ${userAgent.platform}`;
    await user.save()
    return user
  } catch (error) {
    throw error
  }

}
