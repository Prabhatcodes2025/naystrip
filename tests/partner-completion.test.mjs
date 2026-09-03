import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {calculateSellingPrice,currentRate} from "../server/b2b/pricing.js";
import {activeDeal} from "../server/b2b/deals.js";
import {consumeMathChallenge} from "../server/auth/math-captcha.js";
import {reconcileWallet} from "../server/b2b/wallet.js";
import dashboard from "../server/b2b/dashboard.js";
import {safeAgent,updateProfile} from "../server/b2b/profile.js";
import quotationUpdate from "../server/b2b/quotation-update.js";
const id="11111111-1111-4111-8111-111111111111";
const response=()=>({statusCode:200,status(code){this.statusCode=code;return this},setHeader(){},end(value){this.body=JSON.parse(value)}});
function setup(t,fetch){const env={...process.env},original=global.fetch;Object.assign(process.env,{SUPABASE_URL:"https://db.example",SUPABASE_ANON_KEY:"anon",SUPABASE_SERVICE_ROLE_KEY:"test-service",CASHFREE_CLIENT_ID:"test",CASHFREE_CLIENT_SECRET:"test",CASHFREE_ENV:"sandbox"});global.fetch=fetch;t.after(()=>{global.fetch=original;process.env=env})}

test("markup preserves net cost and handles percent, fixed, precision and invalid totals",()=>{
 assert.deepEqual(calculateSellingPrice(1000,2,"percentage",10),{agentCost:2000,subtotal:2200,total:2200});
 assert.deepEqual(calculateSellingPrice(1000,2,"fixed",150),{agentCost:2000,subtotal:2150,total:2150});
 assert.equal(calculateSellingPrice(99.99,3,"percentage",10).total,329.97);
 for(const args of [[100,2,"fixed",-1],[100,2,"percentage",101],[Infinity,1,"fixed",0],[100,1.5,"fixed",0],[100,2,"fixed",NaN],[100,2,"fixed",0,201]])assert.throws(()=>calculateSellingPrice(...args));
});
test("rate selection skips expired and future rates; deals enforce audience and dates",()=>{
 assert.equal(currentRate([{id:1,valid_until:"2026-08-31"},{id:2,valid_from:"2026-09-01"}],"2026-09-03").id,2);
 const deal={active:true,audience:"b2b",value:10,starts_at:"2026-09-01",ends_at:"2026-09-30"};
 assert.equal(activeDeal(deal,Date.parse("2026-09-03")),true);
 for(const change of [{active:false},{audience:"customer"},{ends_at:"2026-08-31"},{starts_at:"2026-10-01"},{value:-1}])assert.equal(activeDeal({...deal,...change},Date.parse("2026-09-03")),false);
});
test("math challenge consumes wrong and correct attempts, rejecting replay and expiry",async t=>{
 let challenge;setup(t,async(url,options)=>{assert.equal(options.method,"DELETE");assert.match(String(url),/registration_challenges\?id=eq\./);const row=challenge;challenge=null;return Response.json(row?[row]:[])});
 const make=(expires=Date.now()+60000)=>({answer_hash:crypto.createHmac("sha256","test-service").update(id+":9").digest("hex"),expires_at:new Date(expires).toISOString()});
 challenge=make();assert.equal(await consumeMathChallenge(id,"8"),false);assert.equal(await consumeMathChallenge(id,"9"),false);
 challenge=make();assert.equal(await consumeMathChallenge(id,"9"),true);assert.equal(await consumeMathChallenge(id,"9"),false);
 challenge=make(Date.now()-1);assert.equal(await consumeMathChallenge(id,"9"),false);
});
test("agent cannot follow up another agent enquiry",async t=>{
 let writes=0;setup(t,async(url,options={})=>{if(options.method&&options.method!=="GET")writes++;if(String(url).includes("/auth/v1/user"))return Response.json({id});if(String(url).includes("b2b_agents?"))return Response.json([{id,user_id:id,verification_status:"approved"}]);assert.match(String(url),new RegExp("agent_id=eq\\."+id));return Response.json([])});
 const res=response();await dashboard({method:"POST",headers:{authorization:"Bearer test"},body:{action:"follow_up",id:"OTHER-ENQUIRY",note:"test"}},res);assert.equal(res.statusCode,404);assert.equal(writes,0);
});
test("profile update never persists self-approval and masks encrypted bank data",async t=>{
 let saved;setup(t,async(url,options)=>{saved=JSON.parse(options.body);return new Response(null,{status:204})});const res=response();
 await updateProfile({profile:{id,bank_details:{accountLast4:"1234",encrypted:"secret"}}},{business_name:"Test",contact_person:"Test",phone:"9999999999",verification_status:"approved",user_id:"other"},res);
 assert.equal(res.statusCode,200);assert.equal(saved.verification_status,undefined);assert.equal(saved.user_id,undefined);assert.equal(safeAgent({bank_details:saved.bank_details}).bank_details.encrypted,undefined);
});
test("wallet verifies server order amount and currency and posts an idempotent credit",async t=>{
 const orderId="NTW-"+id;let paid=false,posts=0,wrongAmount=true;
 setup(t,async(url,options={})=>{const u=String(url);if(u.includes("agent_wallet_orders?")){assert.match(u,new RegExp("agent_id=eq\\."+id));return Response.json([{amount:500,status:paid?"paid":"created"}])}if(u.endsWith("/payments"))return Response.json([{payment_status:"SUCCESS",payment_currency:"INR",payment_amount:500,cf_payment_id:"42"}]);if(u.includes("/pg/orders/"))return Response.json({order_id:orderId,order_status:"PAID",order_currency:"INR",order_amount:wrongAmount?1:500});if(u.includes("rpc/post_agent_wallet_credit")){const b=JSON.parse(options.body);assert.equal(b.p_amount,500);paid=true;posts++;return new Response(null,{status:204})}throw new Error(u)});
 await assert.rejects(reconcileWallet(orderId,id),/verification failed/);assert.equal(posts,0);wrongAmount=false;
 assert.equal((await reconcileWallet(orderId,id)).status,"paid");assert.equal((await reconcileWallet(orderId,id)).status,"paid");assert.equal(posts,1);
});
test("quotation revision is recorded and confirmation cannot create a booking",async t=>{
 let patch;setup(t,async(url,options)=>{assert.match(String(url),/quotations\?/);patch=JSON.parse(options.body);return Response.json([{id,...patch}])});
 const res=response();await quotationUpdate({id,status:"sent",notes:"Existing"},{operation:"request_revision",notes:"Change travel dates"},res);assert.equal(res.statusCode,200);assert.match(patch.notes,/Existing.*Revision requested.*Change travel dates/s);
 const expired=response();await quotationUpdate({id,status:"sent",valid_until:"2020-01-01"},{operation:"confirm"},expired);assert.equal(expired.statusCode,409);
});
