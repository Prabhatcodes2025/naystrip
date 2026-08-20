import { json } from "./_shared.js";
import { captchaConfiguration } from "./_captcha.js";

export default function handler(req, res) {
  if (req.method !== "GET")
    return json(res, 405, { error: "Method not allowed" });
  const captcha = captchaConfiguration();
  return json(res, 200, {
    siteUrl: String(process.env.PUBLIC_SITE_URL || "https://www.naystrip.com").replace(/\/$/, ""),
    turnstile: {
      enabled: captcha.enabled,
      siteKey: captcha.enabled ? captcha.siteKey : null,
    },
  });
}
