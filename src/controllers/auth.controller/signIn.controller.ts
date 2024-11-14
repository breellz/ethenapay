import { Request, Response } from "express";
import useragent from "express-useragent";
import path from "path";
import AuthServices from "../../services/auth.service";
// import sendEmailToQueue from "../../../../services/api/v1/email.service";
import { signInValidation } from "../../utils/validators/authValidators";

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { error } = signInValidation({ email, password });
    if (error) {
      return res.status(400).send({ error: error.message });
    }
  } catch (validationError) {
    console.error("Validation error:", validationError);
    return res.status(400).send({ error: "Validation failed" });
  }

  let response;
  try {
    const userAgent = req.headers["user-agent"];
    const parsedUserAgent = userAgent ? useragent.parse(userAgent) : null;
    response = await AuthServices.signIn({
      email,
      password,
      userAgent: parsedUserAgent,
      ipAddress: req.ip,
    });
  } catch (authError) {
    console.error("Authentication error:", authError);
    return res.status(401).send({ error: "invalid email or password" });
  }
  // const signInEmail = path.join(
  //   __dirname,
  //   "../../../../email-templates/signin.html"
  // );
  // const renderedEmail = await ejs.renderFile(signInEmail, {
  //   firstName: response.user.firstName,
  //   date: new Date(),
  // });
  // const mailOptions = {
  //   to: email,
  //   subject: "New Sign In",
  //   message: "Sign-in successful",
  //   html: renderedEmail,
  // };
  // await sendEmailToQueue(mailOptions, "normal");

  return res.status(200).send({
    message: "Sign-in successful",
    data: response,
  });
};

