import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT } from "../config/mail.js";

const port = Number(EMAIL_PORT) || 587;
export const transporter = nodemailer.createTransport({
  host: EMAIL_HOST, port,
  secure: port === 465,
  requireTLS: process.env.NODE_ENV === "production",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  connectionTimeout: 10_000,
  socketTimeout: 10_000,
});

export async function sendMail(email: string, subject: string, htmlContent: string) {
  try {
    await transporter.sendMail({
      from: '"Gym Tracker" <no-reply@gymtracker.com>',
      to: email, subject, html: htmlContent,
    });
  } catch {
    console.error("Email delivery failed");
  }
}
