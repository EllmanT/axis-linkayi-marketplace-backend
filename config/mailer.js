import nodemailer from "nodemailer";
import { SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD } from "./env.js";

function maskEmail(email = "") {
  const [local = "", domain = ""] = String(email).split("@");
  if (!domain) return "***";
  const maskedLocal =
    local.length <= 2 ? `${local[0] || "*"}*` : `${local.slice(0, 2)}***`;
  return `${maskedLocal}@${domain}`;
}

const missing = [];
if (!SMTP_HOST) missing.push("SMTP_HOST");
if (!SMTP_PORT) missing.push("SMTP_PORT");
if (!SMTP_USERNAME) missing.push("SMTP_USERNAME");
if (!SMTP_PASSWORD) missing.push("SMTP_PASSWORD");

if (missing.length) {
  throw new Error(`[mailer] Missing SMTP env vars: ${missing.join(", ")}`);
}

const port = Number(SMTP_PORT) || 587;
const smtpSecure =
  process.env.SMTP_SECURE === "true" ? true : port === 465 ? true : false;
const requireTLS = !smtpSecure;

const debugEnabled = process.env.EMAIL_DEBUG === "true";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: smtpSecure,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
  requireTLS,
  // Keep this off by default; enable via EMAIL_DEBUG=true when troubleshooting.
  debug: debugEnabled,
  logger: debugEnabled,
  tls: {
    minVersion: "TLSv1.2",
  },
});

transporter
  .verify()
  .then(() => {
    console.log(
      `[mailer] SMTP connection verified host=${SMTP_HOST} port=${port} user=${maskEmail(
        SMTP_USERNAME
      )}`
    );
  })
  .catch((error) => {
    console.error(
      `[mailer] SMTP connection failed host=${SMTP_HOST} port=${port} user=${maskEmail(
        SMTP_USERNAME
      )} error=${error?.message || error}`
    );
    // Helpful when debugging: log SMTP response if Nodemailer provides it.
    if (error?.response) {
      console.error(`[mailer] SMTP response: ${error.response}`);
    }
  });

export default transporter;
