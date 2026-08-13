import {json,supabaseRequest} from "./_shared.js";
export default async function handler(req,res){
 if(req.method!=="POST")return json(res,405,{error:"Method not allowed"});
 const token=String(req.headers.authorization||"").replace(/^Bearer\s+/i,"");
 if(!token||!process.env.SUPABASE_URL||!process.env.SUPABASE_ANON_KEY)return json(res,401,{error:"Authentication required"});
 const user=await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`,{headers:{apikey:process.env.SUPABASE_ANON_KEY,Authorization:`Bearer ${token}`}});const account=await user.json();
 if(!user.ok||!account.id)return json(res,401,{error:"Invalid session"});
 const role=await supabaseRequest(`admin_users?user_id=eq.${account.id}&status=eq.active&select=user_id&limit=1`);
 if(!role.ok||(await role.json()).length!==1)return json(res,403,{error:"Admin access required"});
 const allowed={brandName:req.body?.brandName,tagline:req.body?.tagline,phone:req.body?.phone,supportPhone:req.body?.supportPhone,whatsapp:req.body?.whatsapp,email:req.body?.email,cancellationEmail:req.body?.cancellationEmail,address:req.body?.address,businessHours:req.body?.businessHours,footerText:req.body?.footerText,social:req.body?.social,homepageCtaText:req.body?.homepageCtaText};
 const saved=await supabaseRequest("website_settings?id=eq.true",{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({data:allowed,updated_at:new Date().toISOString()})});
 if(!saved.ok)return json(res,502,{error:"Settings update failed"});
 return json(res,200,{saved:true});
}
