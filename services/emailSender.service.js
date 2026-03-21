import transporter from "../config/mailer.js";
import { EMAIL_FROM_ADDRESS, EMAIL_FROM_NAME } from "../config/env.js";

function maskEmail(email) {
  const [local = "", domain = ""] = email.split("@");
  const maskedLocal =
    local.length <= 2 ? `${local[0] || "*"}*` : `${local.slice(0, 2)}***`;
  return `${maskedLocal}@${domain}`;
}

export async function sendWelcomeEmail({
  to,
  positionInQueue,
  referralCode,
  baseUrl,
}) {
  const referralLink = `${baseUrl}?ref=${referralCode}`;
  const masked = maskEmail(to);

  console.log(
    `[emailSender] Sending welcome email to=${masked} position=${positionInQueue}`
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to Linkayi</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:12px;overflow:hidden;
                     box-shadow:0 2px 8px rgba(0,0,0,0.06);">
              <tr>
                <td style="background:#0D2B45;padding:32px 40px;text-align:center;">
                  <h1 style="color:#00C3A0;margin:0;font-size:28px;letter-spacing:1px;">
                    Linkayi
                  </h1>
                  <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">
                    Payroll-Based Credit Platform
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <h2 style="color:#0D2B45;margin:0 0 16px;font-size:22px;">
                    You're on the waitlist!
                  </h2>
                  <p style="color:#444;font-size:16px;line-height:1.6;margin:0 0 24px;">
                    Thank you for joining Linkayi. You are currently
                    <strong style="color:#0D2B45;">#${positionInQueue}</strong> in the queue.
                  </p>
                  <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 32px;">
                    Move up the queue faster by referring others using your
                    personal referral link below.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="background:#f0fdf9;border:1px solid #00C3A0;
                           border-radius:8px;margin-bottom:32px;">
                    <tr>
                      <td style="padding:20px;">
                        <p style="margin:0 0 8px;color:#0D2B45;font-size:13px;
                                  font-weight:bold;text-transform:uppercase;
                                  letter-spacing:0.5px;">
                          Your referral link
                        </p>
                        <p style="margin:0 0 16px;color:#0D2B45;font-size:15px;
                                  word-break:break-all;">
                          ${referralLink}
                        </p>
                        <a href="${referralLink}"
                          style="display:inline-block;background:#00C3A0;color:#ffffff;
                                 text-decoration:none;padding:12px 24px;border-radius:6px;
                                 font-size:14px;font-weight:bold;">
                          Share your link
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
                    Each person who signs up using your link moves you one place
                    higher in the queue.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f4f4f5;padding:24px 40px;text-align:center;">
                  <p style="margin:0;color:#aaa;font-size:12px;">
                    © ${new Date().getFullYear()} Linkayi - axissol.com
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
    to,
    subject: "You're on the Linkayi waitlist!",
    html,
  });

  console.log(`[emailSender] Welcome email sent successfully to=${masked}`);
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
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:12px;overflow:hidden;
                     box-shadow:0 2px 8px rgba(0,0,0,0.06);">
              <tr>
                <td style="background:#0D2B45;padding:32px 40px;text-align:center;">
                  <h1 style="color:#00C3A0;margin:0;font-size:28px;letter-spacing:1px;">
                    Linkayi
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <h2 style="color:#0D2B45;margin:0 0 16px;font-size:22px;">
                    Someone joined using your link!
                  </h2>
                  <p style="color:#444;font-size:16px;line-height:1.6;margin:0 0 16px;">
                    You now have
                    <strong style="color:#0D2B45;">${referralCount} referral${referralCount === 1 ? "" : "s"}</strong>
                    and you are now
                    <strong style="color:#00C3A0;">#${positionInQueue}</strong> in the queue.
                  </p>
                  <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 32px;">
                    Keep sharing to move up even further.
                  </p>
                  <a href="${referralLink}"
                    style="display:inline-block;background:#00C3A0;color:#ffffff;
                           text-decoration:none;padding:12px 24px;border-radius:6px;
                           font-size:14px;font-weight:bold;">
                    Share your link
                  </a>
                </td>
              </tr>
              <tr>
                <td style="background:#f4f4f5;padding:24px 40px;text-align:center;">
                  <p style="margin:0;color:#aaa;font-size:12px;">
                    © ${new Date().getFullYear()} Linkayi - axissol.com
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
    to,
    subject: "Someone joined Linkayi using your referral link!",
    html,
  });

  console.log(`[emailSender] Referral email sent successfully to=${masked}`);
}
