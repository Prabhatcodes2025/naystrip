import { supabaseRequest } from "./_shared.js";
import { uploadBookingDocument } from "./_storage.js";
import { generateBookingDocument } from "./documents/_booking-docs.js";

export const bookingDocumentSelect="*,package:packages(title,slug,destination_names,days,nights,start_point,end_point,policies,itinerary:package_itinerary_days(day_number,title,description,meals,stay,transfers,activities)),customer:customers(*),travellers:booking_travellers(full_name,first_name,last_name,traveller_type),addons:booking_addons(*),payments(*)";

async function responseRows(response,label){const body=await response.json();const name={booking_document_data:"Booking document data",invoice_data:"Invoice data",document_metadata:"Document metadata"}[label]||label.replaceAll("_"," ");if(!response.ok){console.error(`${label}_failed`,{status:response.status,error:body});throw Object.assign(new Error(`${name} could not be loaded`),{statusCode:502})}if(!Array.isArray(body)){console.error(`${label}_invalid_shape`,{body});throw Object.assign(new Error(`${name} returned an invalid response`),{statusCode:502})}return body}

export async function bookingForDocuments({id,reference}){
  const filter=id?`id=eq.${encodeURIComponent(id)}`:`reference=eq.${encodeURIComponent(reference)}`;
  const rows=await responseRows(await supabaseRequest(`bookings?${filter}&select=${bookingDocumentSelect}&limit=1`),"booking_document_data");
  const booking=rows[0];if(!booking)throw Object.assign(new Error("Booking not found"),{statusCode:404});booking.itinerary=booking.package?.itinerary||[];return booking;
}

export async function invoiceForDocuments(id){
  if(!id)return null;const rows=await responseRows(await supabaseRequest(`invoices?id=eq.${encodeURIComponent(id)}&select=*&limit=1`),"invoice_data");return rows[0]||null;
}

export async function latestDocument({bookingId=null,invoiceId=null,type,format}){
  const owner=bookingId?`booking_id=eq.${encodeURIComponent(bookingId)}`:`invoice_id=eq.${encodeURIComponent(invoiceId)}`;
  const rows=await responseRows(await supabaseRequest(`booking_documents?${owner}&document_type=eq.${type}&document_format=eq.${format}&select=*&order=version.desc&limit=1`),"document_metadata");return rows[0]||null;
}

export async function generateAndStoreDocument({booking=null,invoice=null,type,format="pdf",actorId=null,requireStorage=true}){
  const generated=await generateBookingDocument(booking,type,format,{invoice});
  const ownerId=booking?.id||invoice?.id;if(!ownerId)throw new Error("Document owner is unavailable");
  let current=null;try{current=await latestDocument({bookingId:booking?.id,invoiceId:invoice?.id,type,format})}catch(error){if(requireStorage)throw error;console.error("document_version_lookup_failed",{type,format,error})}
  const version=Number(current?.version||0)+1;
  const folder=booking?.id?`bookings/${booking.id}`:`invoices/${invoice.id}`;
  const path=`${folder}/${type}/v${version}.${format}`;
  const stored=await uploadBookingDocument(path,generated.bytes,generated.contentType);
  if(!stored.configured){if(requireStorage)throw new Error("Private booking-document storage is not configured");return {...generated,stored:false,path:null,version:null,document:null}}
  const metadata={booking_id:booking?.id||null,invoice_id:invoice?.id||null,document_type:type,document_format:format,storage_path:path,version,display_name:generated.model.filenameBase,original_filename:`${generated.model.filenameBase}.${format}`,content_type:generated.contentType,uploaded_by:actorId||null};
  const inserted=await supabaseRequest("booking_documents",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(metadata)});const body=await inserted.json();if(!inserted.ok||!Array.isArray(body)||!body[0]){console.error("document_metadata_insert_failed",{status:inserted.status,error:body,metadata});throw new Error("Document metadata could not be saved")}
  const document=body[0];
  if(booking?.id){const column={hotel_voucher:"voucher_storage_path",invoice:"invoice_storage_path",itinerary:"itinerary_storage_path"}[type];if(column)await supabaseRequest(`bookings?id=eq.${booking.id}`,{method:"PATCH",body:JSON.stringify({[column]:path,updated_at:new Date().toISOString()})})}
  return {...generated,stored:true,path,version,document};
}

export async function ensureLatestDocument(options){
  const existing=await latestDocument({bookingId:options.booking?.id,invoiceId:options.invoice?.id,type:options.type,format:options.format||"pdf"});
  if(existing)return {document:existing,generated:false};
  const result=await generateAndStoreDocument(options);return {document:result.document,bytes:result.bytes,model:result.model,generated:true};
}

export async function generateAndStoreBookingDocuments(bookingId,types=["hotel_voucher","transport_voucher","itinerary","invoice"]){
  const booking=await bookingForDocuments({id:bookingId});const results=[];
  for(const type of types){for(const format of ["pdf","docx"]){const result=await generateAndStoreDocument({booking,type,format});results.push({type,format,status:"stored",path:result.path})}}
  return results;
}
