import { EMAIL_SERVICE_SECRET } from "../config/env.js";

function maskSecret(secret = "") {
  if (!secret) return "missing";
  if (secret.length <= 8) return "***";
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}

const authMiddleware = (req, res, next) => {
  if (!EMAIL_SERVICE_SECRET) {
    console.error("[auth] EMAIL_SERVICE_SECRET is not configured");
    return res.status(500).json({
      success: false,
      statusCode: 500,
      error: "Email service is not configured correctly",
    });
  }

  const authHeader = req.headers["x-email-service-secret"];

  if (!authHeader || authHeader !== EMAIL_SERVICE_SECRET) {
    console.warn(
      `[auth] Unauthorized request method=${req.method} path=${req.originalUrl} provided=${maskSecret(
        authHeader
      )} expected=${maskSecret(EMAIL_SERVICE_SECRET)}`
    );
    return res.status(401).json({
      success: false,
      statusCode: 401,
      error: "Unauthorized",
    });
  }

  console.log(`[auth] Authorized request method=${req.method} path=${req.originalUrl}`);
  return next();
};

export default authMiddleware;
