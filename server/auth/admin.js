import {activeAdminForUser,requireAdmin} from "../_admin.js";
import {guard,json} from "../_shared.js";

export default async function handler(req,res){
  if(req.method==="GET"){
    const admin=await requireAdmin(req,res);
    if(!admin)return;
    return json(res,200,{admin:{displayName:admin.display_name,role:admin.role.name,email:admin.email}});
  }
  if(!guard(req,res))return;
  const {email,password}=req.body||{};
  if(!email||!password)return json(res,422,{error:"Email and password are required"});
  if(!process.env.SUPABASE_URL||!process.env.SUPABASE_ANON_KEY||!process.env.SUPABASE_SERVICE_ROLE_KEY)return json(res,503,{error:"Authentication is not configured"});
  const auth=await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:{apikey:process.env.SUPABASE_ANON_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})});
  const data=await auth.json();
  if(!auth.ok)return json(res,401,{error:"Invalid credentials"});
  const result=await activeAdminForUser(data.user);
  if(!result.admin)return json(res,result.status,{error:result.error});
  return json(res,200,{access_token:data.access_token,expires_in:data.expires_in,admin:{displayName:result.admin.display_name,role:result.admin.role.name}});
}
