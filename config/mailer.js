import nodemailer from "nodemailer";
import { GMAIL_USER, GMAIL_APP_PASSWORD } from "./env.js";

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  throw new Error(
    "[mailer] GMAIL_USER and GMAIL_APP_PASSWORD must be set in environment variables"
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("[mailer] SMTP connection failed:", error.message);
  } else {
    console.log("[mailer] SMTP connection verified - ready to send");
  }
});

export default transporter;
