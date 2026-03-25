import transporter from "../config/mailer.js";
import {
  EMAIL_FROM_ADDRESS,
  EMAIL_FROM_NAME,
  CONTACT_TEAM_EMAIL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  WELCOME_REFERRAL_BASE_URL,
} from "../config/env.js";

function getPersonalizedContent(role) {
  const normalized = (role || "").toLowerCase();

  if (normalized.includes("vendor") || normalized.includes("supplier")) {
    return {
      headline: "Start selling to 250,000+ employees on credit",
      value:
        "Stop losing sales when customers don't have cash today. With Linkayi, verify their EC number in real time, they walk out with your product, and you get paid automatically from their salary. Zero paperwork. Zero risk. 100% payment guarantee.",
      shareWhy: "Share with other vendors in your area",
      shareReason:
        "The more vendors join , the faster we launch. Early vendors get zero setup fees and 60 days ahead of competitors.",
      topBenefit: "Guaranteed payment via automatic deductions",
    };
  }

  if (normalized.includes("microfinance") || normalized.includes("lender")) {
    return {
      headline: "Give loans with zero default risk",
      value:
        "Verify employees instantly with their EC number. Approve loans in real time. Get repaid automatically from their salary. We've processed 100% repayment on every loan-because deductions happen before they see their paycheck.",
      shareWhy: "Share with other lenders and microfinance providers",
      shareReason:
        "More lenders = more competition for borrowers, which means better terms for everyone. Early lenders get zero fees and priority integration.",
      topBenefit: "100% repayment rate via automatic deductions",
    };
  }

  if (normalized.includes("employee") || normalized.includes("other")) {
    return {
      headline: "Buy now, pay through your salary",
      value:
        "Stop waiting for payday. Show your EC number, get approved instantly, walk out with what you need. Repayments happen automatically from your salary. See all your deductions in one clear dashboard.",
      shareWhy: "Share with colleagues and other employee",
      shareReason:
        "The more employees join, the more vendors we can bring on board-which means more places to buy from and better deals.",
      topBenefit: "Instant approval with just your EC number",
    };
  }

  return {
    headline: "You're part of the Linkayi waitlist",
    value:
      "Linkayi makes salary-based payments simple: vendors sell on credit, employees buy now and pay later, and everyone gets paid automatically through deductions.",
    shareWhy: "Share with your network",
    shareReason:
      "Every person who joins helps us launch faster with better features for everyone.",
    topBenefit: "Automatic payments and zero paperwork",
  };
}

function maskEmail(email) {
  const [local = "", domain = ""] = email.split("@");
  const maskedLocal =
    local.length <= 2 ? `${local[0] || "*"}*` : `${local.slice(0, 2)}***`;
  return `${maskedLocal}@${domain}`;
}

function createAttemptId() {
  return `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
}

function smtpForLogs() {
  const userMasked = SMTP_USERNAME ? maskEmail(SMTP_USERNAME) : "unknown";
  return `smtp=${SMTP_HOST || "unknown"}:${SMTP_PORT || "unknown"} user=${userMasked}`;
}

export async function sendWelcomeEmail({
  to,
  positionInQueue,
  referralCode,
  baseUrl,
  role,
  primaryUse,
  companyName,
  isEmployee,
}) {
  const referralBaseUrl = (
    WELCOME_REFERRAL_BASE_URL && WELCOME_REFERRAL_BASE_URL.trim()
      ? WELCOME_REFERRAL_BASE_URL
      : baseUrl
  ).replace(/\/+$/, "");
  const referralLink = `${referralBaseUrl}?ref=${encodeURIComponent(referralCode)}`;
  const masked = maskEmail(to);
  const content = getPersonalizedContent(role);
  const isTopFifty = positionInQueue <= 50;
  const peopleAhead = Math.max(positionInQueue - 1, 0);

  console.log(
    `[emailSender] Sending welcome email to=${masked} position=${positionInQueue}`
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Linkayi</title>
    </head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; background:#f9fafb; margin:0; padding:24px;">
      <div style="max-width:600px; margin:0 auto; background:white; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(135deg,#dc2626,#b91c1c); padding:32px; text-align:center;">
          <div style="margin-bottom:10px; color:white; font-weight:700; letter-spacing:0.4px; font-size:12px;">
            Linkayi - Private waitlist
          </div>
          <h1 style="color:white; margin:0; font-size:24px; line-height:1.3;">
            ${content.headline}
          </h1>
        </div>
        <div style="padding:32px;">
          <div style="background:${isTopFifty ? "#dcfce7" : "#fef2f2"}; border:2px solid ${isTopFifty ? "#86efac" : "#fecaca"}; padding:20px; border-radius:12px; margin:0 0 24px; text-align:center;">
            ${isTopFifty ? `<p style="margin:0 0 8px; font-size:13px; font-weight:600; color:#15803d;">You're currently in the first launch group.</p>` : `<p style="margin:0 0 8px; font-size:13px; color:#6b7280;">Your current place on the waitlist</p>`}
            <p style="margin:0; font-size:32px; font-weight:700; color:${isTopFifty ? "#15803d" : "#dc2626"};">#${positionInQueue}</p>
            ${
              peopleAhead > 0
                ? `<p style="margin:8px 0 0; font-size:13px; color:#4b5563; line-height:1.5;">There ${peopleAhead === 1 ? "is" : "are"} <strong>${peopleAhead}</strong> ${peopleAhead === 1 ? "person" : "people"} ahead of you in the queue.</p>`
                : `<p style="margin:8px 0 0; font-size:13px; color:#4b5563; line-height:1.5;">You're currently first in line for early access.</p>`
            }
          </div>
          <h2 style="font-size:18px; color:#111827; margin:0 0 12px;">Here's what you get:</h2>
          <p style="font-size:15px; color:#4b5563; line-height:1.6; margin:0 0 20px;">${content.value}</p>
          <div style="background:#f9fafb; border-left:4px solid #dc2626; padding:16px 20px; margin:0 0 28px;">
            <p style="margin:0; font-size:14px; color:#111827; font-weight:600;">${content.topBenefit}</p>
          </div>
          <h2 style="font-size:18px; color:#111827; margin:0 0 12px;">${content.shareWhy}</h2>
          <p style="font-size:15px; color:#4b5563; line-height:1.6; margin:0 0 16px;">${content.shareReason}</p>
          <div style="background:#f3f4f6; padding:16px; border-radius:8px; font-size:13px; word-break:break-all; margin:0 0 16px;">
            <a href="${referralLink}" style="color:#dc2626; font-weight:600; text-decoration:none;">${referralLink}</a>
          </div>
          <p style="font-size:13px; color:#6b7280; margin:0 0 28px;">Copy and share this link.</p>
          ${
            companyName && companyName !== "Not provided" && companyName.trim() !== ""
              ? `<div style="background:#f9fafb;padding:16px;border-radius:8px;margin:24px 0 0;">
                  <p style="margin:0 0 8px;font-weight:600;color:#111827;font-size:13px;">
                    Your details:
                  </p>
                  <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.6;">
                    ${companyName}
                    ${role ? `<br/><span style="color:#6b7280;">Role: ${role}</span>` : ""}
                    ${primaryUse ? `<br/><span style="color:#6b7280;">Primary use: ${primaryUse}</span>` : ""}
                    ${typeof isEmployee === "boolean" ? `<br/><span style="color:#6b7280;">Employee: ${isEmployee ? "Yes" : "No"}</span>` : ""}
                  </p>
                </div>`
              : ""
          }
        </div>
        <div style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb;">
          <p style="margin:0;">© ${new Date().getFullYear()} Linkayi</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attemptId = createAttemptId();
  const from = `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`;

  console.log(
    `[emailSender] [welcome] attempt=${attemptId} to=${masked} from=${maskEmail(
      EMAIL_FROM_ADDRESS
    )} subject="You're on the Linkayi waitlist!" ${smtpForLogs()}`
  );

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "You're on the Linkayi waitlist!",
      html,
    });

    console.log(
      `[emailSender] [welcome] success attempt=${attemptId} to=${masked} messageId=${
        info?.messageId || "n/a"
      } accepted=${(info?.accepted || []).length} rejected=${(info?.rejected || []).length} response=${
        info?.response || "n/a"
      }`
    );
  } catch (error) {
    console.error(
      `[emailSender] [welcome] failed attempt=${attemptId} to=${masked} error=${
        error?.message || error
      } code=${error?.code || "n/a"} command=${error?.command || "n/a"} response=${
        error?.response || "n/a"
      } ${smtpForLogs()}`
    );
    throw error;
  }
}

export async function sendReferralEmail({
  to,
  positionInQueue,
  referralCount,
  referralCode,
  baseUrl,
}) {
  const referralLink = `${baseUrl}?ref=${referralCode}`;
  const masked = maskEmail(to);

  console.log(
    `[emailSender] Sending referral email to=${masked} newPosition=${positionInQueue}`
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Someone joined using your link</title>
    </head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; background:#f9fafb; padding:24px;">
      <div style="max-width:600px; margin:0 auto; background:white; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden;">
        <div style="background:linear-gradient(135deg,#dc2626,#b91c1c); padding:28px; text-align:center;">
          <h1 style="color:white; margin:0; font-size:26px;">Your referral just moved you up the list</h1>
        </div>
        <div style="padding:32px;">
          <p style="font-size:16px; margin:0 0 20px;">Your referral just signed up. Each new person who joins through your link moves you closer to the front of the queue.</p>
          <div style="background:#f9fafb; border:2px solid #e5e7eb; padding:20px; border-radius:10px; margin:0 0 20px; text-align:center;">
            <p style="margin:0 0 6px; font-size:13px; color:#6b7280;">Your new position</p>
            <p style="margin:0; font-size:32px; font-weight:700; color:#dc2626;">#${positionInQueue}</p>
            <p style="margin:10px 0 0; font-size:13px; color:#4b5563; line-height:1.5;">Total referrals so far: <strong>${referralCount}</strong></p>
          </div>
          <div style="background:#f3f4f6; padding:14px; border-radius:8px; font-size:14px; word-break:break-all; margin:0 0 20px;">
            <a href="${referralLink}" style="color:#dc2626; font-weight:600; text-decoration:none;">${referralLink}</a>
          </div>
          <p style="font-size:13px; color:#6b7280; margin:0;">Copy and share this link.</p>
        </div>
        <div style="background:#f9fafb; padding:16px; text-align:center; font-size:12px; color:#9ca3af;">
          © ${new Date().getFullYear()} Linkayi
        </div>
      </div>
    </body>
    </html>
  `;

  const attemptId = createAttemptId();
  const from = `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`;

  console.log(
    `[emailSender] [referral] attempt=${attemptId} to=${masked} from=${maskEmail(
      EMAIL_FROM_ADDRESS
    )} subject="Someone joined Linkayi using your referral link!" ${smtpForLogs()}`
  );

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "Someone joined Linkayi using your referral link!",
      html,
    });

    console.log(
      `[emailSender] [referral] success attempt=${attemptId} to=${masked} messageId=${
        info?.messageId || "n/a"
      } accepted=${(info?.accepted || []).length} rejected=${(info?.rejected || []).length} response=${
        info?.response || "n/a"
      }`
    );
  } catch (error) {
    console.error(
      `[emailSender] [referral] failed attempt=${attemptId} to=${masked} error=${
        error?.message || error
      } code=${error?.code || "n/a"} command=${error?.command || "n/a"} response=${
        error?.response || "n/a"
      } ${smtpForLogs()}`
    );
    throw error;
  }
}

export async function sendContactTeamEmail({
  email,
  mobile,
  preferredContact,
  pageUrl,
}) {
  const teamEmail =
    CONTACT_TEAM_EMAIL || EMAIL_FROM_ADDRESS || "waitlist@axissol.com";

  console.log(
    `[emailSender] Sending contact team notification to=${maskEmail(teamEmail)}`
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>New Contact Request</title></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
                 line-height:1.6;color:#111827;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:white;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:24px 32px;">
          <h1 style="color:white;margin:0;font-size:20px;">
            New contact request - Linkayi
          </h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 20px;color:#4b5563;font-size:15px;">
            A new enquiry has been submitted from the public landing page.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:12px 8px;font-weight:600;color:#374151;width:160px;">
                Preferred contact
              </td>
              <td style="padding:12px 8px;color:#111827;">
                ${preferredContact}
              </td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:12px 8px;font-weight:600;color:#374151;">Email</td>
              <td style="padding:12px 8px;color:#111827;">
                ${email || "Not provided"}
              </td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:12px 8px;font-weight:600;color:#374151;">Mobile</td>
              <td style="padding:12px 8px;color:#111827;">
                ${mobile || "Not provided"}
              </td>
            </tr>
            ${
              pageUrl
                ? `<tr>
                <td style="padding:12px 8px;font-weight:600;color:#374151;">Page</td>
                <td style="padding:12px 8px;">
                  <a href="${pageUrl}" style="color:#dc2626;">${pageUrl}</a>
                </td>
              </tr>`
                : ""
            }
          </table>
        </div>
        <div style="background:#f9fafb;padding:16px 32px;font-size:12px;color:#9ca3af;">
          Sent automatically from Linkayi website.
        </div>
      </div>
    </body>
    </html>
  `;

  const attemptId = createAttemptId();
  const from = `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`;

  console.log(
    `[emailSender] [contact-team] attempt=${attemptId} to=${maskEmail(
      teamEmail
    )} from=${maskEmail(EMAIL_FROM_ADDRESS)} subject="New contact request - Linkayi" ${smtpForLogs()}`
  );

  try {
    const info = await transporter.sendMail({
      from,
      to: teamEmail,
      subject: "New contact request - Linkayi",
      html,
    });

    console.log(
      `[emailSender] [contact-team] success attempt=${attemptId} to=${maskEmail(
        teamEmail
      )} messageId=${info?.messageId || "n/a"} accepted=${(
        info?.accepted || []
      ).length} rejected=${(info?.rejected || []).length} response=${
        info?.response || "n/a"
      }`
    );
  } catch (error) {
    console.error(
      `[emailSender] [contact-team] failed attempt=${attemptId} to=${maskEmail(
        teamEmail
      )} error=${error?.message || error} code=${error?.code || "n/a"} command=${
        error?.command || "n/a"
      } response=${error?.response || "n/a"} ${smtpForLogs()}`
    );
    throw error;
  }
}

export async function sendContactUserEmail({ to }) {
  const masked = maskEmail(to);
  console.log(`[emailSender] Sending contact confirmation to=${masked}`);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>We've received your message</title>
    </head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
                 background:#f9fafb;margin:0;padding:24px;">
      <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;
                  border:1px solid #e5e7eb;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);
                    padding:32px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;">
            We've received your message
          </h1>
        </div>
        <div style="padding:32px;">
          <p style="font-size:16px;color:#374151;line-height:1.6;margin:0 0 16px;">
            Thanks for getting in touch with the Linkayi team.
          </p>
          <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 16px;">
            We'll reach out shortly using your preferred contact method.
            Whether you're joining as an employee, employer, vendor, or
            financial partner - we're glad you're here.
          </p>
          <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 24px;">
            Our team is actively onboarding partners and shaping launch
            access, so your enquiry directly helps us build this the right way.
          </p>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;
                      padding:16px 20px;">
            <p style="margin:0;font-size:14px;color:#374151;">
              For urgent enquiries, email us directly at
              <a href="mailto:info@axissol.com"
                 style="color:#dc2626;font-weight:600;">
                info@axissol.com
              </a>
            </p>
          </div>
        </div>
        <div style="background:#f9fafb;padding:20px;text-align:center;
                    font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
          <p style="margin:0;">© ${new Date().getFullYear()} Linkayi</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attemptId = createAttemptId();
  const from = `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`;

  console.log(
    `[emailSender] [contact-user] attempt=${attemptId} to=${masked} from=${maskEmail(
      EMAIL_FROM_ADDRESS
    )} subject="We've received your message - Linkayi" ${smtpForLogs()}`
  );

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "We've received your message - Linkayi",
      html,
    });

    console.log(
      `[emailSender] [contact-user] success attempt=${attemptId} to=${masked} messageId=${
        info?.messageId || "n/a"
      } accepted=${(info?.accepted || []).length} rejected=${(info?.rejected || []).length} response=${
        info?.response || "n/a"
      }`
    );
  } catch (error) {
    console.error(
      `[emailSender] [contact-user] failed attempt=${attemptId} to=${masked} error=${
        error?.message || error
      } code=${error?.code || "n/a"} command=${error?.command || "n/a"} response=${
        error?.response || "n/a"
      } ${smtpForLogs()}`
    );
    throw error;
  }
}

export async function sendUpdateConfirmationEmail({
  to,
  positionInQueue,
  referralCode,
  baseUrl,
  role,
  companyName,
}) {
  const referralLink = `${baseUrl}?ref=${referralCode}`;
  const masked = maskEmail(to);

  console.log(
    `[emailSender] Sending update confirmation to=${masked} position=${positionInQueue}`
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your details have been updated</title>
    </head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,
                 sans-serif;background:#f9fafb;margin:0;padding:24px;">
      <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;
                  overflow:hidden;border:1px solid #e5e7eb;">

        <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);
                    padding:28px 32px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;line-height:1.3;">
            Your waitlist details have been updated
          </h1>
        </div>

        <div style="padding:32px;">
          <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
            We have updated your information on the Linkayi waitlist.
            Your position in the queue has not changed.
          </p>

          <!-- Position badge -->
          <div style="background:#fef2f2;border:2px solid #fecaca;padding:20px;
                      border-radius:12px;margin:0 0 24px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">
              Your current position
            </p>
            <p style="margin:0;font-size:32px;font-weight:700;color:#dc2626;">
              #${positionInQueue}
            </p>
            <p style="margin:8px 0 0;font-size:13px;color:#4b5563;">
              Refer others to move up the queue faster.
            </p>
          </div>

          <!-- Updated details -->
          ${
            (role && role.trim()) || (companyName && companyName.trim())
              ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;
                            border-radius:8px;padding:16px 20px;margin:0 0 24px;">
                  <p style="margin:0 0 10px;font-weight:600;color:#111827;font-size:13px;">
                    Updated details on file:
                  </p>
                  ${companyName ? `<p style="margin:0 0 4px;font-size:13px;color:#4b5563;">
                    Company: <strong>${companyName}</strong></p>` : ""}
                  ${role ? `<p style="margin:0;font-size:13px;color:#4b5563;">
                    Role: <strong>${role}</strong></p>` : ""}
                </div>`
              : ""
          }

          <!-- Referral link -->
          <p style="font-size:14px;color:#374151;margin:0 0 10px;font-weight:600;">
            Your referral link
          </p>
          <div style="background:#f3f4f6;padding:14px;border-radius:8px;
                      font-size:13px;word-break:break-all;margin:0 0 20px;">
            <a href="${referralLink}"
               style="color:#dc2626;font-weight:600;text-decoration:none;">
              ${referralLink}
            </a>
          </div>

          <p style="font-size:13px; color:#6b7280; margin:0;">
            Copy and share this link.
          </p>
        </div>

        <div style="background:#f9fafb;padding:20px;text-align:center;
                    font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
          <p style="margin:0;">© ${new Date().getFullYear()} Linkayi</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attemptId = createAttemptId();
  const from = `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`;

  console.log(
    `[emailSender] [update-confirmation] attempt=${attemptId} to=${masked} from=${maskEmail(
      EMAIL_FROM_ADDRESS
    )} subject="Your Linkayi waitlist details have been updated" ${smtpForLogs()}`
  );

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "Your Linkayi waitlist details have been updated",
      html,
    });

    console.log(
      `[emailSender] [update-confirmation] success attempt=${attemptId} to=${masked} messageId=${
        info?.messageId || "n/a"
      } accepted=${(info?.accepted || []).length} rejected=${(info?.rejected || []).length} response=${
        info?.response || "n/a"
      }`
    );
  } catch (error) {
    console.error(
      `[emailSender] [update-confirmation] failed attempt=${attemptId} to=${masked} error=${
        error?.message || error
      } code=${error?.code || "n/a"} command=${error?.command || "n/a"} response=${
        error?.response || "n/a"
      } ${smtpForLogs()}`
    );
    throw error;
  }
}
