import dispatch from "../server/router.js";

// Body parsing is disabled globally so Razorpay's signed webhook reaches its
// handler as untouched bytes. The router parses JSON only for non-webhook paths.
export const config={api:{bodyParser:false}};

export default dispatch;
