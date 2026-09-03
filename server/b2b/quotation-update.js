import {json,supabaseRequest} from "../_shared.js";
import {clean} from "../_validation.js";
export default async function quotationUpdate(quote,body,res){
 const operation=body.operation;
 if(["accepted","rejected","expired"].includes(quote.status))return json(res,409,{error:"This quotation can no longer be changed"});
 if(operation==="confirm"&&quote.valid_until&&Date.parse(quote.valid_until)<Date.now())return json(res,409,{error:"Quotation has expired; request a revised quotation"});
 const note=clean(body.notes,2000);if(operation==="request_revision"&&!note)return json(res,422,{error:"Describe the requested revision"});
 const status=operation==="confirm"?"accepted":"draft",notes=operation==="request_revision"?`${quote.notes||""}\nRevision requested ${new Date().toISOString()}: ${note}`:quote.notes;
 const saved=await supabaseRequest(`quotations?id=eq.${quote.id}&status=eq.${quote.status}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({status,notes,updated_at:new Date().toISOString()})});
 if(!saved.ok||(await saved.json()).length!==1)return json(res,409,{error:"Quotation changed or could not be saved. Refresh and retry."});return json(res,200,{updated:true,status});
}
