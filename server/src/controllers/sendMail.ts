import nodemailer from "nodemailer";
import {EMAIL_USER, EMAIL_PASS} from "../config/mail";
export const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    secure: false, 
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
  export async function sendMail(email:string) {
    try {
      const info = await transporter.sendMail({
        from: '"Gym Tracker" <no-reply@gymtracker.com>', 
        to: email, 
        subject: "Welcome", 
        text: "Welcome to your Gym Tracker account!", 
        html: "<b>Welcome to your Gym Tracker account!</b>", 
      });
  
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
      console.error("Error while sending mail", err);
    }
  };