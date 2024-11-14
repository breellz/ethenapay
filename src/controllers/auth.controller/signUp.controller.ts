import { Request, Response } from "express";
import AuthServices from '../../services/auth.service';
import { signUpValidation } from "../../utils/validators/authValidators";
import { UserRoleEnum } from "../../models/user/user.model";


export const signUp = async (req: Request, res: Response) => {
  const { email, password, userType } = req.body;
  try {
    const { error } = signUpValidation({ email, password, userType });
    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const existingUser = await AuthServices.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).send({ message: "User already exists, please signIn" });
    }
    if (userType !== UserRoleEnum.USER && userType !== UserRoleEnum.DEVELOPER) {
      return res.status(400).send({ message: "User type must be either user or developer" });
    }
    const user = await AuthServices.signUp({ email, password, userType });
    const token = await user.generateAuthToken();
    return res.status(201).send({
      message: "sign-up successful",
      data: user, token
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send({ error: "An unexpected error occurred" });
  }
};