import {guard,json,supabaseRequest} from "../_shared.js";
import {requirePortalUser} from "../_auth.js";
import {clean,money} from "../_validation.js";
import {cashfreeConfiguration,cashfreeRequest} from "./_cashfree.js";

export default async function handler(req,res){
  if(!guard(req,res))return;
  const session=await requirePortalUser(req,res,"customer");if(!session)return;
  const bookingReference=clean(req.body?.bookingReference,40);const purpose=req.body?.purpose==="balance"?"balance":"advance";
  if(!bookingReference)return json(res,422,{error:"Booking reference is required"});
  const configuration=cashfreeConfiguration();
  if(!configuration.clientId||!configuration.clientSecret)return json(res,503,{error:"Online payment is not configured"});
  const bookingResponse=await supabaseRequest(`bookings?reference=eq.${encodeURIComponent(bookingReference)}&customer_id=eq.${session.user.id}&select=id,reference,total,advance_required,amount_paid,balance_due,currency,operational_status,billing&limit=1`);
  const [booking]=await bookingResponse.json();
  if(!bookingResponse.ok||!booking||["cancelled","completed","refunded"].includes(booking.operational_status))return json(res,404,{error:"Payable booking not found"});
  const payable=purpose==="balance"?money(booking.balance_due):money(Math.max(0,booking.advance_required-booking.amount_paid));
  if(payable<1)return json(res,422,{error:"No payable balance is available"});
  const existingResponse=await supabaseRequest(`payments?booking_id=eq.${booking.id}&gateway=eq.cashfree&payment_purpose=eq.${purpose}&status=in.(created,pending)&amount=eq.${payable}&select=gateway_order_id,amount,currency,raw_status&order=created_at.desc&limit=1`);
  const [existing]=await existingResponse.json();
  if(existing?.gateway_order_id&&existing.raw_status?.payment_session_id)return json(res,200,{order_id:existing.gateway_order_id,payment_session_id:existing.raw_status.payment_session_id,amount:existing.amount,currency:existing.currency,booking_reference:booking.reference,purpose,mode:configuration.environment,reused:true});

  const orderId=`${booking.reference}-${purpose}-${crypto.randomUUID().slice(0,8)}`.slice(0,45);
  const siteUrl=String(process.env.PUBLIC_SITE_URL||"https://www.naystrek.com").replace(/\/$/,"");
  const phone=String(booking.billing?.phone||session.profile?.phone||"").replace(/\D/g,"").slice(-15);
  if(phone.length<10)return json(res,422,{error:"A valid customer phone is required for online payment"});
  const gateway=await cashfreeRequest("/orders",{method:"POST",headers:{"x-idempotency-key":crypto.randomUUID(),"x-request-id":crypto.randomUUID()},body:JSON.stringify({
    order_id:orderId,order_amount:payable,order_currency:booking.currency||"INR",
    customer_details:{customer_id:String(session.user.id).replace(/[^a-zA-Z0-9_-]/g,"").slice(0,50),customer_name:clean(booking.billing?.name,100)||"NaysTrip Customer",customer_email:clean(booking.billing?.email||session.user.email,160)||undefined,customer_phone:phone},
    order_meta:{return_url:`${siteUrl}/account/dashboard?cashfree_order_id={order_id}`,notify_url:`${siteUrl}/api/payments/webhook`},
    order_note:`NaysTrip booking ${booking.reference} ${purpose}`,
    order_tags:{booking_id:booking.id,booking_reference:booking.reference,purpose},
  })});
  const order=await gateway.json().catch(()=>({}));
  if(!gateway.ok||!order.order_id||!order.payment_session_id){console.error("cashfree_order_failed",gateway.status,order);return json(res,502,{error:"Payment gateway is temporarily unavailable"})}
  const saved=await supabaseRequest("payments",{method:"POST",headers:{Prefer:"resolution=ignore-duplicates"},body:JSON.stringify({booking_id:booking.id,gateway:"cashfree",gateway_order_id:order.order_id,amount:payable,currency:booking.currency||"INR",status:"created",payment_purpose:purpose,idempotency_key:`cashfree:${order.order_id}`,raw_status:{order_status:order.order_status,payment_session_id:order.payment_session_id,cf_order_id:order.cf_order_id}})});
  if(!saved.ok)return json(res,502,{error:"Could not initialise payment record"});
  await supabaseRequest(`bookings?id=eq.${booking.id}`,{method:"PATCH",body:JSON.stringify({operational_status:"pending_payment",updated_at:new Date().toISOString()})});
  return json(res,201,{order_id:order.order_id,payment_session_id:order.payment_session_id,amount:payable,currency:booking.currency||"INR",booking_reference:booking.reference,purpose,mode:configuration.environment});
}
