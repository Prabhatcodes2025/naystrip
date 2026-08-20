import { json, supabaseRequest } from "./_shared.js";
import { calculateBookingState } from "./_booking-state.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  try {
    const slug=String(req.query?.slug||"").toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,150);
    if(slug){
      const response=await supabaseRequest(`packages?slug=eq.${encodeURIComponent(slug)}&status=eq.published&deleted_at=is.null&select=*,itinerary:package_itinerary_days(*),items:package_items(*),departures:package_departures(*)&limit=1`);
      const [pkg]=await response.json();
      if(!response.ok)return json(res,502,{error:"Package catalogue unavailable"});
      if(!pkg)return json(res,404,{error:"Package not found"});
      pkg.booking_state=calculateBookingState(pkg,pkg.departures||[]);
      return json(res,200,{package:pkg,configured:true});
    }
    const response = await supabaseRequest(
      "packages?status=eq.published&deleted_at=is.null&select=id,slug,title,package_type,destination_names,days,nights,short_description,hero_image,price_from,booking_enabled,custom_enquiry_only,featured,status,policies,package_departures(id,start_date,available_seats,price_override,booking_cutoff,status)&order=featured.desc,title.asc",
    );
    const rows = await response.json();
    if (!response.ok) return json(res, 502, { error: "Package catalogue unavailable" });
    const packages = rows.map((pkg) => ({
      ...pkg,
      booking_state: calculateBookingState(pkg, pkg.package_departures || []),
      package_departures: undefined,
    }));
    return json(res, 200, { packages, configured: true });
  } catch (error) {
    if (error.message === "SERVICE_NOT_CONFIGURED") return json(res, 200, { packages: [], configured: false });
    console.error("public_packages_failed", error);
    return json(res, 500, { error: "Package catalogue unavailable" });
  }
}
