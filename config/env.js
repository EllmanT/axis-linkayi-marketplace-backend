import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3001;

// Gmail SMTP credentials
export const GMAIL_USER = process.env.GMAIL_USER;
export const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Email sender identity
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Linkayi";
export const EMAIL_FROM_ADDRESS =
  process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER;
export const CONTACT_TEAM_EMAIL = process.env.CONTACT_TEAM_EMAIL;

// Shared secret for backend-to-backend auth
export const EMAIL_SERVICE_SECRET = process.env.EMAIL_SERVICE_SECRET;