import bcrypt from 'bcryptjs';
import { Request, Response } from "express";
import * as paseto from "paseto";
import { CustomRequest } from "../../middlewares/auth";
import { OtpTypeEnum } from "../../models/user/otp.model";
import { User } from "../../models/user/user.model";
import { generateNumberString } from "../../utils/randomGenerator";
import UserServices from "../../services/user.services";
import { validatePassword } from "../../utils/validators/authValidators";


export const requestForgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).send({ error: "An email is required" });
    }

    const user = await User.findOne({ email });

    if (user) {
      const token = generateNumberString(6)
      //send email
    }

    return res.status(200).send({ message: `If an account matches the provided account information, an otp will be sent` });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send({ error: "An unexpected error occurred" });
  }
}

export const verifyPasswordChangeOtp = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  try {
    if (!email || !code) {
      return res.status(400).send({ error: "email and code are required" });
    }
    const otp = await UserServices.getOtpByCode(code);
    if (!otp) {
      return res.status(400).send({ error: "Invalid code" });
    }
    if (!otp.isActive) {
      return res.status(400).send({ error: "Code already used" });
    }
    if (otp.type !== OtpTypeEnum.PASSWORD_RESET) {
      return res.status(400).send({ error: "Invalid code" });
    }

    if (otp.expiresIn < new Date()) {
      return res.status(400).send({ error: "Expired code" });
    }

    if (otp.user.email === email) {
      otp.isActive = false;
      await otp.save();
      const { V4: { sign } } = paseto
      const resetToken = await sign(
        { email, timestamp: Date.now() },
        process.env.PASETO_SECRET_KEY as string
      );
      return res.status(200).send({ message: "Valid code", data: { token: resetToken } });
    }
    return res.status(400).send({ error: "Invalid code" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send({ error: "An unexpected error occurred" });
  }
}

export const changePassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  try {
    if (!token || !password) {
      return res.status(400).send({ error: "token and password are required" });
    }
    const { V4: { verify } } = paseto
    const decoded: any = await verify(token, process.env.PASETO_PUBLIC_KEY as string)
    if (Date.now() - decoded.timestamp > 15 * 60 * 1000) {
      return res.status(400).send({ error: "Expired token" });
    }
    await UserServices.changePassword(decoded.email, password);
    return res.status(200).send({ error: "Password reset successful" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send({ error: "An unexpected error occurred" });
  }
}

export const resetPassword = async (req: CustomRequest, res: Response) => {
  const { oldPassword, password } = req.body
  try {

    if (!oldPassword || !password) {
      return res.status(400).send({ error: "oldPassword and newPassword are required" })
    }

    //validate newPassword
    const { error } = validatePassword({ password });
    if (error) {
      return res.status(400)
        .send(
          {
            message: "Password must be minimum of 8 characters with at least one lowercase letter, one uppercase letter one digit one special character"
          })
    }
    const user = await User.findOne({ _id: req.user!._id })

    const isMatch = await bcrypt.compare(oldPassword, user!.password)
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid old password" })
    }
    req.user!.password = password;
    await req.user!.save()
    return res.status(200).send({ message: "Password reset successful" })

  } catch (error) {
    console.error(error.message);
    return res.status(500).send({ error: "An unexpected error occurred" });
  }
}