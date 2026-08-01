import test from "node:test";
import assert from "node:assert/strict";
import { cancellationSlabs, tours } from "../src/data/tours.js";
test("all supplied Maharashtra packages have stable structured itineraries",()=>{assert.equal(tours.length,16);assert.equal(new Set(tours.map(t=>t.slug)).size,tours.length);for(const tour of tours){assert.equal(tour.itinerary.length,tour.days,`${tour.slug} day count`);assert.deepEqual(tour.itinerary.map(x=>x.day),Array.from({length:tour.days},(_,i)=>i+1));assert.equal(tour.price,null);assert.ok(tour.inclusions.length>=5);assert.ok(tour.exclusions.length>=6);}});
test("cancellation schedule matches supplied company policy",()=>{assert.deepEqual(cancellationSlabs.map(x=>[x.from,x.to,x.fee]),[[91,120,10],[61,90,15],[46,60,25],[31,45,40],[16,30,50],[6,15,75],[0,5,100]]);});
