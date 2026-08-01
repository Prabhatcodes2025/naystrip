import {guard,json,supabaseRequest} from "./_shared.js";
const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;const phone=/^[+\d][\d\s()-]{7,20}$/;
const clean=(v,max=500)=>String(v??"").trim().replace(/[<>]/g,"").slice(0,max);
export default async function handler(req,res){
 if(!guard(req,res))return;
 const {kind,payload={},clientReference,website}=req.body||{};
 if(website!=="naystrip.com"||!['contact','custom_trip'].includes(kind))return json(res,400,{error:"Invalid request"});
 const name=clean(payload.name||`${payload.firstName||""} ${payload.lastName||""}`,120);const phoneNumber=clean(payload.phone,24);const emailAddress=clean(payload.email,160);
 if(!name||!phone.test(phoneNumber)||(emailAddress&&!email.test(emailAddress)))return json(res,422,{error:"Please check your name, phone and email."});
 const record={id:clean(clientReference,60),kind,name,phone:phoneNumber,email:emailAddress||null,destination:clean(payload.destination||payload.to,160)||null,payload,source:clean(payload.source,160)||"Website",status:"new"};
 try{const db=await supabaseRequest("inquiries",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(record)});if(!db.ok){const detail=await db.text();console.error("lead_insert_failed",db.status,detail.slice(0,300));return json(res,502,{error:"We could not save your request. Please call or WhatsApp us."});}const rows=await db.json();return json(res,201,{id:rows[0]?.id||record.id});}
 catch(err){if(err.message==="SERVICE_NOT_CONFIGURED")return json(res,503,{error:"Online enquiries are being configured. Please call +91 8097132424 or WhatsApp +91 7710991126."});console.error("lead_handler_failed",err);return json(res,500,{error:"Please call or WhatsApp us to continue."});}
}
