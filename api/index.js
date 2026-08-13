import dispatch from "../server/router.js";

// Vercel routes every legacy /api/* URL here through vercel.json. Automatic
// parsing stays disabled so Razorpay's webhook handler receives exact bytes.
export const config={api:{bodyParser:false}};

export default dispatch;
