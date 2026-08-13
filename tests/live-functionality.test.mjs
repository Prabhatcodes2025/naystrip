import assert from "node:assert/strict";
import {Readable} from "node:stream";
import test from "node:test";
import {verifyCaptcha} from "../server/_captcha.js";
import {calculateBookingState} from "../server/_booking-state.js";
import {isAllowedOrigin} from "../server/_shared.js";
import bookingOptions from "../server/bookings/options.js";
import dispatch from "../server/router.js";

const originalFetch=globalThis.fetch;
const envKeys=["TURNSTILE_SECRET_KEY","VITE_TURNSTILE_SITE_KEY","SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","RESEND_API_KEY","RESEND_FROM","LEADS_NOTIFICATION_EMAIL","WHATSAPP_LEADS_TO","NODE_ENV","PUBLIC_SITE_URL"];
const originalEnv=Object.fromEntries(envKeys.map(key=>[key,process.env[key]]));
function restore(){globalThis.fetch=originalFetch;for(const [key,value] of Object.entries(originalEnv)){if(value===undefined)delete process.env[key];else process.env[key]=value}}
function response(){return {statusCode:200,headers:{},raw:"",status(code){this.statusCode=code;return this},setHeader(key,value){this.headers[key]=value;return this},end(value){this.raw=value||"";return this},json(value){this.raw=JSON.stringify(value);return this},send(value){this.raw=value;return this}}}
function jsonBody(res){return typeof res.raw==="string"?JSON.parse(res.raw):res.raw}
function jsonResponse(body,status=200){return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json"}})}
function configureSupabase(){process.env.SUPABASE_URL="https://example.supabase.co";process.env.SUPABASE_SERVICE_ROLE_KEY="test-service-role"}
function leadRequest(path="leads",payload={name:"Test Traveller",phone:"9876543210",email:""},kind="contact"){const body=JSON.stringify({kind,payload,clientReference:`CTC-20260813-${crypto.randomUUID().slice(0,8)}`,website:"naystrip.com",captchaToken:null});const req=Readable.from([Buffer.from(body)]);req.method="POST";req.url=`/api/${path}`;req.query={route:path};req.headers={"content-type":"application/json",origin:"https://www.naystrek.com","x-forwarded-for":crypto.randomUUID()};return req}

test.afterEach(restore);

test("Turnstile absent accepts validation path without pretending it was verified",async()=>{
  delete process.env.TURNSTILE_SECRET_KEY;delete process.env.VITE_TURNSTILE_SITE_KEY;
  const result=await verifyCaptcha(null,"127.0.0.1");
  assert.deepEqual(result,{success:true,skipped:true,reason:"not_configured"});
});

test("Turnstile configured rejects an invalid token",async()=>{
  process.env.TURNSTILE_SECRET_KEY="secret";process.env.VITE_TURNSTILE_SITE_KEY="site";
  globalThis.fetch=async()=>jsonResponse({success:false,"error-codes":["invalid-input-response"]});
  assert.equal((await verifyCaptcha("invalid","127.0.0.1")).success,false);
});

test("Turnstile configured accepts a provider-verified token",async()=>{
  process.env.TURNSTILE_SECRET_KEY="secret";process.env.VITE_TURNSTILE_SITE_KEY="site";
  globalThis.fetch=async()=>jsonResponse({success:true});
  assert.deepEqual(await verifyCaptcha("valid","127.0.0.1"),{success:true});
});

test("missing notification providers do not fail a saved enquiry",async()=>{
  configureSupabase();delete process.env.TURNSTILE_SECRET_KEY;delete process.env.VITE_TURNSTILE_SITE_KEY;delete process.env.RESEND_API_KEY;delete process.env.RESEND_FROM;delete process.env.LEADS_NOTIFICATION_EMAIL;delete process.env.WHATSAPP_LEADS_TO;
  const calls=[];globalThis.fetch=async(url,options={})=>{calls.push({url:String(url),method:options.method});if(String(url).includes("/inquiries"))return jsonResponse([{id:"CTC-20260813-SAVED001"}],201);if(String(url).includes("/notifications")&&options.method==="POST")return jsonResponse([{id:"11111111-1111-4111-8111-111111111111"}],201);if(String(url).includes("/notifications")&&options.method==="PATCH")return jsonResponse([],200);throw new Error(`Unexpected request ${url}`)};
  const res=response();await dispatch(leadRequest("leads",{name:"Test Traveller",phone:"9876543210",email:"test@example.com"}),res);
  assert.equal(res.statusCode,201);assert.equal(jsonBody(res).id,"CTC-20260813-SAVED001");assert.equal(calls.some(call=>call.url.includes("api.resend.com")),false);
});

test("seeded Maharashtra slug resolves and reports honest enquiry-only state",async()=>{
  configureSupabase();globalThis.fetch=async(url)=>{assert.match(String(url),/slug=eq\.pune-nashik-shirdi-aurangabad-4-days/);return jsonResponse([{id:"11111111-1111-4111-8111-111111111111",slug:"pune-nashik-shirdi-aurangabad-4-days",title:"Pune Nashik Shirdi Aurangabad",status:"published",price_from:null,booking_enabled:false,custom_enquiry_only:true,policies:{},package_departures:[],package_addons:[]}])};
  const res=response();await bookingOptions({method:"GET",query:{slug:"pune-nashik-shirdi-aurangabad-4-days"}},res);const body=jsonBody(res);
  assert.equal(res.statusCode,200);assert.equal(body.package.slug,"pune-nashik-shirdi-aurangabad-4-days");assert.equal(body.package.booking_state.code,"enquiry_only");assert.equal(body.package.booking_state.online,false);
});

test("booking CTA state requires real owner-controlled configuration",()=>{
  const base={status:"published",booking_enabled:true,custom_enquiry_only:false,price_from:12500,policies:{booking_mode:"flexible_date"}};
  assert.equal(calculateBookingState(base,[]).online,true);
  assert.equal(calculateBookingState({...base,price_from:null},[]).code,"price_required");
  assert.equal(calculateBookingState({...base,policies:{booking_mode:"fixed_departure"}},[]).code,"departure_required");
  assert.equal(calculateBookingState({...base,price_from:null,policies:{booking_mode:"fixed_departure"}},[{status:"open",available_seats:5,price_override:14000}]).online,true);
});

test("catch-all router dispatches contact, custom-trip and package-customisation enquiries",async()=>{
  configureSupabase();process.env.NODE_ENV="production";delete process.env.TURNSTILE_SECRET_KEY;delete process.env.VITE_TURNSTILE_SITE_KEY;
  globalThis.fetch=async(url)=>String(url).includes("/inquiries")?jsonResponse([{id:"CTC-20260813-ROUTED1"}],201):jsonResponse([]);
  for(const [kind,payload] of [["contact",{name:"Contact",phone:"9876543210"}],["custom_trip",{name:"Planner",phone:"9876543211"}],["contact",{name:"Package",phone:"9876543212",source:"Tour: Pune Nashik Shirdi Aurangabad"}]]){const res=response();await dispatch(leadRequest("leads",payload,kind),res);assert.equal(res.statusCode,201);assert.equal(jsonBody(res).id,"CTC-20260813-ROUTED1")}
});

test("production origin allowlist includes the live domain and configured canonical origin",()=>{
  process.env.PUBLIC_SITE_URL="https://preview.example.com/path";
  assert.equal(isAllowedOrigin("https://www.naystrek.com"),true);assert.equal(isAllowedOrigin("https://preview.example.com"),true);assert.equal(isAllowedOrigin("https://evil.example"),false);
});
