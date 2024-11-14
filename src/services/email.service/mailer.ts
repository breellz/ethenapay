import * as nodemailer from "nodemailer";
import { EmailParam } from "./types";

// Create a transporter object using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST as string,
  port: parseInt(process.env.SMTP_PORT as string),
  auth: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASSWORD
  },
});

export const sendEmail = async (options: EmailParam) => {
  const { to, subject, message, html } = options;
  const mailOptions = {
    from: `Lode Protocol No-Reply <${process.env.SMTP_SENDER_ADDRESS}>`,
    sender: process.env.SMTP_SENDER_ADDRESS,
    to: to,
    subject: subject,
    text: message,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw {
      message: error,
      // stack: error.stack,
    };
  }

};

