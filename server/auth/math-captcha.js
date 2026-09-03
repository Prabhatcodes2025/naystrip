import crypto from "node:crypto";
import { json, supabaseRequest } from "../_shared.js";
import { uuidPattern } from "../_validation.js";

const digest = (value) => crypto.createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY).update(value).digest("hex");
export async function consumeMathChallenge(id, answer) {
  if (!uuidPattern.test(String(id || ""))) return false;
  // DELETE RETURNING consumes the attempt atomically, including wrong answers.
  const result = await supabaseRequest(`registration_challenges?id=eq.${id}`, {method:"DELETE",headers:{Prefer:"return=representation"}});
  if (!result.ok) throw new Error("Captcha unavailable");
  const [challenge] = await result.json();
  return Boolean(challenge && Date.parse(challenge.expires_at)>Date.now() && /^\d{1,2}$/.test(String(answer)) && challenge.answer_hash===digest(`${id}:${Number(answer)}`));
}
export default async function handler(req,res) {
  if(req.method!=="GET") return json(res,405,{error:"Method not allowed"});
  try {
    const now=new Date().toISOString(),clientHash=digest(String(req.headers["x-forwarded-for"]||req.socket?.remoteAddress||"unknown").split(",")[0]);
    await supabaseRequest(`registration_challenges?expires_at=lt.${now}`,{method:"DELETE"});
    const recent=await supabaseRequest(`registration_challenges?client_hash=eq.${clientHash}&created_at=gte.${new Date(Date.now()-60000).toISOString()}&select=id&limit=20`);
    if(!recent.ok) throw new Error("Captcha unavailable");
    if((await recent.json()).length>=20) return json(res,429,{error:"Please wait a minute before trying again"});
    const a=crypto.randomInt(2,13),b=crypto.randomInt(1,a),subtract=crypto.randomInt(0,2)===1,id=crypto.randomUUID();
    const saved=await supabaseRequest("registration_challenges",{method:"POST",body:JSON.stringify({id,answer_hash:digest(`${id}:${subtract?a-b:a+b}`),expires_at:new Date(Date.now()+300000).toISOString(),client_hash:clientHash})});
    if(!saved.ok) throw new Error("Captcha unavailable");
    return json(res,200,{id,question:`What is ${a} ${subtract?"−":"+"} ${b}?`});
  } catch { return json(res,503,{error:"Math check is temporarily unavailable. Please retry."}); }
}
