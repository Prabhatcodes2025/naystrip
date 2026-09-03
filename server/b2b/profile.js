import crypto from "node:crypto";
import {json,supabaseRequest} from "../_shared.js";
import {clean} from "../_validation.js";
export const safeAgent=profile=>({...profile,bank_details:{holder:profile.bank_details?.holder,ifsc:profile.bank_details?.ifsc,accountLast4:profile.bank_details?.accountLast4}});
export async function updateProfile(session,body,res){
 const patch=Object.fromEntries(["business_name","contact_person","phone","address","website","business_type","gst_number"].map(k=>[k,clean(body[k],k==="address"?500:160)]));
 if(!patch.business_name||!patch.contact_person||!/^\+?[0-9 ()-]{10,24}$/.test(patch.phone))return json(res,422,{error:"Company, contact name and valid phone are required"});
 patch.gst_number=patch.gst_number.toUpperCase();if(patch.gst_number&&!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(patch.gst_number))return json(res,422,{error:"Invalid GST number"});
 const bank={...session.profile.bank_details,holder:clean(body.bank_holder,120),ifsc:clean(body.bank_ifsc,11).toUpperCase()};
 if(bank.ifsc&&!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bank.ifsc))return json(res,422,{error:"Invalid IFSC"});
 if(body.bank_account){
  const account=clean(body.bank_account,24);if(!/^\d{8,20}$/.test(account)||!bank.holder||!bank.ifsc)return json(res,422,{error:"Valid account number, holder and IFSC are required"});
  const key=crypto.createHash("sha256").update(process.env.SUPABASE_SERVICE_ROLE_KEY).digest(),iv=crypto.randomBytes(12),cipher=crypto.createCipheriv("aes-256-gcm",key,iv);
  bank.encrypted=Buffer.concat([cipher.update(account,"utf8"),cipher.final()]).toString("base64");bank.iv=iv.toString("base64");bank.tag=cipher.getAuthTag().toString("base64");bank.accountLast4=account.slice(-4);
 }
 patch.bank_details=bank;patch.updated_at=new Date().toISOString();
 const saved=await supabaseRequest(`b2b_agents?id=eq.${session.profile.id}`,{method:"PATCH",body:JSON.stringify(patch)});
 return saved.ok?json(res,200,{saved:true}):json(res,502,{error:"Profile could not be saved"});
}
