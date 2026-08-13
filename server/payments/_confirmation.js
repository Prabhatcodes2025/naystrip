import {supabaseRequest} from "../_shared.js";
import {bookingReference,money} from "../_validation.js";
import {deliverNotification} from "../_notifications.js";
import {generateAndStoreBookingDocuments} from "../_document-service.js";

export async function applySuccessfulPayment(payment,entity,actor="cashfree"){
  const paymentId=String(entity.cf_payment_id||entity.payment_id||"");
  const transition=await supabaseRequest(`payments?id=eq.${payment.id}&status=neq.successful`,{
    method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({
      gateway_payment_id:paymentId||payment.gateway_payment_id,
      gateway_transaction_id:entity.bank_reference||paymentId||payment.gateway_transaction_id,
      status:"successful",payment_method:entity.payment_group||payment.payment_method,
      captured_at:entity.payment_completion_time||new Date().toISOString(),
      raw_status:{provider:"cashfree",payment_status:entity.payment_status,order_id:entity.order_id,cf_payment_id:paymentId},
      updated_at:new Date().toISOString(),
    }),
  });
  if(!transition.ok)throw new Error("Payment state could not be stored");
  const changed=await transition.json();

  const paidResponse=await supabaseRequest(`payments?booking_id=eq.${payment.booking_id}&status=eq.successful&select=amount`);
  if(!paidResponse.ok)throw new Error("Paid amount could not be calculated");
  const paidRows=await paidResponse.json();
  const amountPaid=money(paidRows.reduce((sum,row)=>sum+Number(row.amount),0));
  const balance=money(Math.max(0,Number(payment.booking.total)-amountPaid));
  const fullyPaid=balance===0;
  const confirmed=amountPaid>=Number(payment.booking.advance_required);
  const ticket=payment.booking.ticket_number||bookingReference("NTT");
  const bookingUpdate=await supabaseRequest(`bookings?id=eq.${payment.booking_id}`,{method:"PATCH",body:JSON.stringify({
    amount_paid:amountPaid,balance_due:balance,
    payment_state:fullyPaid?"fully_paid":"partially_paid",
    operational_status:confirmed?(fullyPaid?"fully_paid":"confirmed"):"pending_payment",
    status:confirmed?"confirmed":"pending",ticket_number:ticket,
    ticket_generated_at:payment.booking.ticket_generated_at||new Date().toISOString(),updated_at:new Date().toISOString(),
  })});
  if(!bookingUpdate.ok)throw new Error("Booking payment state could not be updated");
  if(!changed.length)return {duplicate:true,confirmed,fullyPaid,amountPaid,balance};
  await supabaseRequest("booking_activity",{method:"POST",body:JSON.stringify({booking_id:payment.booking_id,action:fullyPaid?"payment_completed":"payment_received",actor_type:actor,details:{provider:"cashfree",payment_id:paymentId,amount:payment.amount,balance}})});
  if(confirmed)try{await generateAndStoreBookingDocuments(payment.booking_id)}catch(error){console.error("post_payment_documents_failed",error.message)}
  const email=payment.booking.billing?.email;const phone=payment.booking.billing?.phone;
  const payload={reference:payment.booking.reference,customerName:payment.booking.billing?.name,packageTitle:payment.booking.package?.title,travelDate:payment.booking.travel_date,amountPaid,balanceDue:balance,portalUrl:`${process.env.PUBLIC_SITE_URL||"https://naystrip.vercel.app"}/account/dashboard`};
  await Promise.all([email&&deliverNotification({bookingId:payment.booking_id,event:confirmed?"booking_confirmed":"payment_received",recipient:email,payload,idempotencyKey:`${payment.booking.reference}:${confirmed?"booking_confirmed":"payment_received"}:email`}),phone&&deliverNotification({bookingId:payment.booking_id,event:confirmed?"booking_confirmed":"payment_received",recipient:phone,channel:"whatsapp",payload,idempotencyKey:`${payment.booking.reference}:${confirmed?"booking_confirmed":"payment_received"}:whatsapp`})].filter(Boolean));
  return {duplicate:false,confirmed,fullyPaid,amountPaid,balance};
}
