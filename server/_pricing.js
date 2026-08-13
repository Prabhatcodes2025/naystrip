import { supabaseRequest } from "./_shared.js";
import { money, uuidPattern } from "./_validation.js";
import { bookingMode } from "./_booking-state.js";
export async function calculateBooking({
  packageId,
  departureId,
  counts,
  roomCount,
  addonSelections = [],
}) {
  if (!uuidPattern.test(packageId || "")) throw new Error("INVALID_PACKAGE");
  const packageResponse = await supabaseRequest(
    `packages?id=eq.${encodeURIComponent(packageId)}&status=eq.published&deleted_at=is.null&booking_enabled=eq.true&custom_enquiry_only=eq.false&select=id,slug,title,destination_names,nights,days,price_from,tax_percent,advance_percent,policies,currency:source&limit=1`,
  );
  const [pkg] = await packageResponse.json();
  if (!packageResponse.ok || !pkg) throw new Error("PACKAGE_NOT_BOOKABLE");
  let departure = null;
  if (departureId) {
    const response = await supabaseRequest(
      `package_departures?id=eq.${encodeURIComponent(departureId)}&package_id=eq.${encodeURIComponent(packageId)}&status=in.(open,filling_fast)&select=*&limit=1`,
    );
    [departure] = await response.json();
    if (
      !response.ok ||
      !departure ||
      departure.available_seats < counts.adults + counts.children
    )
      throw new Error("DEPARTURE_UNAVAILABLE");
  }
  if (bookingMode(pkg) === "fixed_departure" && !departure)
    throw new Error("DEPARTURE_UNAVAILABLE");
  if (departure?.price_override == null && pkg.price_from == null)
    throw new Error("PACKAGE_NOT_BOOKABLE");
  const travellers = counts.adults + counts.children;
  const baseUnit = money(departure?.price_override ?? pkg.price_from);
  const base = money(baseUnit * travellers);
  let addons = [];
  if (addonSelections.length) {
    const ids = addonSelections
      .map((item) => item.id)
      .filter((id) => uuidPattern.test(id))
      .slice(0, 30);
    if (ids.length) {
      const response = await supabaseRequest(
        `package_addons?id=in.(${ids.join(",")})&package_id=eq.${encodeURIComponent(packageId)}&active=eq.true&select=*`,
      );
      const rows = await response.json();
      addons = rows.map((addon) => {
        const selected = addonSelections.find((item) => item.id === addon.id);
        const factor =
          addon.pricing_unit === "traveller"
            ? travellers
            : addon.pricing_unit === "night"
              ? pkg.nights
              : addon.pricing_unit === "room"
                ? roomCount
                : Number(selected?.quantity || 1);
        const quantity = Math.max(1, Number(selected?.quantity || factor));
        return {
          addon_id: addon.id,
          addon_name: addon.name,
          quantity,
          unit_amount: money(addon.unit_amount),
          total_amount: money(quantity * addon.unit_amount),
        };
      });
    }
  }
  const addonsTotal = money(
    addons.reduce((sum, item) => sum + item.total_amount, 0),
  );
  const subtotal = money(base + addonsTotal);
  const tax = money((subtotal * Number(pkg.tax_percent || 0)) / 100);
  const total = money(subtotal + tax);
  const advance =
    departure?.advance_amount != null
      ? Math.min(total, money(departure.advance_amount))
      : money((total * Number(pkg.advance_percent || 100)) / 100);
  return {
    pkg,
    departure,
    addons,
    base,
    subtotal,
    tax,
    total,
    advance_required: advance,
    balance_due: total,
  };
}
