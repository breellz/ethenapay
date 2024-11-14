export type EmailParam = {
  to: string;
  subject: string;
  message: string;
  html: string;
};

export type EmailPriority = "high" | "normal" | "low";
