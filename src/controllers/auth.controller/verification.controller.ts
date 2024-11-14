import { Response } from "express";
import { CustomRequest } from "../../middlewares/auth";
import { OtpTypeEnum } from "../../models/user/otp.model";
import UserServices from "../../services/user.services";
import { generateNumberString } from "../../utils/randomGenerator";

export const requestEmailVerification = async (
  req: CustomRequest,
  res: Response
) => {
  const user = req.user!;
  try {

    if (user.isEmailVerified) {
      return res.status(400).send({ error: "Email already verified" });
    }
    const token = generateNumberString(6);
    await UserServices.createOtp({
      userId: user._id,
      token,
      type: OtpTypeEnum.EMAIL_VERIFICATION,
    });
    return res.status(200).send({ message: "Verification mail sent" });
  } catch (error) {
    console.log(error.message)
    return res.status(500).send({
      error: "An unexpected error occurred"
    })
  }
};

export const verifyEmail = async (req: CustomRequest, res: Response) => {
  const user = req.user!;
  const { code } = req.body;
  try {
    const otp = await UserServices.getOtpByToken(req.user!._id, code);
    if (!otp) {
      return res.status(400).send({ error: "Invalid code" });
    }
    if (!otp.isActive) {
      return res.status(400).send({ error: "Code already used" });
    }
    if (otp.type !== OtpTypeEnum.EMAIL_VERIFICATION) {
      return res.status(400).send({ error: "Invalid code" });
    }
    if (otp.expiresIn < new Date()) {
      return res.status(400).send({ error: "Code expired" });
    }
    otp.isActive = false;
    await otp.save();
    user.isEmailVerified = true;
    await user.save();
    return res.status(200).send({ message: "Email verified" });
  } catch (error) {
    console.log(error.message)
    return res.status(500).send({
      error: "An unexpected error occurred"
    })
  }
};