import assert from "node:assert/strict";
import crypto from "node:crypto";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {Readable} from "node:stream";
import test from "node:test";
import {cashfreeConfiguration,cashfreeRequest,readCashfreeResponse,safeCashfreeError} from "../server/payments/_cashfree.js";
import webhook,{cashfreeWebhookSignature} from "../server/payments/webhook.js";

const originalFetch=globalThis.fetch;
const keys=["CASHFREE_CLIENT_ID","CASHFREE_CLIENT_SECRET","CASHFREE_ENV","SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"];
const originalEnv=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
test.afterEach(()=>{globalThis.fetch=originalFetch;for(const [key,value] of Object.entries(originalEnv)){if(value===undefined)delete process.env[key];else process.env[key]=value}});

test("Cashfree defaults to Sandbox and sends only server-side credentials",async()=>{
  process.env.CASHFREE_CLIENT_ID="sandbox-app-id";process.env.CASHFREE_CLIENT_SECRET="sandbox-secret";delete process.env.CASHFREE_ENV;
  let request;globalThis.fetch=async(url,options)=>{request={url:String(url),options};return new Response("[]",{status:200})};
  await cashfreeRequest("/orders/order-1/payments");
  assert.equal(cashfreeConfiguration().environment,"sandbox");
  assert.equal(request.url,"https://sandbox.cashfree.com/pg/orders/order-1/payments");
  assert.equal(request.options.headers["x-client-id"],"sandbox-app-id");
  assert.equal(request.options.headers["x-client-secret"],"sandbox-secret");
  assert.equal(request.options.headers["x-api-version"],"2025-01-01");
});

test("Cashfree production API requires an explicit environment switch",()=>{
  process.env.CASHFREE_ENV="production";
  assert.equal(cashfreeConfiguration().baseUrl,"https://api.cashfree.com/pg");
  process.env.CASHFREE_ENV="anything-else";
  assert.equal(cashfreeConfiguration().baseUrl,"https://sandbox.cashfree.com/pg");
});

test("Cashfree errors are parsed safely without exposing authentication data",async()=>{
  const empty=await readCashfreeResponse(new Response("",{status:401}),{});
  assert.deepEqual(empty,{});
  const invalid=await readCashfreeResponse(new Response("upstream unavailable",{status:502}),{});
  assert.deepEqual(safeCashfreeError(invalid),{code:"CASHFREE_REQUEST_FAILED",message:"upstream unavailable"});
  assert.deepEqual(safeCashfreeError({code:"authentication_failed",message:"invalid credentials"}),{code:"authentication_failed",message:"invalid credentials"});
  assert.doesNotMatch(safeCashfreeError({message:"Authorization: Bearer secret-token"}).message,/secret-token/);
});

test("Cashfree webhook signature uses timestamp plus exact raw bytes",()=>{
  const raw=Buffer.from('{"data":{"payment":{"payment_amount":170.00}}}\n');const timestamp="1746427759733";const secret="sandbox-secret";
  const expected=crypto.createHmac("sha256",secret).update(timestamp+raw.toString("utf8")).digest("base64");
  assert.equal(cashfreeWebhookSignature(timestamp,raw,secret),expected);
  assert.notEqual(cashfreeWebhookSignature(timestamp,Buffer.from(raw.toString().trim()),secret),expected);
});

test("client checkout uses Cashfree v3 without exposing credentials or stale Razorpay code",()=>{
  const source=readFileSync(join(process.cwd(),"src","utils","portal.js"),"utf8");
  assert.match(source,/https:\/\/sdk\.cashfree\.com\/js\/v3\/cashfree\.js/);
  assert.match(source,/paymentSessionId:order\.payment_session_id/);
  assert.doesNotMatch(source,/Razorpay|razorpay|CASHFREE_CLIENT_SECRET/);
});

test("payment handlers use Cashfree orders, status verification, and raw webhook signature headers",()=>{
  const create=readFileSync(join(process.cwd(),"server","payments","create-order.js"),"utf8");
  const verify=readFileSync(join(process.cwd(),"server","payments","verify.js"),"utf8");
  const webhook=readFileSync(join(process.cwd(),"server","payments","webhook.js"),"utf8");
  assert.match(create,/cashfreeRequest\("\/orders"/);assert.match(create,/payment_session_id/);assert.match(create,/notify_url/);
  assert.match(verify,/\/payments`/);assert.match(verify,/payment_status==="SUCCESS"/);assert.match(verify,/applySuccessfulPayment/);
  assert.match(webhook,/x-webhook-timestamp/);assert.match(webhook,/x-webhook-signature/);assert.match(webhook,/applySuccessfulPayment/);
});

const response=()=>({statusCode:200,body:null,status(code){this.statusCode=code;return this},setHeader(){return this},json(value){this.body=value;return this},end(value){this.body=value;return this}});
const bodyOf=res=>typeof res.body==="string"?JSON.parse(res.body):res.body;
const jsonResponse=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json"}});

test("signed Cashfree SUCCESS webhook credits the booking and is idempotent-safe",async()=>{
  process.env.CASHFREE_CLIENT_SECRET="sandbox-secret";process.env.CASHFREE_CLIENT_ID="sandbox-id";
  process.env.SUPABASE_URL="https://example.supabase.co";process.env.SUPABASE_SERVICE_ROLE_KEY="service";
  const payload={type:"PAYMENT_SUCCESS_WEBHOOK",data:{order:{order_id:"NTB-ORDER-1"},payment:{cf_payment_id:"123456",payment_status:"SUCCESS",payment_amount:500,payment_currency:"INR",payment_group:"upi",bank_reference:"BANK-1",payment_completion_time:"2026-08-13T10:00:00+05:30"}}};
  const raw=Buffer.from(JSON.stringify(payload));const timestamp="1746427759733";const signature=cashfreeWebhookSignature(timestamp,raw,"sandbox-secret");const mutations=[];
  globalThis.fetch=async(url,options={})=>{const value=String(url);const body=options.body?JSON.parse(options.body):null;if(options.method&&options.method!=="GET")mutations.push({url:value,method:options.method,body});
    if(value.includes("payment_webhook_events")&&options.method==="POST")return jsonResponse([{id:"event-1"}],201);
    if(value.includes("payments?gateway=eq.cashfree"))return jsonResponse([{id:"payment-1",booking_id:"booking-1",amount:500,currency:"INR",status:"created",booking:{id:"booking-1",reference:"NTB-1",total:1000,advance_required:500,amount_paid:0,balance_due:1000,status:"pending",billing:{},ticket_number:null,ticket_generated_at:null,package:{title:"Maharashtra"}}}]);
    if(value.includes("payments?id=eq.payment-1"))return jsonResponse([{id:"payment-1",status:"successful"}]);
    if(value.includes("payments?booking_id=eq.booking-1"))return jsonResponse([{amount:500}]);
    if(value.includes("bookings?id=eq.booking-1")&&value.includes("select="))return jsonResponse([]);
    return jsonResponse([]);
  };
  const req=Readable.from([raw]);req.method="POST";req.headers={"x-webhook-timestamp":timestamp,"x-webhook-signature":signature,"x-idempotency-key":"event-1"};
  const res=response();const originalError=console.error;console.error=()=>{};try{await webhook(req,res)}finally{console.error=originalError}assert.equal(res.statusCode,200);assert.equal(bodyOf(res).received,true);
  const bookingMutation=mutations.find(item=>item.url.includes("bookings?id=eq.booking-1")&&item.method==="PATCH");
  assert.equal(bookingMutation.body.amount_paid,500);assert.equal(bookingMutation.body.payment_state,"partially_paid");assert.equal(bookingMutation.body.operational_status,"confirmed");assert.equal(bookingMutation.body.status,"confirmed");
  assert.equal(mutations.filter(item=>item.url.includes("booking_activity")&&item.method==="POST").length,1);
});
