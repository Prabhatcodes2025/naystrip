import { json, supabaseRequest } from "../_shared.js";
import { calculateBookingState } from "../_booking-state.js";
export default async function handler(req, res) {
  if (req.method !== "GET")
    return json(res, 405, { error: "Method not allowed" });
  const slug = String(req.query?.slug || "")
    .replace(/[^a-z0-9-]/gi, "")
    .slice(0, 120);
  if (!slug) return json(res, 422, { error: "Package is required" });
  try {
    const response = await supabaseRequest(
      `packages?slug=eq.${encodeURIComponent(slug)}&status=eq.published&deleted_at=is.null&select=id,slug,title,status,destination_names,nights,days,overview,price_from,tax_percent,advance_percent,booking_enabled,custom_enquiry_only,policies,start_point,end_point,package_departures(id,start_date,end_date,capacity,booked_seats,available_seats,price_override,advance_amount,booking_cutoff,status,meeting_point),package_addons(id,name,description,unit_amount,pricing_unit)&limit=1`,
    );
    const rows = await response.json();
    if (!response.ok) {
      console.error(
        "booking_options_database_failed",
        response.status,
        JSON.stringify(rows).slice(0, 500),
      );
      return json(res, 502, {
        error: "Booking availability could not be loaded",
      });
    }
    const [pkg] = rows;
    if (!pkg) return json(res, 404, { error: "Package not found" });
    pkg.package_departures = (pkg.package_departures || []).filter(
      (departure) =>
        ["open", "filling_fast"].includes(departure.status) &&
        Number(departure.available_seats) > 0 &&
        (!departure.booking_cutoff ||
          new Date(departure.booking_cutoff) > new Date()),
    );
    pkg.booking_state = calculateBookingState(pkg, pkg.package_departures);
    return json(res, 200, { package: pkg });
  } catch (error) {
    if (error.message === "SERVICE_NOT_CONFIGURED")
      return json(res, 503, {
        error: "Live booking availability is not configured",
      });
    console.error("booking_options_failed", error);
    return json(res, 500, { error: "Could not load booking options" });
  }
}
