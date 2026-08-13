import {guard,json,supabaseRequest} from "../_shared.js";
import {requirePortalUser} from "../_auth.js";
import {cashfreeRequest} from "./_cashfree.js";
import {applySuccessfulPayment} from "./_confirmation.js";

export default async function handler(req,res){
  if(!guard(req,res))return;
  const session=await requirePortalUser(req,res,"customer");if(!session)return;
  const orderId=String(req.body?.order_id||"").replace(/[^a-zA-Z0-9_-]/g,"").slice(0,45);
  if(!orderId)return json(res,422,{error:"Cashfree order ID is required"});
  const paymentResponse=await supabaseRequest(`payments?gateway=eq.cashfree&gateway_order_id=eq.${encodeURIComponent(orderId)}&select=*,booking:bookings!inner(id,customer_id,reference,total,advance_required,amount_paid,balance_due,status,travel_date,billing,ticket_number,ticket_generated_at,package:packages(title))&limit=1`);
  const [payment]=await paymentResponse.json();
  if(!paymentResponse.ok||!payment||payment.booking.customer_id!==session.user.id)return json(res,404,{error:"Payment record not found"});
  if(payment.status==="successful")return json(res,200,{verified:true,confirmation:"confirmed",payment_id:payment.gateway_payment_id});
  let gateway;
  try{gateway=await cashfreeRequest(`/orders/${encodeURIComponent(orderId)}/payments`)}catch(error){if(error.message==="CASHFREE_NOT_CONFIGURED")return json(res,503,{error:"Payment verification is not configured"});throw error}
  const attempts=await gateway.json().catch(()=>[]);
  if(!gateway.ok){console.error("cashfree_verification_failed",gateway.status,attempts);return json(res,502,{error:"Payment could not be verified"})}
  const successful=(Array.isArray(attempts)?attempts:[]).filter(item=>item.payment_status==="SUCCESS").sort((a,b)=>new Date(b.payment_completion_time||0)-new Date(a.payment_completion_time||0))[0];
  if(!successful){const pending=(Array.isArray(attempts)?attempts:[]).some(item=>["PENDING","NOT_ATTEMPTED"].includes(item.payment_status));return json(res,pending?202:400,{verified:false,confirmation:pending?"webhook_pending":"failed",message:pending?"Payment verification is still pending":"Cashfree has not confirmed a successful payment"})}
  if(Number(successful.payment_amount)!==Number(payment.amount)||successful.payment_currency!==payment.currency)return json(res,409,{error:"Payment amount or currency does not match the booking"});
  const result=await applySuccessfulPayment(payment,successful,"cashfree_verification");
  return json(res,200,{verified:true,confirmation:result.confirmed?"confirmed":"webhook_pending",payment_id:String(successful.cf_payment_id),message:result.confirmed?"Payment verified":"Payment received and booking confirmation is pending"});
}
