import crypto from "node:crypto";
import test from "node:test";
import assert from "node:assert/strict";
import register from "../server/auth/register.js";
import portal from "../server/auth/portal.js";
import adminContent from "../server/admin/content.js";

const userId="11111111-1111-4111-8111-111111111111";
const roleId="22222222-2222-4222-8222-222222222222";
const response=()=>({statusCode:200,status(code){this.statusCode=code;return this},setHeader(){return this},end(body){this.body=body}});
const invoke=async(handler,body,headers={})=>{const res=response();await handler({method:"POST",body,headers,query:{}},res);return {status:res.statusCode,data:JSON.parse(res.body)}};

test("B2B signup sends raw Auth REST metadata and persists a pending PAN profile",async(t)=>{
  const originalFetch=global.fetch;const original={...process.env};
  process.env.SUPABASE_URL="https://db.example";process.env.SUPABASE_ANON_KEY="anon";process.env.SUPABASE_SERVICE_ROLE_KEY="service";
  let signupBody;let profileBody;
  global.fetch=async(url,options={})=>{const value=String(url);if(value.includes("registration_challenges?"))return Response.json([{answer_hash:crypto.createHmac("sha256","service").update(userId+":9").digest("hex"),expires_at:new Date(Date.now()+60000).toISOString()}]);if(value.includes("/auth/v1/signup")){signupBody=JSON.parse(options.body);return Response.json({user:{id:userId,identities:[{id:"identity"}]},session:null})}if(value.includes("/rest/v1/b2b_agents?"))return Response.json([]);if(value.endsWith("/rest/v1/b2b_agents")){profileBody=JSON.parse(options.body);return new Response(null,{status:201})}throw new Error(`Unexpected URL ${value}`)};
  t.after(()=>{global.fetch=originalFetch;process.env=original});
  const result=await invoke(register,{mathChallengeId:userId,mathAnswer:"9",email:"agent@example.com",password:"strong-pass-1",name:"Agent Name",phone:"8097132424",businessName:"Travel Partner",pan:"abcde1234f",portal:"agent"},{origin:"http://localhost"});
  assert.equal(result.status,201);assert.equal(result.data.confirmation_required,true);
  assert.equal(signupBody.data.portal,"agent");assert.equal(signupBody.data.pan,"ABCDE1234F");
  assert.equal(profileBody.verification_status,"pending");assert.equal(profileBody.pan,"ABCDE1234F");
});

test("B2B login distinguishes pending and rejected approval",async(t)=>{
  const originalFetch=global.fetch;const original={...process.env};
  process.env.SUPABASE_URL="https://db.example";process.env.SUPABASE_ANON_KEY="anon";process.env.SUPABASE_SERVICE_ROLE_KEY="service";
  let status="pending";
  global.fetch=async(url)=>{const value=String(url);if(value.includes("/auth/v1/token"))return Response.json({access_token:"token",expires_in:3600,user:{id:userId}});if(value.includes("/rest/v1/b2b_agents?"))return Response.json([{user_id:userId,verification_status:status}]);throw new Error(`Unexpected URL ${value}`)};
  t.after(()=>{global.fetch=originalFetch;process.env=original});
  const pending=await invoke(portal,{email:"agent@example.com",password:"strong-pass-1",portal:"agent"},{origin:"http://localhost"});
  assert.equal(pending.status,403);assert.match(pending.data.error,/pending approval/i);
  status="rejected";
  const rejected=await invoke(portal,{email:"agent@example.com",password:"strong-pass-1",portal:"agent"},{origin:"http://localhost"});
  assert.equal(rejected.status,403);assert.match(rejected.data.error,/not approved/i);
});

test("blog create persists professional metadata in existing JSON fields",async(t)=>{
  const originalFetch=global.fetch;const original={...process.env};
  process.env.SUPABASE_URL="https://db.example";process.env.SUPABASE_ANON_KEY="anon";process.env.SUPABASE_SERVICE_ROLE_KEY="service";
  let saved;
  global.fetch=async(url,options={})=>{const value=String(url);if(value.includes("/auth/v1/user"))return Response.json({id:userId,email:"admin@example.com"});if(value.includes("/rest/v1/admin_users?"))return Response.json([{user_id:userId,display_name:"Admin",role_id:roleId}]);if(value.includes("/rest/v1/roles?"))return Response.json([{id:roleId,name:"Content Manager"}]);if(value.endsWith("/rest/v1/blogs")){saved=JSON.parse(options.body);return Response.json([{id:"33333333-3333-4333-8333-333333333333",created_at:new Date().toISOString(),...saved}])}throw new Error(`Unexpected URL ${value}`)};
  t.after(()=>{global.fetch=originalFetch;process.env=original});
  const result=await invoke(adminContent,{resource:"blogs",item:{title:"Professional post",subtitle:"Useful subtitle",description:"Short description",content:"Full article content",author:"NaysTrip Team",category:"Travel Guides",featured:true,published:true}},{authorization:"Bearer admin"});
  assert.equal(result.status,200);assert.equal(saved.body.subtitle,"Useful subtitle");assert.equal(saved.body.author,"NaysTrip Team");assert.equal(saved.seo.featured,true);assert.equal(result.data.item.published,true);
});
