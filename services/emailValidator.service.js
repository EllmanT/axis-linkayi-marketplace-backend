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

const PLACEHOLDER_LOCAL_PARTS = new Set([
  "test",
  "testing",
  "demo",
  "sample",
  "fake",
  "admin",
  "user",
]);

const PLACEHOLDER_DOMAIN_LABELS = new Set([
  "test",
  "testing",
  "example",
  "invalid",
  "fake",
  "placeholder",
  "noreply",
  "no-reply",
  "mail",
]);

function isLikelyProviderTypo(domain) {
  return /^(gmail|yahoo|hotmail|outlook)\d+\./.test(domain);
}

export async function validateEmailDomain(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: "Invalid email format." };
  }

  const [localPart = "", rawDomain = ""] = email.toLowerCase().split("@");
  const domain = rawDomain.toLowerCase();

  if (PLACEHOLDER_LOCAL_PARTS.has(localPart)) {
    return {
      valid: false,
      reason: "Please use your real email address instead of a test address.",
    };
  }

  const firstDomainLabel = domain.split(".")[0] || "";
  if (PLACEHOLDER_DOMAIN_LABELS.has(firstDomainLabel)) {
    return {
      valid: false,
      reason: "Please use a real email domain.",
    };
  }

  if (isLikelyProviderTypo(domain)) {
    return {
      valid: false,
      reason: "That domain looks like a typo. Please double-check your email.",
    };
  }

  if (BLOCKED_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason: "Please use a valid email address.",
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
      `[emailValidator] DNS lookup failed for domain=${domain} code=${error.code} - failing closed`
    );
    return {
      valid: false,
      reason: "Could not verify this email domain right now. Please try again.",
    };
  }
}
