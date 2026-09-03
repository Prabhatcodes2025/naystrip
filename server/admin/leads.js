import {uuidPattern} from "../_validation.js";
import {requireAdmin} from "../_admin.js";
import {json,supabaseRequest} from "../_shared.js";
const clean=(value,max=1000)=>String(value??"").trim().replace(/[<>]/g,"").slice(0,max);
export default async function handler(req,res){const admin=await requireAdmin(req,res);if(!admin)return;
 try{
  if(req.method==="GET"){const status=clean(req.query?.status,30);const kind=clean(req.query?.kind||"custom_trip",30);const select=kind==="b2b_enquiry"?"*,activities:lead_activities(id,notes,activity_type,agent_id,created_at),agent:b2b_agents(id,business_name),package:packages(id,title,slug)":"*";const agentId=uuidPattern.test(req.query?.agentId||"")?req.query.agentId:null;const query=`inquiries?kind=eq.${encodeURIComponent(kind)}${status?`&status=eq.${encodeURIComponent(status)}`:""}${agentId?"&agent_id=eq."+agentId:""}&select=${select}&order=created_at.desc&limit=500`;const response=await supabaseRequest(query);const rows=await response.json();if(!response.ok)return json(res,502,{error:"Unable to load leads"});return json(res,200,{leads:rows})}
  if(req.method==="PATCH"){const id=clean(req.body?.id,60);const status=clean(req.body?.status,30).toLowerCase();const allowed=["new","contacted","qualified","quotation_sent","follow-up","converted","lost","spam","closed"];if(!id||!allowed.includes(status))return json(res,422,{error:"Invalid lead update"});const response=await supabaseRequest(`inquiries?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({status,follow_up_at:req.body?.followUpAt||null,updated_at:new Date().toISOString()})});if(!response.ok)return json(res,502,{error:"Unable to update lead"});if(req.body?.note)await supabaseRequest("lead_activities",{method:"POST",body:JSON.stringify({inquiry_id:id,actor:admin.user_id,activity_type:"note",notes:clean(req.body.note,2000)})});return json(res,200,{ok:true})}
  return json(res,405,{error:"Method not allowed"});
 }catch(error){console.error("admin_leads_failed",error);return json(res,500,{error:"Admin service unavailable"})}
}
