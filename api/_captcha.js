export async function verifyCaptcha(token, remoteIp) {
  if (!process.env.TURNSTILE_SECRET_KEY)
    return { success: true, skipped: true };
  if (!token)
    return {
      success: false,
      error: "Complete the anti-bot check and try again",
    };
  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY,
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
