import { useEffect, useState } from "react";
import { Calendar, Clock, Users2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageBanner, EmptyState } from "../components/shared/Bits";
import Seo from "../components/shared/Seo";
export default function FixedDepartures() {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/departures")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(data.error || "Live departures are unavailable");
        return data;
      })
      .then((data) => setDepartures(data.departures || []))
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      <Seo
        title="Fixed Departures | NaysTrip & Treks"
        description="Live scheduled tours with current capacity and booking status."
      />
      <PageBanner
        eyebrow="Set Dates"
        title="Fixed Departures"
        subtitle="Real scheduled departures configured by the NaysTrip operations team."
        image="https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1600&q=80"
      />
      <section className="py-12">
        <div className="container-lg">
          {loading ? (
            <p>Loading live departures…</p>
          ) : error ? (
            <EmptyState
              title="Live departures could not be loaded"
              subtitle="Please retry shortly or ask NaysTrip for current departure dates."
            />
          ) : departures.length === 0 ? (
            <EmptyState
              title="No live departures currently listed"
              subtitle="Ask NaysTrip for upcoming dates or plan a custom journey."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {departures.map((item) => (
                <article key={item.id} className="card-surface p-6">
                  <span className="badge-pill">
                    {item.status.replaceAll("_", " ")}
                  </span>
                  <h2 className="mt-3 font-display text-xl">
                    {item.package?.title}
                  </h2>
                  <div className="mt-4 space-y-2 text-sm text-navy-500">
                    <p className="flex gap-2">
                      <Calendar size={15} />
                      {item.start_date} – {item.end_date}
                    </p>
                    <p className="flex gap-2">
                      <Clock size={15} />
                      {item.package?.days} days / {item.package?.nights} nights
                    </p>
                    <p className="flex gap-2">
                      <Users2 size={15} />
                      {item.available_seats} seats available
                    </p>
                  </div>
                  <p className="mt-5 font-bold">
                    {item.price_override != null
                      ? `INR ${Number(item.price_override).toLocaleString("en-IN")}`
                      : item.package?.price_from != null
                        ? `From INR ${Number(item.package.price_from).toLocaleString("en-IN")}`
                        : "Price on request"}
                  </p>
                  {item.status !== "sold_out" && (
                    <Link
                      to={`/checkout/${item.package?.slug}`}
                      className="btn-primary mt-5"
                    >
                      Book departure
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
