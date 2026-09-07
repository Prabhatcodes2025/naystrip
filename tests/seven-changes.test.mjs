import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {isBookingDateAvailable} from "../server/payments/create-order.js";
import {calculateBookingState} from "../server/_booking-state.js";
import {buildBulkDepartureRows} from "../server/admin/departures.js";

const booking={package_id:"package-1",departure_id:"departure-1",travel_date:"2026-12-12",departure:{id:"departure-1",package_id:"package-1",start_date:"2026-12-12",status:"open",available_seats:4,booking_cutoff:"2026-12-10T00:00:00Z"}};
test("only Admin-configured matching dates pass payment availability",()=>{
 assert.equal(isBookingDateAvailable(booking,new Date("2026-12-01")),true);
 assert.equal(isBookingDateAvailable({...booking,travel_date:"2026-12-13"},new Date("2026-12-01")),false);
 assert.equal(isBookingDateAvailable({...booking,departure:{...booking.departure,status:"closed"}},new Date("2026-12-01")),false);
 assert.equal(isBookingDateAvailable({...booking,travel_date:"2026-11-30",departure:{...booking.departure,start_date:"2026-11-30"}},new Date("2026-12-01")),false);
 assert.equal(calculateBookingState({status:"published",booking_enabled:true,custom_enquiry_only:false,price_from:1000,policies:{booking_mode:"flexible_date"}},[]).online,false);
});

test("travel services use service-only admin and public presentation",()=>{
 const admin=readFileSync(new URL("../src/pages/admin/AdminTours.jsx",import.meta.url),"utf8"),service=readFileSync(new URL("../src/pages/ServiceDetails.jsx",import.meta.url),"utf8"),card=readFileSync(new URL("../src/components/tours/PackageCard.jsx",import.meta.url),"utf8");
 assert.match(admin,/serviceMode\?\[\["Requirements \/ documents required"/);
 assert.match(admin,/Add FAQ/);assert.match(admin,/faq\.question/);assert.match(admin,/faq\.answer/);
 assert.match(service,/Service details/);assert.match(service,/item\.title\|\|item\.body/);assert.match(service,/whitespace-pre-line/);assert.doesNotMatch(service,/Day 1|departure schedule|cancellationSlabs/);
 assert.match(card,/`\/services\/\$\{tour\.slug\}`/);
});

test("one availability schedule expands safely across selected packages",()=>{
 const packageIds=["11111111-1111-4111-8111-111111111111","22222222-2222-4222-8222-222222222222"];
 const rows=buildBulkDepartureRows({scheduleName:"October weekends",packageIds,capacity:12,price:"",bookingCutoff:"",dates:[{startDate:"2026-10-03",status:"open"},{startDate:"2026-10-10",status:"open"},{startDate:"2026-10-10",status:"closed"}]});
 assert.equal(rows.length,4);assert.deepEqual(new Set(rows.map(row=>row.package_id)),new Set(packageIds));assert.equal(rows.filter(row=>row.start_date==="2026-10-10").every(row=>row.status==="closed"),true);assert.equal(rows.every(row=>row.internal_notes==="Schedule: October weekends"),true);
});

test("booking options hide past, sold-out, blocked, and cutoff dates",()=>{
 const options=readFileSync(new URL("../server/bookings/options.js",import.meta.url),"utf8"),checkout=readFileSync(new URL("../src/pages/BookingCheckout.jsx",import.meta.url),"utf8"),selector=readFileSync(new URL("../src/components/booking/AvailableDateSelector.jsx",import.meta.url),"utf8");
 assert.match(options,/departure\.start_date>=today/);assert.match(options,/\["open", "filling_fast"\]/);assert.match(options,/available_seats\) > 0/);
 assert.match(checkout,/AvailableDateSelector/);assert.match(checkout,/No dates are currently available for this package/);assert.match(selector,/type="radio"/);assert.match(selector,/seats available/);
});

test("date rejection occurs before the Cashfree order call",()=>{
 const source=readFileSync(new URL("../server/payments/create-order.js",import.meta.url),"utf8");
 assert.ok(source.indexOf("isBookingDateAvailable(booking)")<source.indexOf("cashfreeRequest(\"/orders\""));
});

test("admin exports sanitize formulas and scoped feature routes exist",()=>{
 const csv=readFileSync(new URL("../src/utils/csv.js",import.meta.url),"utf8"),app=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8"),header=readFileSync(new URL("../src/components/layout/Header.jsx",import.meta.url),"utf8");
 assert.match(csv,/unsafeFormula/);assert.match(csv,/`'\$\{text\}`/);assert.match(app,/travel-services/);assert.match(header,/Become a B2B Partner/);
});
