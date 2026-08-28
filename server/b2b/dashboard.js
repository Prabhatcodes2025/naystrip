import crypto from "node:crypto";
import { json, supabaseRequest } from "../_shared.js";
import { requirePortalUser } from "../_auth.js";
import { clean, dateOnly, money, uuidPattern } from "../_validation.js";

const reference=(prefix)=>`${prefix}-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;
const quoteUrl=(quote,token)=>`${process.env.PUBLIC_SITE_URL||"https://naystrip.vercel.app"}/quotation/${quote.reference}?token=${token}`;
async function settings(){const response=await supabaseRequest("website_settings?id=eq.true&select=data&limit=1");const [row]=response.ok?await response.json():[];return row?.data||{}}
async function owned(agentId,table,id,select="*"){if(!id||(table==="quotations"&&!uuidPattern.test(id)))return null;const response=await supabaseRequest(`${table}?id=eq.${encodeURIComponent(id)}&agent_id=eq.${agentId}&select=${select}&limit=1`);const rows=response.ok?await response.json():[];return rows[0]||null}

export default async function handler(req,res){
 const session=await requirePortalUser(req,res,"agent");if(!session)return;const agentId=session.profile.id;
 try{
  if(req.method==="GET"){
   const [ratesResponse,bookingsResponse,enquiriesResponse,quotesResponse,site]=await Promise.all([
    supabaseRequest("package_agent_rates?active=eq.true&select=id,retail_price,agent_price,markup,commission,valid_from,valid_until,package:packages(id,slug,title,destination_names,days,nights,status)&order=created_at.desc"),
    supabaseRequest(`bookings?agent_id=eq.${agentId}&select=id,reference,travel_date,traveller_count,total,amount_paid,balance_due,payment_state,operational_status,package:packages(title),documents:booking_documents(id,document_type,created_at)&order=created_at.desc&limit=100`),
    supabaseRequest(`inquiries?agent_id=eq.${agentId}&kind=eq.b2b_enquiry&select=*&order=created_at.desc&limit=100`),
    supabaseRequest(`quotations?agent_id=eq.${agentId}&select=*,lines:quotation_lines(*)&order=created_at.desc&limit=100`),settings(),
   ]);
   return json(res,200,{agent:session.profile,rates:ratesResponse.ok?await ratesResponse.json():[],bookings:bookingsResponse.ok?await bookingsResponse.json():[],enquiries:enquiriesResponse.ok?await enquiriesResponse.json():[],quotations:quotesResponse.ok?await quotesResponse.json():[],defaultMarkupPercent:Math.min(100,Math.max(0,Number(site.b2bDefaultMarkupPercent??10))),support:{phone:site.supportPhone||site.phone||"+91 8097132424",whatsapp:site.whatsapp||site.phone||"+91 8097132424"}})
  }
  if(req.method!=="POST")return json(res,405,{error:"Method not allowed"});const body=req.body||{};
  if(body.action==="create_enquiry"){
   const destination=clean(body.destination,160);const travelDate=dateOnly(body.travelDate);const pax=Math.max(1,Math.min(100,Number(body.pax||1)));const adults=Math.max(1,Math.min(pax,Number(body.adults||1)));const children=Math.max(0,Math.min(pax-adults,Number(body.children||0)));if(!destination||!travelDate)return json(res,422,{error:"Destination and a valid travel date are required"});
   const record={id:reference("NAYE"),kind:"b2b_enquiry",agent_id:agentId,name:session.profile.contact_person||session.profile.business_name,phone:session.profile.phone,email:session.profile.email,destination,status:"new",source:"B2B Partner Portal",payload:{travelDate,pax,adults,children,hotelCategory:clean(body.hotelCategory,60),transportRequired:Boolean(body.transportRequired),sightseeing:clean(body.sightseeing,1000),mealPlan:clean(body.mealPlan,80),flightRequired:Boolean(body.flightRequired),specialRequirements:clean(body.specialRequirements,3000)}};
   const insert=await supabaseRequest("inquiries",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(record)});if(!insert.ok)return json(res,502,{error:"Enquiry could not be saved"});return json(res,201,{enquiry:(await insert.json())[0]})
  }
  if(body.action==="create_quotation"){
   const enquiry=await owned(agentId,"inquiries",clean(body.enquiryId,60));if(!enquiry)return json(res,404,{error:"Enquiry not found"});
   const rate=await (async()=>{if(!uuidPattern.test(body.rateId||""))return null;const response=await supabaseRequest(`package_agent_rates?id=eq.${body.rateId}&active=eq.true&select=*,package:packages(title,destination_names)&limit=1`);const rows=response.ok?await response.json():[];return rows[0]||null})();if(!rate||Number(rate.agent_price)<0)return json(res,422,{error:"Select an active B2B rate"});
   const payload=enquiry.payload||{};const pax=Math.max(1,Number(payload.pax||1));const site=await settings();const requestedMarkup=Number(body.markupPercent);const markup=Math.min(100,Math.max(0,Number.isFinite(requestedMarkup)?requestedMarkup:Number(site.b2bDefaultMarkupPercent??10)));const agentCost=money(Number(rate.agent_price)*pax);const customerTotal=money(agentCost*(1+markup/100));const quote={reference:reference("NTQ"),inquiry_id:enquiry.id,agent_id:agentId,customer_name:clean(body.customerName,120)||"Customer",customer_email:clean(body.customerEmail,160)||null,customer_phone:clean(body.customerPhone,24)||null,title:clean(body.title,200)||rate.package?.title||`Quotation for ${enquiry.destination}`,destination:enquiry.destination,travel_start:dateOnly(payload.travelDate),traveller_count:pax,status:"draft",currency:"INR",valid_until:body.validUntil||null,subtotal:customerTotal,discount:0,tax:0,total:customerTotal,advance_required:0,agent_cost:agentCost,agent_markup_percent:markup,terms:clean(body.terms,5000)||"Subject to availability and written confirmation.",notes:clean(body.notes,5000)||null};
   const inserted=await supabaseRequest("quotations",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(quote)});if(!inserted.ok)return json(res,502,{error:"Quotation could not be created"});const [created]=await inserted.json();const line={quotation_id:created.id,description:rate.package?.title||`Travel services - ${enquiry.destination}`,quantity:1,unit_price:customerTotal,sort_order:0};const lines=await supabaseRequest("quotation_lines",{method:"POST",body:JSON.stringify(line)});if(!lines.ok){await supabaseRequest(`quotations?id=eq.${created.id}`,{method:"DELETE"});return json(res,502,{error:"Quotation line could not be saved"})}return json(res,201,{quotation:{...created,lines:[line]}})
  }
  if(body.action==="quotation_action"){
   const quote=await owned(agentId,"quotations",body.id);if(!quote)return json(res,404,{error:"Quotation not found"});const operation=body.operation;
   if(operation==="request_revision"){await supabaseRequest(`quotations?id=eq.${quote.id}`,{method:"PATCH",body:JSON.stringify({status:"draft",notes:clean(body.notes,5000)||quote.notes,updated_at:new Date().toISOString()})});return json(res,200,{updated:true,status:"draft"})}
   if(operation==="confirm"){await supabaseRequest(`quotations?id=eq.${quote.id}`,{method:"PATCH",body:JSON.stringify({status:"accepted",updated_at:new Date().toISOString()})});return json(res,200,{updated:true,status:"accepted"})}
   if(operation==="share"){const token=crypto.randomBytes(24).toString("base64url");const hash=crypto.createHash("sha256").update(token).digest("hex");await supabaseRequest(`quotations?id=eq.${quote.id}`,{method:"PATCH",body:JSON.stringify({access_token_hash:hash,status:quote.status==="draft"?"sent":quote.status,updated_at:new Date().toISOString()})});return json(res,200,{url:quoteUrl(quote,token)})}
   return json(res,422,{error:"Unknown quotation action"})
  }
  return json(res,422,{error:"Unknown action"})
 }catch(error){console.error("b2b_dashboard_failed",error);return json(res,500,{error:"Partner workspace is temporarily unavailable"})}
}
