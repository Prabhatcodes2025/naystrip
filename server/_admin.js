import {json,supabaseRequest} from "./_shared.js";

export async function activeAdminForUser(user){
  const profileResponse=await supabaseRequest(`admin_users?user_id=eq.${encodeURIComponent(user.id)}&status=eq.active&select=user_id,display_name,role_id&limit=1`);
  const profiles=await profileResponse.json().catch(()=>[]);
  if(!profileResponse.ok){console.error("admin_profile_lookup_failed",profileResponse.status,profiles);return {error:"Admin authorization service is unavailable",status:503}}
  const profile=profiles[0];
  if(!profile)return {error:"Admin access required",status:403};
  if(!profile.role_id)return {error:"An admin role must be assigned",status:403};
  const roleResponse=await supabaseRequest(`roles?id=eq.${encodeURIComponent(profile.role_id)}&select=id,name&limit=1`);
  const roles=await roleResponse.json().catch(()=>[]);
  if(!roleResponse.ok){console.error("admin_role_lookup_failed",roleResponse.status,roles);return {error:"Admin authorization service is unavailable",status:503}}
  if(!roles[0])return {error:"The assigned admin role is unavailable",status:403};
  return {admin:{...profile,role:roles[0],email:user.email}};
}

export async function requireAdmin(req,res){
  const token=String(req.headers.authorization||"").replace(/^Bearer\s+/i,"");
  if(!token){json(res,401,{error:"Admin sign-in required"});return null}
  const url=process.env.SUPABASE_URL;const anon=process.env.SUPABASE_ANON_KEY;
  if(!url||!anon){json(res,503,{error:"Admin service is not configured"});return null}
  const auth=await fetch(`${url}/auth/v1/user`,{headers:{apikey:anon,Authorization:`Bearer ${token}`}});
  if(!auth.ok){json(res,401,{error:"Session expired"});return null}
  const result=await activeAdminForUser(await auth.json());
  if(!result.admin){json(res,result.status,{error:result.error});return null}
  return result.admin;
}
export function hasFinancialPermission(admin){return ["Super Admin","Accounts"].includes(admin?.role?.name)}
