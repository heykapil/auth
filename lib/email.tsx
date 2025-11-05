import { ReactNode } from "react";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_SENDER_NAME = "Kapil Chaudhary";
const DEFAULT_EMAIL = "auth@mail.kapil.app";

export async function sendEmail(
  email: string,
  subject: string,
  body: ReactNode,
) {
  const { error } = await resend.emails.send({
    from: `${DEFAULT_SENDER_NAME} <${DEFAULT_EMAIL}>`,
    to: email,
    subject,
    react: <>{body}</>,
  });

  if (error) {
    throw error;
  }
}
