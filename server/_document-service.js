import {supabaseRequest} from "./_shared.js";
import {bookingDocument} from "./documents/_booking-docs.js";
import {uploadBookingDocument} from "./_storage.js";

export async function generateAndStoreBookingDocuments(bookingId,types=["voucher","itinerary","invoice","receipt"]){
 const response=await supabaseRequest(`bookings?id=eq.${bookingId}&select=*,package:packages(title,slug,destination_names,days,nights,start_point,itinerary:package_itinerary_days(day_number,title,description,meals,stay,transfers,activities)),travellers:booking_travellers(full_name,first_name,last_name,traveller_type),payments(*)&limit=1`);
 const bookings=await response.json();
 if(!response.ok){console.error("booking_document_service_query_failed",{bookingId,status:response.status,error:bookings});throw new Error("Booking document data could not be loaded")}
 const booking=bookings[0];if(!booking)throw new Error("Booking not found");booking.itinerary=booking.package?.itinerary||[];
 const results=[];
 for(const type of types){
  const bytes=await bookingDocument(booking,type);const path=`bookings/${booking.id}/${type}.pdf`;const stored=await uploadBookingDocument(path,bytes);
  if(!stored.configured){results.push({type,status:"skipped_not_configured"});continue}
  const existing=await supabaseRequest(`booking_documents?booking_id=eq.${booking.id}&document_type=eq.${type}&storage_path=eq.${encodeURIComponent(path)}&select=id&limit=1`);const rows=await existing.json();
  if(!rows.length)await supabaseRequest("booking_documents",{method:"POST",body:JSON.stringify({booking_id:booking.id,document_type:type,storage_path:path,version:1})});
  const column={voucher:"voucher_storage_path",invoice:"invoice_storage_path",receipt:"receipt_storage_path",itinerary:"itinerary_storage_path"}[type];await supabaseRequest(`bookings?id=eq.${booking.id}`,{method:"PATCH",body:JSON.stringify({[column]:path,updated_at:new Date().toISOString()})});results.push({type,status:"stored",path});
 }
 return results;
}
