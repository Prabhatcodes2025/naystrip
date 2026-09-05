import { tours } from "../src/data/tours.js";
import { treks, expeditions } from "../src/data/treksExpeditions.js";

const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing.");
const headers={apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json"};
const request=async(path,options={})=>{const response=await fetch(`${url}/rest/v1/${path}`,{...options,headers:{...headers,...options.headers}});if(!response.ok)throw new Error(`${path}: ${response.status} ${await response.text()}`);return response.status===204?null:response.json()};
const durationDays=value=>Number(String(value||"").match(/\d+/)?.[0]||1);
const sources=[...tours.map(item=>({...item,_type:"tour"})),...treks.map(item=>({...item,_type:"trek"})),...expeditions.map(item=>({...item,_type:"expedition"}))];
const existing=new Set((await request("packages?select=slug")).map(item=>item.slug));
let inserted=0,skipped=0;
for(const item of sources){
 if(existing.has(item.slug)){skipped++;continue}
 const isTour=item._type==="tour",days=isTour?item.days:durationDays(item.duration),title=item.title||item.name;
 const destinationNames=isTour?(item.destinations||[item.destination]).filter(Boolean):[item.country].filter(Boolean);
 const destinationsText=destinationNames.join(" ").toLowerCase();
 const menuCategoryIds=isTour?(destinationsText.includes("goa")?["dom-goa"]:destinationsText.includes("leh")||destinationsText.includes("ladakh")?["dom-leh-ladakh"]:["dom-maharashtra"]):item.country?.toLowerCase().includes("nepal")?["intl-nepal"]:[item._type==="expedition"?"himalaya-expeditions":"himalaya-treks"];
 const primaryPlacement=isTour?"tours-domestic":"treks-himalaya";
 const row={slug:item.slug,title,package_type:item._type,destination_names:destinationNames,nights:Math.max(0,days-1),days,overview:item.overview||"",short_description:item.overview||"",hero_image:item.image||null,gallery:item.gallery||[],price_from:item.price!==null&&item.price!==undefined&&Number.isFinite(Number(item.price))?Number(item.price):null,source:"static-import-v1",status:"published",booking_enabled:false,custom_enquiry_only:true,policies:{booking_mode:"enquiry_only",primaryPlacement,menuCategoryIds,staticImportVersion:1},seo:{title:`${title} | NaysTrip & Treks`,description:item.overview||""}};
 const [saved]=await request("packages",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(row)});
 const itinerary=(item.itinerary||[]).map((day,index)=>({package_id:saved.id,day_number:index+1,title:day.title||`Day ${index+1}`,description:day.details||day.description||"",sort_order:index+1}));
 if(itinerary.length)await request("package_itinerary_days",{method:"POST",body:JSON.stringify(itinerary)});
 const items=[...(item.inclusions||[]).map((body,index)=>({package_id:saved.id,item_type:"inclusion",body,sort_order:index})),...(item.exclusions||[]).map((body,index)=>({package_id:saved.id,item_type:"exclusion",body,sort_order:index})),...(item.notes||[]).map((body,index)=>({package_id:saved.id,item_type:"note",body,sort_order:index})),...(item.faqs||[]).map((faq,index)=>({package_id:saved.id,item_type:"faq",body:`${faq.q}\n${faq.a}`,sort_order:index}))];
 if(items.length)await request("package_items",{method:"POST",body:JSON.stringify(items)});
 inserted++;
}
console.log(JSON.stringify({sourceCount:sources.length,inserted,skipped,overwritten:0,b2bRatesCreated:0}));
