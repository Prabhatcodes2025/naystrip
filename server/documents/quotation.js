import {authUser} from "../_auth.js";
import {supabaseRequest} from "../_shared.js";
import {createDocumentPdf} from "./_document-pdf.js";
import {createDocumentDocx} from "./_docx.js";
import {documentSettings} from "./_document-data.js";

const money=value=>`INR ${Number(value||0).toLocaleString("en-IN",{maximumFractionDigits:2})}`;

export function quotationDocumentModel(quote){
 const lines=(quote.quotation_lines||quote.lines||[]).sort((a,b)=>a.sort_order-b.sort_order);
 return {title:"TRAVEL QUOTATION",subtitle:quote.title,reference:quote.reference,status:quote.status,metaLayout:"compact",meta:[{label:"Quotation",value:quote.reference},{label:"Prepared for",value:quote.customer_name},{label:"Destination",value:quote.destination||"On request"},{label:"Valid until",value:quote.valid_until||"Confirmed in writing"}],sections:[{heading:"Customer",layout:"grid",rows:[{label:"Email",value:quote.customer_email||"Not supplied"},{label:"Phone",value:quote.customer_phone||"Not supplied"},{label:"Travel start",value:quote.travel_start||"On request"},{label:"Travel end",value:quote.travel_end||"On request"}]},{heading:"Services",table:{widths:[5,1,2,2],headers:["Description","Qty","Unit price","Amount"],rows:lines.map(line=>[line.description,String(line.quantity),money(line.unit_price),money(Number(line.quantity)*Number(line.unit_price))])}},{heading:"Quotation total",layout:"fare",rows:[{label:"Subtotal",value:money(quote.subtotal)},...(Number(quote.discount)?[{label:"Discount",value:`- ${money(quote.discount)}`}]:[]),...(Number(quote.tax)?[{label:"Tax",value:money(quote.tax)}]:[]),{label:"TOTAL",value:money(quote.total)}]},...(quote.terms?[{heading:"Terms",text:quote.terms}]:[])]};
}

export default async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 const user=await authUser(req);if(!user)return res.status(401).json({error:"Sign in required"});
 const id=String(req.query?.id||"").replace(/[^a-f0-9-]/gi,"");
 const response=await supabaseRequest(`quotations?id=eq.${encodeURIComponent(id)}&select=*,quotation_lines(*)&limit=1`);const body=await response.json();const quote=Array.isArray(body)?body[0]:null;
 if(!response.ok||!quote)return res.status(404).json({error:"Quotation not found"});
 const [admins,agents]=await Promise.all([supabaseRequest(`admin_users?user_id=eq.${user.id}&status=eq.active&select=user_id&limit=1`),supabaseRequest(`b2b_agents?user_id=eq.${user.id}&verification_status=eq.approved&select=id&limit=1`)]);const adminRows=admins.ok?await admins.json():[];const agentRows=agents.ok?await agents.json():[];
 if(!adminRows[0]&&agentRows[0]?.id!==quote.agent_id)return res.status(403).json({error:"Quotation access denied"});
 const settings=await documentSettings(),model=quotationDocumentModel(quote),format=String(req.query?.format||"").toLowerCase();
 const bytes=format==="docx"?await createDocumentDocx(model,settings):await createDocumentPdf(model,settings);
 res.setHeader("Content-Type",format==="docx"?"application/vnd.openxmlformats-officedocument.wordprocessingml.document":"application/pdf");res.setHeader("Content-Disposition",`attachment; filename="${quote.reference}.${format==="docx"?"docx":"pdf"}"`);res.setHeader("Cache-Control","private, no-store");return res.status(200).send(bytes);
}
