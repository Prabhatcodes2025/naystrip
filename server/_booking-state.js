export function bookingMode(pkg){
  const configured=pkg?.policies?.booking_mode;
  if(["enquiry_only","flexible_date","fixed_departure"].includes(configured))return configured;
  return pkg?.custom_enquiry_only||!pkg?.booking_enabled?"enquiry_only":"flexible_date";
}

export function calculateBookingState(pkg,departures=[]){
  const mode=bookingMode(pkg);
  const live=(departures||[]).filter(item=>["open","filling_fast"].includes(item.status)&&Number(item.available_seats)>0&&(!item.booking_cutoff||new Date(item.booking_cutoff)>new Date()));
  if(pkg?.status!=="published")return {code:"unpublished",online:false,mode,requiresDeparture:false,reason:"Package is not published"};
  if(!pkg?.booking_enabled||pkg?.custom_enquiry_only||mode==="enquiry_only")return {code:"enquiry_only",online:false,mode:"enquiry_only",requiresDeparture:false,reason:"This package is configured for custom enquiries"};
  if(mode==="fixed_departure"){
    const priced=live.filter(item=>item.price_override!=null||pkg.price_from!=null);
    if(!priced.length)return {code:"departure_required",online:false,mode,requiresDeparture:true,reason:"A live priced departure must be configured"};
    return {code:"online",online:true,mode,requiresDeparture:true,reason:"Online booking is available",departureCount:priced.length};
  }
  if(pkg?.price_from==null)return {code:"price_required",online:false,mode,requiresDeparture:false,reason:"An approved starting price must be configured"};
  return {code:"online",online:true,mode,requiresDeparture:false,reason:"Online booking is available",departureCount:live.length};
}
