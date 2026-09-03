import { json, supabaseRequest } from "../_shared.js";
import { requirePortalUser } from "../_auth.js";
import { requireAdmin } from "../_admin.js";
import { clean, uuidPattern } from "../_validation.js";
export const activeDeal=(deal,now=Date.now())=>deal.active&&["all","b2b"].includes(deal.audience)&&(!deal.starts_at||Date.parse(deal.starts_at)<=now)&&(!deal.ends_at||Date.parse(deal.ends_at)>=now)&&Number.isFinite(Number(deal.value))&&Number(deal.value)>0;
export async function agentDeals(req,res){if(!await requirePortalUser(req,res,"agent"))return;if(req.method!=="GET")return json(res,405,{error:"Method not allowed"});const response=await supabaseRequest("coupons?active=eq.true&audience=in.(all,b2b)&select=*&order=created_at.desc");return response.ok?json(res,200,{deals:(await response.json()).filter(d=>activeDeal(d))}):json(res,502,{error:"Deals unavailable"})}
export async function adminDeals(req,res){
 const admin=await requireAdmin(req,res);if(!admin)return;
 if(!["Super Admin","B2B Manager"].includes(admin.role?.name))return json(res,403,{error:"B2B management access required"});
 if(req.method==="GET"){const response=await supabaseRequest("coupons?select=*&order=created_at.desc");return response.ok?json(res,200,{deals:await response.json()}):json(res,502,{error:"Deals unavailable"})}
 if(req.method!=="POST")return json(res,405,{error:"Method not allowed"});const b=req.body||{},value=Number(b.value);
 if(!/^[A-Z0-9_-]{2,40}$/.test(b.code||"")||!clean(b.title,160)||!["percentage","fixed"].includes(b.discount_type)||!Number.isFinite(value)||value<=0||(b.discount_type==="percentage"&&value>100)||!["b2b","customer","all"].includes(b.audience))return json(res,422,{error:"Enter a valid code, title, audience and benefit"});
 if((b.starts_at&&!Number.isFinite(Date.parse(b.starts_at)))||(b.ends_at&&!Number.isFinite(Date.parse(b.ends_at)))||(b.starts_at&&b.ends_at&&Date.parse(b.ends_at)<=Date.parse(b.starts_at))||(b.package_id&&!uuidPattern.test(b.package_id)))return json(res,422,{error:"Check validity dates and package ID"});
 if(b.id&&!uuidPattern.test(b.id))return json(res,422,{error:"Invalid coupon"});
 const saved=await supabaseRequest(b.id?`coupons?id=eq.${b.id}`:"coupons",{method:b.id?"PATCH":"POST",body:JSON.stringify({code:b.code,title:clean(b.title,160),discount_type:b.discount_type,value,audience:b.audience,starts_at:b.starts_at||null,ends_at:b.ends_at||null,package_id:b.package_id||null,active:b.active===true})});
 return saved.ok?json(res,200,{saved:true}):json(res,502,{error:"Coupon could not be saved; check for duplicate codes"});
}
