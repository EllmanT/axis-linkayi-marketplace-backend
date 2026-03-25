import { EMAIL_SERVICE_SECRET, SMTP_PASSWORD } from "../config/env.js";

const errorMiddleware = (err, req, res, next) => {
     try {
        let error ={...err};
        
        error.message = err.message;

        const errStr = (() => {
          try {
            if (typeof err === "string") return err;
            return String(err?.message || err || "");
          } catch {
            return "";
          }
        })();

        const includesSMTPPassword =
          Boolean(SMTP_PASSWORD) && errStr.includes(String(SMTP_PASSWORD));
        const includesEmailServiceSecret =
          Boolean(EMAIL_SERVICE_SECRET) &&
          errStr.includes(String(EMAIL_SERVICE_SECRET));

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
              hypothesisId: "H2",
              location: "middlewares/error.middleware.js",
              message: "error_sensitive_content_scan",
              data: {
                includesSMTPPassword,
                includesEmailServiceSecret,
              },
              timestamp: Date.now(),
            }),
          }
        ).catch(() => {});
        // #endregion

        console.error(err);

     
      
        res.status(error.statusCode||500).json({success:false, error:error.message ||"Server error"})
     } catch (error) {
        next(error)
     }
}

export default errorMiddleware;