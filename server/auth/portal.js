import {guard,json,supabaseRequest} from "../_shared.js";
import {normalizeEmail,validEmail} from "../_validation.js";

export default async function handler(req,res){
 if(!guard(req,res))return;
 const {password,portal}=req.body||{},email=normalizeEmail(req.body?.email);
 if(!validEmail(email)||!password||!["customer","agent"].includes(portal))return json(res,422,{error:"Enter a valid email and complete all required fields"});
 if(!process.env.SUPABASE_URL||!process.env.SUPABASE_ANON_KEY)return json(res,503,{error:"Portal authentication is being configured"});
 const auth=await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:{apikey:process.env.SUPABASE_ANON_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})});
 const data=await auth.json();
 if(!auth.ok){const message=String(data.msg||data.error_description||"");return json(res,401,{error:/confirm/i.test(message)?"Confirm your email before signing in.":"Email or password is incorrect"})}
 const table=portal==="agent"?"b2b_agents":"customers";const profile=await supabaseRequest(`${table}?user_id=eq.${data.user.id}&select=*&limit=1`);const [row]=await profile.json();
 if(!profile.ok||!row)return json(res,403,{error:`This account is not registered for the ${portal==="agent"?"partner":"customer"} portal`});
 if(portal==="agent"&&row.verification_status!=="approved"){const rejected=row.verification_status==="rejected";return json(res,403,{error:rejected?"Your partner application was not approved. Contact support if you need a review.":"Your partner application is pending approval.",verification_status:row.verification_status})}
 return json(res,200,{access_token:data.access_token,expires_in:data.expires_in,portal});
}
