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
    const expectedMask = maskSecret(EMAIL_SERVICE_SECRET);
    const providedMask = maskSecret(authHeader);
    const expectedMaskType =
      expectedMask === "missing"
        ? "missing"
        : expectedMask === "***"
          ? "short"
          : "partial";
    const providedMaskType =
      providedMask === "missing"
        ? "missing"
        : providedMask === "***"
          ? "short"
          : "partial";

    // #region agent log
    globalThis.fetch?.(
      "http://127.0.0.1:7283/ingest/c90a40fd-4174-4597-871b-c10f05048932",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "83aa67",
        },
        body: JSON.stringify({
          sessionId: "83aa67",
          runId: "pre-fix",
          hypothesisId: "H1",
          location: "middlewares/auth.middleware.js:unauthorized",
          message: "unauthorized_request_mask_types",
          data: { expectedMaskType, providedMaskType },
          timestamp: Date.now(),
        }),
      }
    ).catch(() => {});
    // #endregion

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
