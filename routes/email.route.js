import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  validateEmail,
  sendWelcome,
  sendReferral,
  sendContactTeam,
  sendContactUser,
  sendUpdateConfirmation,
} from "../controllers/email.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const emailRouter = Router();

emailRouter.use(authMiddleware);

// Phase 1 note: express-rate-limit uses in-memory counters on Vercel instances.
const emailSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    error: "Email sending limit reached. Please try again later.",
  },
});

const validateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    error: "Too many validation requests. Please slow down.",
  },
});

emailRouter.post("/validate", validateLimiter, validateEmail);
emailRouter.post("/send/welcome", emailSendLimiter, sendWelcome);
emailRouter.post("/send/referral", emailSendLimiter, sendReferral);
emailRouter.post("/send/contact-team", emailSendLimiter, sendContactTeam);
emailRouter.post("/send/contact-user", emailSendLimiter, sendContactUser);
emailRouter.post("/send/update-confirmation", emailSendLimiter, sendUpdateConfirmation);

export default emailRouter;
