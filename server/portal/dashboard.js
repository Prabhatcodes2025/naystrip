import { json, supabaseRequest } from "../_shared.js";
import { requirePortalUser } from "../_auth.js";
export default async function handler(req, res) {
  const session = await requirePortalUser(req, res, "customer");
  if (!session) return;
  if (req.method !== "GET")
    return json(res, 405, { error: "Method not allowed" });
  try {
    const response = await supabaseRequest(
      `bookings?customer_id=eq.${session.user.id}&select=id,reference,travel_date,end_date,traveller_count,total,amount_paid,balance_due,currency,payment_state,operational_status,status,created_at,package:packages(title,slug,destination_names,days,nights),travellers:booking_travellers(id,full_name,traveller_type,nationality),documents:booking_documents(id,document_type,version,generated_at),payments(id,amount,status,payment_method,captured_at,created_at),cancellations:cancellation_requests(id,status,reason,created_at)&order=travel_date.asc`,
    );
    const bookings = await response.json();
    if (!response.ok)
      return json(res, 502, { error: "Could not load your bookings" });
    return json(res, 200, {
      profile: {
        firstName: session.profile.first_name,
        lastName: session.profile.last_name,
        phone: session.profile.phone,
        whatsapp: session.profile.whatsapp,
        email: session.user.email,
      },
      bookings,
    });
  } catch {
    return json(res, 500, { error: "Customer dashboard is unavailable" });
  }
}
