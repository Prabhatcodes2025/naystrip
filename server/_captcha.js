export function captchaConfiguration() {
  const secret = String(process.env.TURNSTILE_SECRET_KEY || "").trim();
  const siteKey = String(process.env.VITE_TURNSTILE_SITE_KEY || "").trim();
  return {
    enabled: Boolean(secret && siteKey),
    secret,
    siteKey,
    partial: Boolean(secret || siteKey) && !(secret && siteKey),
  };
}

export async function verifyCaptcha(token, remoteIp) {
  const configuration = captchaConfiguration();
  if (!configuration.enabled) {
    if (configuration.partial) console.warn("turnstile_partial_configuration");
    return { success: true, skipped: true, reason: "not_configured" };
  }
  if (!token)
    return {
      success: false,
      error: "Complete the anti-bot check and try again",
    };
  const body = new URLSearchParams({
    secret: configuration.secret,
    response: String(token),
  });
  if (remoteIp) body.set("remoteip", String(remoteIp).split(",")[0].trim());
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const result = await response.json();
    return result.success
      ? { success: true }
      : { success: false, error: "Anti-bot verification failed" };
  } catch {
    return {
      success: false,
      error: "Anti-bot verification is temporarily unavailable",
    };
  }
}
