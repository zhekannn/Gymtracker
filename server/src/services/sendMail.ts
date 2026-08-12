import nodemailer from "nodemailer";
import {EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT} from "../config/mail.js";
export const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: false, 
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
  export async function sendMail(email:string, subject:string, htmlContent:string) {
    try {
      const info = await transporter.sendMail({
        from: '"Gym Tracker" <no-reply@gymtracker.com>', 
        to: email, 
        subject: subject, 
        html: htmlContent, 
      });
  
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
      console.error("Error while sending mail:", err);
    }
  };
