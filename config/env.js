import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3001;

// SMTP credentials (e.g. Hostinger)
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT
  ? Number(process.env.SMTP_PORT)
  : undefined;
export const SMTP_USERNAME = process.env.SMTP_USERNAME;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

// Email sender identity
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Linkayi";
export const EMAIL_FROM_ADDRESS =
  process.env.EMAIL_FROM_ADDRESS ||
  process.env.SMTP_USERNAME ||
  process.env.GMAIL_USER;
export const CONTACT_TEAM_EMAIL = process.env.CONTACT_TEAM_EMAIL;

// Shared secret for backend-to-backend auth
export const EMAIL_SERVICE_SECRET = process.env.EMAIL_SERVICE_SECRET;