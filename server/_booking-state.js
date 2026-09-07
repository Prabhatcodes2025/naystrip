export function bookingMode(pkg){
  const configured=pkg?.policies?.booking_mode;
  if(["enquiry_only","flexible_date","fixed_departure"].includes(configured))return configured;
  return pkg?.custom_enquiry_only||!pkg?.booking_enabled?"enquiry_only":"flexible_date";
}

export function calculateBookingState(pkg,departures=[]){
  const mode=bookingMode(pkg);
  const today=new Date().toISOString().slice(0,10);const live=(departures||[]).filter(item=>item.start_date>=today&&["open","filling_fast"].includes(item.status)&&Number(item.available_seats)>0&&(!item.booking_cutoff||new Date(item.booking_cutoff)>new Date()));
  if(pkg?.status!=="published")return {code:"unpublished",online:false,mode,requiresDeparture:false,reason:"Package is not published"};
  if(!pkg?.booking_enabled||pkg?.custom_enquiry_only||mode==="enquiry_only")return {code:"enquiry_only",online:false,mode:"enquiry_only",requiresDeparture:false,reason:"This package is configured for custom enquiries"};
  const priced=live.filter(item=>item.price_override!=null||pkg.price_from!=null);
  if(!priced.length)return {code:"departure_required",online:false,mode,requiresDeparture:true,reason:"An available Admin-configured date and approved price are required"};
  return {code:"online",online:true,mode,requiresDeparture:true,reason:"Online booking is available for the listed dates",departureCount:priced.length};
}
