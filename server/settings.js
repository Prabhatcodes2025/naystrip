import {json,supabaseRequest} from "./_shared.js";
export default async function handler(req,res){
 if(req.method==="GET"){try{const response=await supabaseRequest("website_settings?id=eq.true&select=data&limit=1");const rows=await response.json();if(!response.ok)return json(res,502,{error:"Settings unavailable"});return json(res,200,{settings:rows[0]?.data||{}})}catch{return json(res,200,{settings:{}})}}
 if(req.method!=="POST")return json(res,405,{error:"Method not allowed"});
 const token=String(req.headers.authorization||"").replace(/^Bearer\s+/i,"");
 if(!token||!process.env.SUPABASE_URL||!process.env.SUPABASE_ANON_KEY)return json(res,401,{error:"Authentication required"});
 const user=await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`,{headers:{apikey:process.env.SUPABASE_ANON_KEY,Authorization:`Bearer ${token}`}});const account=await user.json();
 if(!user.ok||!account.id)return json(res,401,{error:"Invalid session"});
 const role=await supabaseRequest(`admin_users?user_id=eq.${account.id}&status=eq.active&select=user_id&limit=1`);
 if(!role.ok||(await role.json()).length!==1)return json(res,403,{error:"Admin access required"});
 const allowed={travellerPhotos:Array.isArray(req.body?.travellerPhotos)?req.body.travellerPhotos.slice(0,100):[],monthlyPicks:Array.isArray(req.body?.monthlyPicks)?req.body.monthlyPicks.slice(0,50):undefined,brandName:req.body?.brandName,tagline:req.body?.tagline,phone:req.body?.phone,supportPhone:req.body?.supportPhone,whatsapp:req.body?.whatsapp,email:req.body?.email,website:req.body?.website,cancellationEmail:req.body?.cancellationEmail,address:req.body?.address,businessLegalName:req.body?.businessLegalName,gstNumber:req.body?.gstNumber,invoiceAddress:req.body?.invoiceAddress,businessHours:req.body?.businessHours,footerText:req.body?.footerText,social:req.body?.social,homepageCtaText:req.body?.homepageCtaText,topTripSlugs:Array.isArray(req.body?.topTripSlugs)?req.body.topTripSlugs.slice(0,12):[],topTrekSlugs:Array.isArray(req.body?.topTrekSlugs)?req.body.topTrekSlugs.slice(0,12):[],trustMetrics:req.body?.trustMetrics||{},team:Array.isArray(req.body?.team)?req.body.team.slice(0,20):[],socialInitiative:req.body?.socialInitiative||{},b2bDefaultMarkupPercent:Math.min(100,Math.max(0,Number(req.body?.b2bDefaultMarkupPercent??10)))};
 const saved=await supabaseRequest("website_settings?id=eq.true",{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({data:allowed,updated_at:new Date().toISOString()})});
 if(!saved.ok)return json(res,502,{error:"Settings update failed"});
 return json(res,200,{saved:true});
}
