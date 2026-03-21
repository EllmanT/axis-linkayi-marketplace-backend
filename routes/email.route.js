import { Router } from "express";
import {
  validateEmail,
  sendWelcome,
  sendReferral,
  sendContactTeam,
  sendContactUser,
} from "../controllers/email.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const emailRouter = Router();

emailRouter.use(authMiddleware);

emailRouter.post("/validate", validateEmail);
emailRouter.post("/send/welcome", sendWelcome);
emailRouter.post("/send/referral", sendReferral);
emailRouter.post("/send/contact-team", sendContactTeam);
emailRouter.post("/send/contact-user", sendContactUser);

export default emailRouter;
