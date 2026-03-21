import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import errorMiddleware from "./middlewares/error.middleware.js";
import emailRouter from "./routes/email.route.js";
import { PORT } from "./config/env.js";

const app = express();

// Global rate limiter — applies to all routes
// This is a second layer of defence even if someone has the secret
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    error: "Too many requests. Please try again later.",
  },
  skip: (req) => req.path === "/",
});

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3005",
  "http://localhost:4200",
  "https://axis.marketplace",
  "https://www.axis.marketplace",
];

app.use(
  cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
})
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(globalLimiter);

app.use((req, res, next) => {
  const start = Date.now();
  const origin = req.headers.origin || "no-origin";
  console.log(
    `[http] ${req.method} ${req.originalUrl} origin=${origin} ip=${req.ip || "unknown"}`
  );

  res.on("finish", () => {
    const elapsed = Date.now() - start;
    console.log(
      `[http] ${req.method} ${req.originalUrl} status=${res.statusCode} durationMs=${elapsed}`
    );
  });

  next();
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Linkayi Email Service is running",
    version: "1.0.0",
  });
});

app.use("/api/v1/email", emailRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[server] Linkayi Email Service running on port ${PORT}`);
});

export default app;