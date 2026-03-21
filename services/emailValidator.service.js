import dns from "dns/promises";

const BLOCKED_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "temp-mail.org",
  "throwaway.email",
  "yopmail.com",
  "sharklasers.com",
  "trashmail.com",
  "fakeinbox.com",
  "tempinbox.com",
  "getairmail.com",
  "dispostable.com",
  "maildrop.cc",
  "mailnull.com",
  "spamgourmet.com",
  "trashmail.at",
  "spamex.com",
  "example.com",
  "test.com",
  "testing.com",
  "fake.com",
  "noreply.com",
  "nowhere.com",
  "invalid.com",
  "placeholder.com",
  "notreal.com",
]);

export async function validateEmailDomain(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: "Invalid email format." };
  }

  const domain = email.split("@")[1].toLowerCase();

  if (BLOCKED_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason: "Please use a permanent email address.",
    };
  }

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        reason: "This email domain cannot receive mail.",
      };
    }
    return { valid: true };
  } catch (error) {
    if (error.code === "ENOTFOUND" || error.code === "ENODATA") {
      return {
        valid: false,
        reason: "This email domain does not exist.",
      };
    }

    console.warn(
      `[emailValidator] DNS lookup failed for domain=${domain} code=${error.code} - failing open`
    );
    return { valid: true };
  }
}
