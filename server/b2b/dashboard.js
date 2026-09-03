import quotationUpdate from "./quotation-update.js";
import crypto from "node:crypto";
import {calculateSellingPrice,currentRate} from "./pricing.js";
import {activeDeal} from "./deals.js";
import {safeAgent,updateProfile} from "./profile.js";
import { json, supabaseRequest } from "../_shared.js";
import { requirePortalUser } from "../_auth.js";
import { clean, dateOnly, money, uuidPattern } from "../_validation.js";
import { deliverNotification } from "../_notifications.js";

const reference=(prefix)=>`${prefix}-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;
const quoteUrl=(quote,token)=>`${process.env.PUBLIC_SITE_URL||"https://naystrip.vercel.app"}/quotation/${quote.reference}?token=${token}`;
const amount=(value)=>value===null||value===undefined||value===""?null:(Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null);
async function dashboardRows(response,query){
 const body=await response.json().catch(()=>null);
 if(response.ok&&Array.isArray(body))return body;
 // Only schema errors have safe message/details payloads. Other PostgreSQL
 // errors can echo row values, identifiers supplied by users, or credentials.
 const code=typeof body?.code==="string"&&/^[A-Z0-9]{5,12}$/.test(body.code)?body.code:null;
 const schemaError=["42703","42P01","PGRST200","PGRST201","PGRST204","PGRST205"].includes(code);
 console.error("b2b_dashboard_query_failed",{query,status:response.status,statusText:response.statusText,code,
  message:response.ok?"Expected an array response":schemaError?body.message:"Upstream request failed; non-schema error text withheld",
  details:schemaError?body.details??null:null});
 return null;
}
async function settings(){const response=await supabaseRequest("website_settings?id=eq.true&select=data&limit=1");const [row]=(await dashboardRows(response,"website_settings"))||[];return row?.data||{}}
async function owned(agentId,table,id,select="*"){if(!id||(table==="quotations"&&!uuidPattern.test(id)))return null;const response=await supabaseRequest(`${table}?id=eq.${encodeURIComponent(id)}&agent_id=eq.${agentId}&select=${select}&limit=1`);const rows=response.ok?await response.json():[];return rows[0]||null}

export default async function handler(req,res){
 const session=await requirePortalUser(req,res,"agent");if(!session)return;const agentId=session.profile.id;
 try{
  if(req.method==="GET"){
   const [packagesResponse,ratesResponse,bookingsResponse,enquiriesResponse,quotesResponse,site]=await Promise.all([
    supabaseRequest("packages?status=eq.published&deleted_at=is.null&select=id,slug,title,package_type,destination_names,days,nights,price_from,status&order=featured.desc,created_at.desc"),
    supabaseRequest("package_agent_rates?active=eq.true&select=id,package_id,retail_price,agent_price,markup,commission,valid_from,valid_until&order=created_at.desc"),
    supabaseRequest(`bookings?agent_id=eq.${agentId}&select=id,reference,travel_date,traveller_count,total,amount_paid,balance_due,payment_state,operational_status,package:packages(title),documents:booking_documents(id,document_type,created_at)&order=created_at.desc&limit=100`),
    supabaseRequest(`inquiries?agent_id=eq.${agentId}&kind=eq.b2b_enquiry&select=*,activities:lead_activities(id,notes,activity_type,agent_id,created_at),package:packages(id,slug,title,days,nights)&order=created_at.desc&limit=100`),
    supabaseRequest(`quotations?agent_id=eq.${agentId}&select=*,inquiry:inquiries(id,package_id,enquiry_source),lines:quotation_lines(*)&order=created_at.desc&limit=100`),settings(),
   ]);
   const [packages,rates,bookings,enquiries,quotations]=await Promise.all([
    dashboardRows(packagesResponse,"packages"),dashboardRows(ratesResponse,"package_agent_rates"),
    dashboardRows(bookingsResponse,"bookings + packages + booking_documents"),
    dashboardRows(enquiriesResponse,"inquiries + lead_activities + packages"),
    dashboardRows(quotesResponse,"quotations + inquiries + quotation_lines"),
   ]);
   if([packages,rates,bookings,enquiries,quotations].some(rows=>rows===null))return json(res,502,{error:"Partner records could not be loaded"});
   const today=new Date().toISOString().slice(0,10);const currentRates=rates.filter((rate)=>(!rate.valid_from||rate.valid_from<=today)&&(!rate.valid_until||rate.valid_until>=today));const rateByPackage=new Map([...currentRates].reverse().map((rate)=>[rate.package_id,rate]));const defaultMarkupPercent=Math.min(100,Math.max(0,(Number.isFinite(Number(site.b2bDefaultMarkupPercent))?Number(site.b2bDefaultMarkupPercent):10)));
   const catalogue=packages.map((pkg)=>{const configured=rateByPackage.get(pkg.id),publicPrice=amount(pkg.price_from),netRate=amount(configured?.agent_price??pkg.price_from),configuredMarkup=amount(configured?.markup),markupPercent=Math.min(100,configuredMarkup??defaultMarkupPercent);return {...pkg,rateId:configured?.id||null,publicPrice,netRate,markupPercent,sellingPrice:netRate===null?null:money(netRate*(1+markupPercent/100)),validFrom:configured?.valid_from||null,validUntil:configured?.valid_until||null,rateSource:configured?"configured_b2b":"public_price"}});
   return json(res,200,{agent:safeAgent(session.profile),rates:catalogue,bookings,enquiries,quotations,defaultMarkupPercent,support:{phone:site.supportPhone||site.phone||"+91 8097132424",whatsapp:site.whatsapp||site.phone||"+91 8097132424"}})
  }
  if(req.method!=="POST")return json(res,405,{error:"Method not allowed"});const body=req.body||{};
  if(body.action==="update_profile")return updateProfile(session,body,res);
  if(body.action==="follow_up"){
   const enquiry=await owned(agentId,"inquiries",clean(body.id,60));if(!enquiry)return json(res,404,{error:"Enquiry not found"});
   const note=clean(body.note,2000),followUpAt=body.followUpAt?new Date(body.followUpAt):null;if(!note||(followUpAt&&!Number.isFinite(followUpAt.getTime())))return json(res,422,{error:"A follow-up note and valid optional date are required"});
   const saved=await supabaseRequest("rpc/record_agent_follow_up",{method:"POST",body:JSON.stringify({p_agent_id:agentId,p_inquiry_id:enquiry.id,p_note:note,p_follow_up_at:followUpAt?.toISOString()||null})});return saved.ok?json(res,200,{saved:true}):json(res,502,{error:"Follow-up could not be saved"});
  }
  if(body.action==="create_enquiry"){
   if([body.adults,body.children,body.rooms].some(v=>!Number.isInteger(Number(v)))||Number(body.adults)<1||Number(body.children)<0||Number(body.rooms)<1)return json(res,422,{error:"Enter valid whole numbers for travellers and rooms"});
   const destination=clean(body.destination,160),travelDate=dateOnly(body.travelDate),adults=Math.max(1,Math.min(100,Number(body.adults||1))),children=Math.max(0,Math.min(100,Number(body.children||0))),pax=adults+children;const packageId=uuidPattern.test(body.packageId||"")?body.packageId:null;let pkg=null;
   if(packageId){const found=await supabaseRequest(`packages?id=eq.${packageId}&status=eq.published&select=id,title,destination_names,days,nights&limit=1`);[pkg]=found.ok?await found.json():[];if(!pkg)return json(res,422,{error:"Selected package is not available"})}
   if(!destination||!travelDate||!clean(body.customerName,120)||!clean(body.customerPhone,24))return json(res,422,{error:"Client, destination and a valid travel date are required"});
   const requirements=Array.isArray(body.requirements)?body.requirements.map((item)=>clean(item,50)).filter(Boolean):[];const record={id:reference("NAYE"),kind:"b2b_enquiry",agent_id:agentId,package_id:packageId,name:clean(body.customerName,120),phone:clean(body.customerPhone,24),email:clean(body.customerEmail,160)||null,destination,status:"new",source:packageId?"B2B Package Enquiry":"B2B General Enquiry",enquiry_source:packageId?"package":"general",payload:{agency:session.profile.business_name,travelDate,pax,adults,children,rooms:Math.max(1,Math.min(50,Number(body.rooms||1))),requirements,notes:clean(body.notes,3000),packageTitle:pkg?.title||null,packageDuration:pkg?`${pkg.nights}N/${pkg.days}D`:null}};
   const insert=await supabaseRequest("inquiries",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(record)});if(!insert.ok)return json(res,502,{error:"Enquiry could not be saved"});return json(res,201,{enquiry:(await insert.json())[0]})
  }
  if(body.action==="create_quotation"){
   const enquiry=await owned(agentId,"inquiries",clean(body.enquiryId,60));if(!enquiry)return json(res,404,{error:"Enquiry not found"});const packageId=enquiry.package_id||(uuidPattern.test(body.packageId||"")?body.packageId:null);if(!packageId)return json(res,422,{error:"Link a published package before creating a quotation"});
   const packageResponse=await supabaseRequest(`packages?id=eq.${packageId}&status=eq.published&select=id,title,destination_names,price_from&limit=1`);const [pkg]=packageResponse.ok?await packageResponse.json():[];if(!pkg)return json(res,422,{error:"Package is unavailable"});const rateResponse=await supabaseRequest(`package_agent_rates?package_id=eq.${packageId}&active=eq.true&select=*&order=created_at.desc`);if(!rateResponse.ok)return json(res,502,{error:"Rates unavailable"});const configuredRate=currentRate(await rateResponse.json());const unitNet=amount(configuredRate?.agent_price??pkg.price_from);if(unitNet===null||unitNet<0)return json(res,422,{error:"This package does not have an approved public or B2B rate"});
   const payload=enquiry.payload||{},pax=Number(payload.pax||1),markupType=body.markupType||"percentage",markupValue=Number(body.markupValue);
   let pricing;try{pricing=calculateSellingPrice(unitNet,pax,markupType,markupValue)}catch(error){return json(res,422,{error:error.message})}
   let discount=0;const couponCode=clean(body.couponCode,40).toUpperCase();
   if(couponCode){const response=await supabaseRequest("coupons?code=eq."+encodeURIComponent(couponCode)+"&select=*&limit=1");if(!response.ok)return json(res,502,{error:"Coupon validation unavailable"});const [coupon]=await response.json();if(!coupon||!activeDeal(coupon)||(coupon.package_id&&coupon.package_id!==packageId)||coupon.usage_limit!==null||!["percentage","fixed"].includes(coupon.discount_type))return json(res,422,{error:"Coupon unavailable for this quotation; limited-use offers require support"});discount=money(Math.min(pricing.subtotal,coupon.discount_type==="percentage"?pricing.subtotal*Number(coupon.value)/100:Number(coupon.value)));}
   const agentCost=pricing.agentCost,customerTotal=money(pricing.total-discount);
   if(!Number.isFinite(customerTotal)||customerTotal<0)return json(res,422,{error:"Invalid quotation total"});
   const quote={reference:reference("NTQ"),inquiry_id:enquiry.id,agent_id:agentId,customer_name:clean(body.customerName,120)||enquiry.name||"Customer",customer_email:clean(body.customerEmail,160)||enquiry.email||null,customer_phone:clean(body.customerPhone,24)||enquiry.phone||null,title:clean(body.title,200)||pkg.title||`Quotation for ${enquiry.destination}`,destination:enquiry.destination,travel_start:dateOnly(payload.travelDate),traveller_count:pax,status:"draft",currency:"INR",valid_until:body.validUntil||null,subtotal:pricing.subtotal,discount,tax:0,total:customerTotal,advance_required:0,agent_cost:agentCost,agent_markup_percent:markupType==="percentage"?markupValue:null,agent_markup_type:markupType,agent_markup_value:markupValue,terms:clean(body.terms,5000)||"Subject to availability and written confirmation.",notes:couponCode?"Coupon applied: "+couponCode:clean(body.notes,5000)||null};
   const inserted=await supabaseRequest("quotations",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(quote)});if(!inserted.ok)return json(res,502,{error:"Quotation could not be created"});const [created]=await inserted.json();const line={quotation_id:created.id,description:pkg.title||`Travel services - ${enquiry.destination}`,quantity:1,unit_price:pricing.subtotal,sort_order:0};const lines=await supabaseRequest("quotation_lines",{method:"POST",body:JSON.stringify(line)});if(!lines.ok){await supabaseRequest(`quotations?id=eq.${created.id}`,{method:"DELETE"});return json(res,502,{error:"Quotation line could not be saved"})}await supabaseRequest(`inquiries?id=eq.${encodeURIComponent(enquiry.id)}&agent_id=eq.${agentId}`,{method:"PATCH",body:JSON.stringify({enquiry_source:enquiry.enquiry_source||"quotation",status:"quotation_sent",updated_at:new Date().toISOString()})});return json(res,201,{quotation:{...created,lines:[line]}})
  }
  if(body.action==="quotation_action"){
   const quote=await owned(agentId,"quotations",body.id);if(!quote)return json(res,404,{error:"Quotation not found"});const operation=body.operation;
   if(operation==="request_revision"||operation==="confirm")return quotationUpdate(quote,body,res);
   if(operation==="share"||operation==="email"){const token=crypto.randomBytes(24).toString("base64url"),hash=crypto.createHash("sha256").update(token).digest("hex"),url=quoteUrl(quote,token);const shared=await supabaseRequest(`quotations?id=eq.${quote.id}`,{method:"PATCH",body:JSON.stringify({access_token_hash:hash,status:quote.status==="draft"?"sent":quote.status,updated_at:new Date().toISOString()})});if(!shared.ok)return json(res,502,{error:"Secure link could not be created"});if(operation==="share")return json(res,200,{url});const recipient=clean(body.recipient,160)||quote.customer_email;if(!recipient)return json(res,422,{error:"Customer email is missing"});const delivery=await deliverNotification({quotationId:quote.id,event:"quotation_sent",recipient,payload:{reference:quote.reference,url},idempotencyKey:`${quote.reference}:quotation:${recipient}:${crypto.randomUUID()}`});if(delivery.status!=="sent")return json(res,delivery.status==="skipped_not_configured"?503:502,{error:delivery.error||"Email delivery is not configured"});return json(res,200,{sent:true,url})}
   return json(res,422,{error:"Unknown quotation action"})
  }
  if(body.action==="create_support"){
   const subject=clean(body.subject,160),message=clean(body.message,3000);if(!subject||message.length<5)return json(res,422,{error:"Subject and message are required"});const record={id:reference("NAYS"),kind:"b2b_enquiry",agent_id:agentId,name:session.profile.contact_person||session.profile.business_name,phone:session.profile.phone,email:session.profile.email,destination:"B2B Assistance",status:"new",source:"B2B Assistance",enquiry_source:"support",payload:{subject,reference:clean(body.reference,80),message}};const insert=await supabaseRequest("inquiries",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(record)});if(!insert.ok)return json(res,502,{error:"Support request could not be saved"});return json(res,201,{enquiry:(await insert.json())[0]})
  }
  return json(res,422,{error:"Unknown action"})
 }catch(error){console.error("b2b_dashboard_failed",error);return json(res,500,{error:"Partner workspace is temporarily unavailable"})}
}
