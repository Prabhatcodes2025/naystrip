import { reconcileWallet } from "../b2b/wallet.js";
import crypto from "node:crypto";
import {json,supabaseRequest} from "../_shared.js";
import {cashfreeConfiguration} from "./_cashfree.js";
import {applySuccessfulPayment} from "./_confirmation.js";

export const config={api:{bodyParser:false}};
const safe=(a,b)=>{const x=Buffer.from(a||"");const y=Buffer.from(b||"");return x.length===y.length&&crypto.timingSafeEqual(x,y)};
async function readRaw(req){const chunks=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));return Buffer.concat(chunks)}
export const cashfreeWebhookSignature=(timestamp,raw,secret)=>crypto.createHmac("sha256",secret).update(String(timestamp)+Buffer.from(raw).toString("utf8")).digest("base64");

export default async function handler(req,res){
  if(req.method!=="POST")return json(res,405,{error:"Method not allowed"});
  const configuration=cashfreeConfiguration();
  if(!configuration.clientSecret)return json(res,503,{error:"Webhook not configured"});
  const raw=await readRaw(req);const timestamp=String(req.headers["x-webhook-timestamp"]||"");const signature=String(req.headers["x-webhook-signature"]||"");
  if(!timestamp||!signature)return json(res,400,{error:"Missing webhook signature"});
  const expected=cashfreeWebhookSignature(timestamp,raw,configuration.clientSecret);
  if(!safe(expected,signature))return json(res,400,{error:"Invalid webhook signature"});
  let event;try{event=JSON.parse(raw.toString("utf8"))}catch{return json(res,400,{error:"Invalid payload"})}
  const walletOrderId=String(event?.data?.order?.order_id||"");
  if(walletOrderId.startsWith("NTW-")){try{return json(res,200,await reconcileWallet(walletOrderId))}catch{return json(res,502,{error:"Wallet verification failed; retry delivery"})}}
  const eventId=String(req.headers["x-idempotency-key"]||crypto.createHash("sha256").update(raw).digest("hex"));
  const eventType=String(event.type||"unknown");
  const inserted=await supabaseRequest("payment_webhook_events",{method:"POST",headers:{Prefer:"resolution=ignore-duplicates,return=representation"},body:JSON.stringify({id:eventId,provider:"cashfree",event_type:eventType,payload:event,processing_status:"received"})});
  const rows=inserted.ok?await inserted.json():[];
  if(!rows.length)return json(res,200,{received:true,duplicate:true});
  try{
    const entity=event?.data?.payment||{};const order=event?.data?.order||{};const orderId=String(order.order_id||entity.order_id||"");
    if(!orderId){await finish(eventId,"ignored");return json(res,200,{received:true,ignored:true})}
    const lookup=await supabaseRequest(`payments?gateway=eq.cashfree&gateway_order_id=eq.${encodeURIComponent(orderId)}&select=*,booking:bookings(id,reference,total,advance_required,amount_paid,balance_due,status,customer_id,travel_date,billing,ticket_number,ticket_generated_at,package:packages(title))&limit=1`);
    const [payment]=await lookup.json();if(!lookup.ok||!payment)throw new Error("Payment record not found");
    const status=String(entity.payment_status||"");
    if(status==="SUCCESS"){
      if(Number(entity.payment_amount)!==Number(payment.amount)||String(entity.payment_currency)!==String(payment.currency))throw new Error("Payment amount or currency mismatch");
      await applySuccessfulPayment(payment,{...entity,order_id:orderId},"cashfree_webhook");
    }else if(["FAILED","USER_DROPPED","CANCELLED","VOID"].includes(status)&&payment.status!=="successful"){
      await supabaseRequest(`payments?id=eq.${payment.id}&status=neq.successful`,{method:"PATCH",body:JSON.stringify({gateway_payment_id:String(entity.cf_payment_id||"")||null,gateway_transaction_id:entity.bank_reference||null,status:"failed",payment_method:entity.payment_group||null,raw_status:{provider:"cashfree",payment_status:status,order_id:orderId,error_details:entity.error_details||null},updated_at:new Date().toISOString()})});
      const successfulResponse=await supabaseRequest(`payments?booking_id=eq.${payment.booking_id}&status=eq.successful&select=id&limit=1`);
      const successfulPayments=successfulResponse.ok?await successfulResponse.json():[];
      if(!successfulPayments.length)await supabaseRequest(`bookings?id=eq.${payment.booking_id}`,{method:"PATCH",body:JSON.stringify({payment_state:"failed",operational_status:"pending_payment",updated_at:new Date().toISOString()})});
    }
    await finish(eventId,"processed");return json(res,200,{received:true});
  }catch(error){await finish(eventId,"failed",error.message);console.error("cashfree_webhook_failed",error);return json(res,500,{error:"Webhook processing failed"})}
}
async function finish(id,status,error=null){await supabaseRequest(`payment_webhook_events?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",body:JSON.stringify({processing_status:status,error,processed_at:new Date().toISOString()})})}
