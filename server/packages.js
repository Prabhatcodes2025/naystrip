import { json, supabaseRequest } from "./_shared.js";
import { calculateBookingState } from "./_booking-state.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  try {
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
