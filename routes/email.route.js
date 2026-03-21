import { Router } from "express";
import {
  validateEmail,
  sendWelcome,
  sendReferral,
} from "../controllers/email.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const emailRouter = Router();

emailRouter.use(authMiddleware);

emailRouter.post("/validate", validateEmail);
emailRouter.post("/send/welcome", sendWelcome);
emailRouter.post("/send/referral", sendReferral);

export default emailRouter;
