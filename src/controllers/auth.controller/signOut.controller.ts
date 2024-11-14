import { Response } from 'express'
import { CustomRequest } from '../../middlewares/auth'
import Authservices from '../../services/auth.service'
import useragent from "express-useragent";

//logout
export const signOut = async (req: CustomRequest, res: Response) => {
  const user = req.user!
  try {
    const userAgent = req.headers["user-agent"];
    const parsedUserAgent = userAgent ? useragent.parse(userAgent) : null;
    await Authservices.signOut(user, req.token!, parsedUserAgent, req.ip!)
    return res.status(200).send({ message: "Sign out successful" })
  } catch (error) {
    console.error(error.message);
    return res.status(500).send({ error: "An unexpected error occurred" });
  }
}
