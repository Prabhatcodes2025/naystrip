import crypto from "node:crypto";
import { json, supabaseRequest } from "../_shared.js";
import { requirePortalUser } from "../_auth.js";
import { requireAdmin } from "../_admin.js";
import { cashfreeConfiguration, cashfreeRequest } from "../payments/_cashfree.js";

export async function reconcileWallet(orderId, agentId) {
  if(!/^NTW-[a-f0-9-]{36}$/.test(orderId)) throw new Error("Invalid wallet order");
  const lookup=await supabaseRequest(`agent_wallet_orders?order_id=eq.${orderId}${agentId?`&agent_id=eq.${agentId}`:""}&select=*&limit=1`);
  if(!lookup.ok) throw new Error("Wallet unavailable");
  const [record]=await lookup.json();if(!record) throw new Error("Wallet order not found");
  if(record.status==="paid") return {status:"paid"};
  const response=await cashfreeRequest(`/orders/${orderId}`),order=await response.json();
  if(!response.ok||order.order_id!==orderId||order.order_currency!=="INR"||Number(order.order_amount)!==Number(record.amount)) throw new Error("Payment verification failed");
  if(order.order_status!=="PAID") return {status:"pending"};
  const paymentsResponse=await cashfreeRequest(`/orders/${orderId}/payments`);
  if(!paymentsResponse.ok) throw new Error("Payment verification unavailable");
  const payment=(await paymentsResponse.json()).find(p=>p.payment_status==="SUCCESS"&&p.payment_currency==="INR"&&Number(p.payment_amount)===Number(record.amount));
  if(!payment?.cf_payment_id) throw new Error("Successful payment not found");
  const posted=await supabaseRequest("rpc/post_agent_wallet_credit",{method:"POST",body:JSON.stringify({p_order_id:orderId,p_amount:Number(record.amount),p_payment_id:String(payment.cf_payment_id)})});
  if(!posted.ok) throw new Error("Credit posting failed; retry verification");
  return {status:"paid"};
}
export default async function handler(req,res) {
  const session=await requirePortalUser(req,res,"agent");if(!session)return;
  const agentId=session.profile.id;
  try {
    if(req.method==="GET") {
      const [balance,history]=await Promise.all([supabaseRequest("rpc/agent_wallet_balance",{method:"POST",body:JSON.stringify({p_agent_id:agentId})}),supabaseRequest(`agent_wallet_orders?agent_id=eq.${agentId}&select=order_id,amount,status,created_at,paid_at&order=created_at.desc&limit=100`)]);
      if(!balance.ok||!history.ok)throw new Error("Wallet unavailable");
      return json(res,200,{balance:await balance.json(),transactions:await history.json()});
    }
    if(req.method!=="POST")return json(res,405,{error:"Method not allowed"});
    if(req.body?.action==="verify")return json(res,200,await reconcileWallet(String(req.body.orderId||""),agentId));
    if(req.body?.action!=="create")return json(res,422,{error:"Unknown wallet action"});
    const amount=Number(req.body.amount);
    if(!Number.isFinite(amount)||amount<1||amount>100000||Math.abs(amount*100-Math.round(amount*100))>0.00001)return json(res,422,{error:"Enter an amount from INR 1 to 1,00,000 with at most two decimal places"});
    const config=cashfreeConfiguration();if(!config.clientId||!config.clientSecret)return json(res,503,{error:"Online payment is not configured"});
    const phone=String(session.profile.phone||"").replace(/\D/g,"").slice(-10);if(phone.length!==10)return json(res,422,{error:"Update your profile with a valid phone number first"});
    const orderId=`NTW-${crypto.randomUUID()}`;
    // Save the intended amount before gateway creation. Retries only credit this row.
    const saved=await supabaseRequest("agent_wallet_orders",{method:"POST",body:JSON.stringify({agent_id:agentId,order_id:orderId,amount})});
    if(!saved.ok)throw new Error("Could not save wallet order");
    const site=String(process.env.PUBLIC_SITE_URL||"https://www.naystrip.com").replace(/\/$/,"");
    const response=await cashfreeRequest("/orders",{method:"POST",headers:{"x-idempotency-key":orderId.slice(4)},body:JSON.stringify({order_id:orderId,order_amount:amount,order_currency:"INR",customer_details:{customer_id:agentId,customer_name:session.profile.contact_person,customer_email:session.profile.email,customer_phone:phone},order_meta:{return_url:`${site}/b2b/dashboard?wallet_order_id={order_id}#payments`,notify_url:`${site}/api/payments/webhook`},order_note:"NaysTrip partner wallet credit"})});
    const order=await response.json();if(!response.ok||order.order_id!==orderId||!order.payment_session_id)throw new Error("Payment gateway unavailable; no credit has been posted");
    return json(res,201,{order_id:orderId,payment_session_id:order.payment_session_id,mode:config.environment});
  } catch(error){return json(res,502,{error:error.message||"Wallet temporarily unavailable"})}
}
export async function adminWallet(req,res) {
  const admin=await requireAdmin(req,res);if(!admin)return;
  if(!["Super Admin","Accounts","B2B Manager"].includes(admin.role?.name))return json(res,403,{error:"Wallet access is restricted"});
  if(req.method!=="GET")return json(res,405,{error:"Method not allowed"});
  const result=await supabaseRequest("agent_wallet_orders?select=order_id,agent_id,amount,status,created_at,paid_at,agent:b2b_agents(business_name)&order=created_at.desc&limit=500");
  return result.ok?json(res,200,{transactions:await result.json()}):json(res,502,{error:"Wallet transactions unavailable"});
}
