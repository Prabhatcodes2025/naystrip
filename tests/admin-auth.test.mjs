import assert from "node:assert/strict";
import test from "node:test";
import adminLogin from "../server/auth/admin.js";
import adminLeads from "../server/admin/leads.js";
import adminBookings from "../server/admin/bookings.js";
import adminPackages from "../server/admin/packages.js";
import adminQuotations from "../server/admin/quotations.js";
import adminDepartures from "../server/admin/departures.js";
import adminNotifications from "../server/admin/notifications.js";
import {activeAdminForUser,hasFinancialPermission} from "../server/_admin.js";

const originalFetch=globalThis.fetch;
const originalEnv={SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_ANON_KEY:process.env.SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY:process.env.SUPABASE_SERVICE_ROLE_KEY};
const jsonResponse=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json"}});
const response=()=>({statusCode:200,body:null,status(code){this.statusCode=code;return this},setHeader(){return this},json(value){this.body=value;return this},end(value){this.body=value;return this}});
const bodyOf=(res)=>typeof res.body==="string"?JSON.parse(res.body):res.body;
function configure(){process.env.SUPABASE_URL="https://example.supabase.co";process.env.SUPABASE_ANON_KEY="anon";process.env.SUPABASE_SERVICE_ROLE_KEY="service"}
test.afterEach(()=>{globalThis.fetch=originalFetch;for(const [key,value] of Object.entries(originalEnv)){if(value===undefined)delete process.env[key];else process.env[key]=value}});

test("active Super Admin lookup uses stable separate profile and role queries",async()=>{
  configure();const calls=[];globalThis.fetch=async(url)=>{calls.push(String(url));if(String(url).includes("/admin_users?"))return jsonResponse([{user_id:"user-1",display_name:"Owner",role_id:"role-1"}]);if(String(url).includes("/roles?"))return jsonResponse([{id:"role-1",name:"Super Admin"}]);throw new Error(`Unexpected ${url}`)};
  const result=await activeAdminForUser({id:"user-1",email:"owner@example.com"});
  assert.equal(result.admin.role.name,"Super Admin");assert.equal(hasFinancialPermission(result.admin),true);assert.equal(calls.length,2);
});

test("admin login returns a session only after active admin authorization",async()=>{
  configure();globalThis.fetch=async(url)=>{if(String(url).includes("/auth/v1/token"))return jsonResponse({access_token:"valid-token",expires_in:3600,user:{id:"user-1",email:"owner@example.com"}});if(String(url).includes("/admin_users?"))return jsonResponse([{user_id:"user-1",display_name:"Owner",role_id:"role-1"}]);if(String(url).includes("/roles?"))return jsonResponse([{id:"role-1",name:"Super Admin"}]);throw new Error(`Unexpected ${url}`)};
  const res=response();await adminLogin({method:"POST",headers:{origin:"http://localhost:5173"},body:{email:"owner@example.com",password:"valid-password"}},res);
  const body=bodyOf(res);assert.equal(res.statusCode,200);assert.equal(body.access_token,"valid-token");assert.equal(body.admin.role,"Super Admin");
});

test("Super Admin token can read empty lead tables without a 403",async()=>{
  configure();globalThis.fetch=async(url)=>{if(String(url).includes("/auth/v1/user"))return jsonResponse({id:"user-1",email:"owner@example.com"});if(String(url).includes("/admin_users?"))return jsonResponse([{user_id:"user-1",display_name:"Owner",role_id:"role-1"}]);if(String(url).includes("/roles?"))return jsonResponse([{id:"role-1",name:"Super Admin"}]);if(String(url).includes("/inquiries?"))return jsonResponse([]);throw new Error(`Unexpected ${url}`)};
  for(const kind of ["custom_trip","contact"]){const res=response();await adminLeads({method:"GET",headers:{authorization:"Bearer valid-token"},query:{kind}},res);assert.equal(res.statusCode,200);assert.deepEqual(bodyOf(res).leads,[])}
});

test("Super Admin can open every requested empty admin collection",async()=>{
  configure();globalThis.fetch=async(url)=>{if(String(url).includes("/auth/v1/user"))return jsonResponse({id:"user-1",email:"owner@example.com"});if(String(url).includes("/admin_users?"))return jsonResponse([{user_id:"user-1",display_name:"Owner",role_id:"role-1"}]);if(String(url).includes("/roles?"))return jsonResponse([{id:"role-1",name:"Super Admin"}]);return jsonResponse([])};
  const checks=[[adminBookings,"bookings"],[adminPackages,"packages"],[adminPackages,"packages"],[adminQuotations,"quotations"],[adminDepartures,"departures"],[adminNotifications,"notifications"]];
  for(const [handler,key] of checks){const res=response();await handler({method:"GET",headers:{authorization:"Bearer valid-token"},query:{}},res);assert.equal(res.statusCode,200);assert.deepEqual(bodyOf(res)[key],[])}
});

test("database lookup failures are not misreported as missing admin permission",async()=>{
  configure();globalThis.fetch=async(url)=>String(url).includes("/admin_users?")?jsonResponse({message:"schema unavailable"},500):jsonResponse([]);
  const result=await activeAdminForUser({id:"user-1",email:"owner@example.com"});assert.equal(result.status,503);assert.match(result.error,/unavailable/);
});
