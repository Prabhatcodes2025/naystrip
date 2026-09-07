import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {isBookingDateAvailable} from "../server/payments/create-order.js";
import {calculateBookingState} from "../server/_booking-state.js";

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
 assert.match(service,/Service details/);assert.doesNotMatch(service,/Day 1|departure schedule|cancellationSlabs/);
 assert.match(card,/`\/services\/\$\{tour\.slug\}`/);
});

test("booking options hide past, sold-out, blocked, and cutoff dates",()=>{
 const options=readFileSync(new URL("../server/bookings/options.js",import.meta.url),"utf8"),checkout=readFileSync(new URL("../src/pages/BookingCheckout.jsx",import.meta.url),"utf8");
 assert.match(options,/departure\.start_date>=today/);assert.match(options,/\["open", "filling_fast"\]/);assert.match(options,/available_seats\) > 0/);
 assert.match(checkout,/Available booking date/);assert.match(checkout,/No dates are currently available for this package/);
});

test("date rejection occurs before the Cashfree order call",()=>{
 const source=readFileSync(new URL("../server/payments/create-order.js",import.meta.url),"utf8");
 assert.ok(source.indexOf("isBookingDateAvailable(booking)")<source.indexOf("cashfreeRequest(\"/orders\""));
});

test("admin exports sanitize formulas and scoped feature routes exist",()=>{
 const csv=readFileSync(new URL("../src/utils/csv.js",import.meta.url),"utf8"),app=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8"),header=readFileSync(new URL("../src/components/layout/Header.jsx",import.meta.url),"utf8");
 assert.match(csv,/unsafeFormula/);assert.match(csv,/`'\$\{text\}`/);assert.match(app,/travel-services/);assert.match(header,/Become a B2B Partner/);
});
