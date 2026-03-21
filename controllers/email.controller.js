import { z } from "zod";
import { validateEmailDomain } from "../services/emailValidator.service.js";
import {
  sendWelcomeEmail,
  sendReferralEmail,
  sendContactTeamEmail,
  sendContactUserEmail,
  sendUpdateConfirmationEmail,
} from "../services/emailSender.service.js";

function maskEmail(email = "") {
  const [local = "", domain = ""] = String(email).split("@");
  if (!domain) return "***";
  const maskedLocal =
    local.length <= 2 ? `${local[0] || "*"}*` : `${local.slice(0, 2)}***`;
  return `${maskedLocal}@${domain}`;
}

const validateEmailSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const sendWelcomeEmailSchema = z.object({
  email: z.string().email(),
  positionInQueue: z.number().int().positive(),
  referralCode: z.string().min(1),
  baseUrl: z.string().url(),
  role: z.string().optional(),
  primaryUse: z.string().optional(),
  companyName: z.string().optional(),
  isEmployee: z.boolean().optional(),
});

const sendReferralEmailSchema = z.object({
  email: z.string().email(),
  positionInQueue: z.number().int().positive(),
  referralCount: z.number().int().min(0),
  referralCode: z.string().min(1),
  baseUrl: z.string().url(),
});

const sendContactTeamSchema = z.object({
  email: z.string().email().optional(),
  mobile: z.string().optional(),
  preferredContact: z.enum(["email", "mobile"]),
  pageUrl: z.string().optional(),
});

const sendContactUserSchema = z.object({
  email: z.string().email(),
});

const sendUpdateConfirmationSchema = z.object({
  email: z.string().email(),
  positionInQueue: z.number().int().positive(),
  referralCode: z.string().min(1),
  baseUrl: z.string().url(),
  role: z.string().optional(),
  companyName: z.string().optional(),
});

export const validateEmail = async (req, res) => {
  try {
    console.log("[email.controller] validateEmail request received");
    const parsed = validateEmailSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: parsed.error.issues[0]?.message || "Invalid request body",
      });
    }

    const { email } = parsed.data;
    const result = await validateEmailDomain(email.toLowerCase().trim());

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Email validation complete",
      data: result,
    });
  } catch (error) {
    console.error("[email.controller] validateEmail error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      error: "Email validation failed",
    });
  }
};

export const sendWelcome = async (req, res) => {
  try {
    console.log(
      `[email.controller] sendWelcome request received email=${maskEmail(req.body?.email || "")} baseUrl=${req.body?.baseUrl || "missing"}`
    );
    const parsed = sendWelcomeEmailSchema.safeParse(req.body);

    if (!parsed.success) {
      console.warn(
        `[email.controller] sendWelcome validation failed issues=${JSON.stringify(parsed.error.issues)}`
      );
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: parsed.error.issues[0]?.message || "Invalid request body",
      });
    }

    await sendWelcomeEmail({
      to: parsed.data.email,
      positionInQueue: parsed.data.positionInQueue,
      referralCode: parsed.data.referralCode,
      baseUrl: parsed.data.baseUrl,
      role: parsed.data.role,
      primaryUse: parsed.data.primaryUse,
      companyName: parsed.data.companyName,
      isEmployee: parsed.data.isEmployee,
    });
    console.log(
      `[email.controller] sendWelcome email dispatch success email=${maskEmail(parsed.data.email)}`
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Welcome email sent successfully",
      data: {},
    });
  } catch (error) {
    console.error("[email.controller] sendWelcome error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      error: "Failed to send welcome email",
    });
  }
};

export const sendReferral = async (req, res) => {
  try {
    console.log(
      `[email.controller] sendReferral request received email=${maskEmail(req.body?.email || "")} baseUrl=${req.body?.baseUrl || "missing"}`
    );
    const parsed = sendReferralEmailSchema.safeParse(req.body);

    if (!parsed.success) {
      console.warn(
        `[email.controller] sendReferral validation failed issues=${JSON.stringify(parsed.error.issues)}`
      );
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: parsed.error.issues[0]?.message || "Invalid request body",
      });
    }

    await sendReferralEmail({
      to: parsed.data.email,
      positionInQueue: parsed.data.positionInQueue,
      referralCount: parsed.data.referralCount,
      referralCode: parsed.data.referralCode,
      baseUrl: parsed.data.baseUrl,
    });
    console.log(
      `[email.controller] sendReferral email dispatch success email=${maskEmail(parsed.data.email)}`
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Referral email sent successfully",
      data: {},
    });
  } catch (error) {
    console.error("[email.controller] sendReferral error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      error: "Failed to send referral email",
    });
  }
};

export const sendContactTeam = async (req, res) => {
  try {
    console.log("[email.controller] sendContactTeam request received");
    const parsed = sendContactTeamSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: parsed.error.issues[0]?.message || "Invalid request body",
      });
    }

    await sendContactTeamEmail(parsed.data);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Contact team email sent successfully",
      data: {},
    });
  } catch (error) {
    console.error("[email.controller] sendContactTeam error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      error: "Failed to send contact team email",
    });
  }
};

export const sendContactUser = async (req, res) => {
  try {
    console.log("[email.controller] sendContactUser request received");
    const parsed = sendContactUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: parsed.error.issues[0]?.message || "Invalid request body",
      });
    }

    await sendContactUserEmail({ to: parsed.data.email });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Contact confirmation email sent successfully",
      data: {},
    });
  } catch (error) {
    console.error("[email.controller] sendContactUser error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      error: "Failed to send contact confirmation email",
    });
  }
};

export const sendUpdateConfirmation = async (req, res) => {
  try {
    console.log(
      `[email.controller] sendUpdateConfirmation request received email=${maskEmail(req.body?.email || "")}`
    );
    const parsed = sendUpdateConfirmationSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: parsed.error.issues[0]?.message || "Invalid request body",
      });
    }

    await sendUpdateConfirmationEmail({
      to: parsed.data.email,
      positionInQueue: parsed.data.positionInQueue,
      referralCode: parsed.data.referralCode,
      baseUrl: parsed.data.baseUrl,
      role: parsed.data.role,
      companyName: parsed.data.companyName,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Update confirmation email sent successfully",
      data: {},
    });
  } catch (error) {
    console.error("[email.controller] sendUpdateConfirmation error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      error: "Failed to send update confirmation email",
    });
  }
};
