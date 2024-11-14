import { EMAIL_PRIORITY } from "./constants";
import { emailQueue } from "./queue";
import { EmailParam, EmailPriority } from "./types";

export default async (
  name: string,
  { to, subject, message, html }: EmailParam,
  priority: EmailPriority = "low"
) => {
  await emailQueue.add(
    name,
    {
      to,
      subject,
      message,
      html
    },
    EMAIL_PRIORITY[priority]
  );
};
