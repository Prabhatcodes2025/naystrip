import { requireAdmin } from "../_admin.js";
import { json, supabaseRequest } from "../_shared.js";
import { clean, dateOnly, money, uuidPattern } from "../_validation.js";

const statuses=new Set(["open","filling_fast","sold_out","closed","completed","cancelled"]);
const recordFrom=(body)=>({package_id:body.packageId,start_date:body.startDate,end_date:body.endDate,capacity:Number(body.capacity),booked_seats:Math.max(0,Number(body.bookedSeats||0)),price_override:body.price===""?null:money(body.price),advance_amount:body.advanceAmount===""?null:money(body.advanceAmount),booking_cutoff:body.bookingCutoff||null,status:statuses.has(body.status)?body.status:"open",meeting_point:clean(body.meetingPoint,500),internal_notes:clean(body.internalNotes,2000)});
export function buildBulkDepartureRows(body){
  const packageIds=[...new Set((body.packageIds||[]).filter(id=>uuidPattern.test(id)))].slice(0,100);
  const byDate=new Map();
  for(const item of (body.dates||[]).slice(0,60)){const startDate=dateOnly(item.startDate),endDate=dateOnly(item.endDate||item.startDate);if(startDate&&endDate&&endDate>=startDate)byDate.set(startDate,{startDate,endDate,status:item.status==="closed"?"closed":"open"})}
  return packageIds.flatMap(packageId=>[...byDate.values()].map(item=>({package_id:packageId,start_date:item.startDate,end_date:item.endDate,capacity:Number(body.capacity),price_override:body.price===""||body.price==null?null:money(body.price),booking_cutoff:body.bookingCutoff||null,status:item.status,internal_notes:`Schedule: ${clean(body.scheduleName,120)}`})));
}

export default async function handler(req,res){
  const admin=await requireAdmin(req,res);if(!admin)return;
  const body=req.body||{};
  if(req.method==="GET"){
    const response=await supabaseRequest("package_departures?select=*,package:packages(title,slug)&order=start_date.asc");
    return response.ok?json(res,200,{departures:await response.json()}):json(res,502,{error:"Departures could not be loaded"});
  }
  if(!["POST","PATCH","DELETE"].includes(req.method))return json(res,405,{error:"Method not allowed"});
  if(req.method==="DELETE"){
    if(!uuidPattern.test(req.query?.id))return json(res,422,{error:"Invalid departure"});
    await supabaseRequest(`package_departures?id=eq.${req.query.id}`,{method:"PATCH",body:JSON.stringify({status:"cancelled"})});
    return json(res,200,{cancelled:true});
  }
  if(req.method==="POST"&&body.action==="bulk"){
    const rows=buildBulkDepartureRows(body);
    if(!clean(body.scheduleName,120)||!rows.length||Number(body.capacity)<1)return json(res,422,{error:"Schedule name, packages, dates and capacity are required"});
    const response=await supabaseRequest("package_departures?on_conflict=package_id,start_date",{method:"POST",headers:{Prefer:"resolution=ignore-duplicates,return=representation"},body:JSON.stringify(rows)});
    if(!response.ok)return json(res,502,{error:"Availability schedule could not be applied"});
    const created=await response.json();
    return json(res,201,{created:created.length,skipped:rows.length-created.length});
  }
  if(!uuidPattern.test(body.packageId)||!dateOnly(body.startDate)||!dateOnly(body.endDate)||Number(body.capacity)<1)return json(res,422,{error:"Package, dates and capacity are required"});
  const record=recordFrom(body);
  const response=body.id?await supabaseRequest(`package_departures?id=eq.${body.id}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(record)}):await supabaseRequest("package_departures",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(record)});
  return response.ok?json(res,body.id?200:201,{departure:(await response.json())[0]}):json(res,502,{error:"Departure could not be saved"});
}
