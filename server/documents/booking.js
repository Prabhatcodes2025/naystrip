import { authUser } from "../_auth.js";
import { bookingForDocuments, generateAndStoreDocument, invoiceForDocuments } from "../_document-service.js";
import { json, supabaseRequest } from "../_shared.js";
import { downloadBookingDocument } from "../_storage.js";
import { DOCUMENT_FORMATS, GENERATED_DOCUMENT_TYPES } from "./_document-data.js";

async function isAdmin(userId){const response=await supabaseRequest(`admin_users?user_id=eq.${userId}&status=eq.active&select=user_id&limit=1`);const body=await response.json();return response.ok&&Array.isArray(body)&&body.length>0}
const extension=(document)=>document.document_format||document.original_filename?.split(".").pop()||(document.content_type?.includes("wordprocessingml")?"docx":"pdf");
const disposition=(req,filename)=>`${req.query?.disposition==="inline"?"inline":"attachment"}; filename="${filename.replace(/[^A-Za-z0-9._-]/g,"-")}"`;
async function ownsAgentBooking(userId,agentId){if(!agentId)return false;const response=await supabaseRequest(`b2b_agents?id=eq.${agentId}&user_id=eq.${userId}&verification_status=eq.approved&select=id&limit=1`);return response.ok&&(await response.json()).length===1}

export default async function handler(req,res){
  if(req.method!=="GET")return json(res,405,{error:"Method not allowed"});
  const user=await authUser(req);if(!user)return json(res,401,{error:"Sign in to access documents"});const admin=await isAdmin(user.id);
  try{
    const documentId=String(req.query?.documentId||"").replace(/[^a-f0-9-]/gi,"");
    if(documentId){
      const response=await supabaseRequest(`booking_documents?id=eq.${documentId}&select=*,booking:bookings(reference,customer_id,agent_id),invoice:invoices(invoice_number,booking_id)&limit=1`);const documents=await response.json();
      if(!response.ok||!Array.isArray(documents)){console.error("booking_document_lookup_failed",{status:response.status,error:documents});return json(res,502,{error:"Document could not be loaded"})}
      const document=documents[0];if(!document)return json(res,404,{error:"Document not found"});if(!admin&&document.booking?.customer_id!==user.id&&!await ownsAgentBooking(user.id,document.booking?.agent_id))return json(res,403,{error:"You do not have access to this document"});
      const bytes=await downloadBookingDocument(document.storage_path);const format=extension(document);const filename=document.original_filename||`${document.display_name||document.document_type}.${format}`;res.setHeader("Content-Type",document.content_type||(format==="docx"?"application/vnd.openxmlformats-officedocument.wordprocessingml.document":"application/pdf"));res.setHeader("Content-Disposition",disposition(req,filename));res.setHeader("Cache-Control","private, no-store");return res.status(200).send(bytes);
    }
    const type=String(req.query?.type||"hotel_voucher");const format=String(req.query?.format||"pdf");if(!GENERATED_DOCUMENT_TYPES.has(type)||!DOCUMENT_FORMATS.has(format))return json(res,422,{error:"Choose a valid document type and format"});
    const invoiceId=String(req.query?.invoiceId||"").replace(/[^a-f0-9-]/gi,"");let invoice=null,booking=null;
    if(invoiceId){if(!admin)return json(res,403,{error:"Admin access is required"});invoice=await invoiceForDocuments(invoiceId);if(!invoice)return json(res,404,{error:"Invoice not found"});if(invoice.booking_id)booking=await bookingForDocuments({id:invoice.booking_id});}
    else {const reference=String(req.query?.reference||"").replace(/[^A-Z0-9-]/gi,"").slice(0,60);booking=await bookingForDocuments({reference});if(!admin&&booking.customer_id!==user.id)return json(res,403,{error:"You do not have access to this booking"});if(type==="invoice"){const response=await supabaseRequest(`invoices?booking_id=eq.${booking.id}&status=eq.finalized&select=*&order=updated_at.desc&limit=1`);const body=await response.json();if(response.ok&&Array.isArray(body))invoice=body[0]||null;}}
    const generated=await generateAndStoreDocument({booking,invoice,type,format,actorId:admin?user.id:null,requireStorage:false});const filename=`${generated.model.filenameBase}.${format}`;res.setHeader("Content-Type",generated.contentType);res.setHeader("Content-Disposition",disposition(req,filename));res.setHeader("Cache-Control","private, no-store");return res.status(200).send(generated.bytes);
  }catch(error){console.error("document_request_failed",{query:req.query,error});return json(res,error.statusCode||500,{error:[404,502].includes(error.statusCode)?error.message:"Document could not be generated or loaded"})}
}
