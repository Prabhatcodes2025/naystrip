import assert from "node:assert/strict";
import test from "node:test";
import bookingHandler from "../server/documents/booking.js";
import {generateAndStoreBookingDocuments} from "../server/_document-service.js";

const response=()=>({statusCode:200,headers:{},body:null,status(code){this.statusCode=code;return this},setHeader(key,value){this.headers[key]=value;return this},end(value){this.body=JSON.parse(value);return this},send(value){this.body=value;return this}});

test("booking document route handles a PostgREST error object without iterable destructuring",async()=>{
 const previous={url:process.env.SUPABASE_URL,anon:process.env.SUPABASE_ANON_KEY,key:process.env.SUPABASE_SERVICE_ROLE_KEY,fetch:global.fetch,error:console.error};
 process.env.SUPABASE_URL="https://example.supabase.co";process.env.SUPABASE_ANON_KEY="anon";process.env.SUPABASE_SERVICE_ROLE_KEY="service";
 let bookingUrl="";global.fetch=async(url)=>{if(String(url).includes("/auth/v1/user"))return new Response(JSON.stringify({id:"user-1"}),{status:200});bookingUrl=String(url);return new Response(JSON.stringify({code:"PGRST200",message:"relationship unavailable"}),{status:400})};console.error=()=>{};
 try{const res=response();await bookingHandler({method:"GET",headers:{authorization:"Bearer token"},query:{reference:"NTB-20260830-ABC123",type:"invoice"}},res);assert.equal(res.statusCode,502);assert.deepEqual(res.body,{error:"Booking document data could not be loaded"});assert.match(bookingUrl,/package%3Apackages|package:packages/);assert.match(decodeURIComponent(bookingUrl),/itinerary:package_itinerary_days/)}finally{global.fetch=previous.fetch;console.error=previous.error;if(previous.url===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=previous.url;if(previous.anon===undefined)delete process.env.SUPABASE_ANON_KEY;else process.env.SUPABASE_ANON_KEY=previous.anon;if(previous.key===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=previous.key}
});

test("automatic document storage reports the same PostgREST object safely",async()=>{
 const previous={url:process.env.SUPABASE_URL,key:process.env.SUPABASE_SERVICE_ROLE_KEY,fetch:global.fetch,error:console.error};process.env.SUPABASE_URL="https://example.supabase.co";process.env.SUPABASE_SERVICE_ROLE_KEY="service";global.fetch=async()=>new Response(JSON.stringify({code:"PGRST200",message:"relationship unavailable"}),{status:400});console.error=()=>{};
 try{await assert.rejects(()=>generateAndStoreBookingDocuments("booking-1"),/Booking document data could not be loaded/)}finally{global.fetch=previous.fetch;console.error=previous.error;if(previous.url===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=previous.url;if(previous.key===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=previous.key}
});
