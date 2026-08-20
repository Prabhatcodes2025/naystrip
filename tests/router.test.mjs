import assert from "node:assert/strict";
import {Readable} from "node:stream";
import {readdirSync,readFileSync,statSync} from "node:fs";
import {join} from "node:path";
import test from "node:test";
import dispatch,{routeFromRequest,routes} from "../server/router.js";

const expected=["admin/agents","admin/bookings","admin/departures","admin/leads","admin/media","admin/notifications","admin/packages","admin/tours","admin/quotation-actions","admin/quotations","auth/admin","auth/portal","auth/recover","auth/register","auth/update-password","b2b/create-booking","b2b/dashboard","bookings/create","bookings/options","bookings/preview","bookings/verify","config","cron/reminders","departures","documents/booking","documents/itinerary","documents/quotation","leads","packages","payments/create-order","payments/verify","payments/webhook","portal/cancel","portal/dashboard","portal/profile","quotations/view","settings"];

function response(){return {statusCode:200,headers:{},body:null,status(code){this.statusCode=code;return this},setHeader(key,value){this.headers[key]=value;return this},json(value){this.body=value;return this},end(value){this.body=value;return this},send(value){this.body=value;return this}}}
function request({path,method="GET",body,headers={}}){const req=Readable.from(body===undefined?[]:[Buffer.from(body)]);req.method=method;req.url=`/api/${path}`;req.query={route:path.split("/")};req.headers=headers;return req}
function filesBelow(directory){return readdirSync(directory).flatMap(name=>{const path=join(directory,name);return statSync(path).isDirectory()?filesBelow(path):[path]})}

test("router preserves every legacy endpoint plus public environment config",()=>{
  assert.deepEqual([...routes.keys()].sort(),expected.sort());
  for(const handler of routes.values())assert.equal(typeof handler,"function");
  assert.equal(routes.get("admin/tours"),routes.get("admin/packages"));
});

test("all preserved endpoint groups dispatch to a real handler",async()=>{
  const checks={"admin/agents":"GET","admin/bookings":"GET","admin/departures":"GET","admin/leads":"GET","admin/media":"POST","admin/notifications":"GET","admin/packages":"GET","admin/quotation-actions":"POST","admin/quotations":"GET","auth/admin":"POST","auth/portal":"POST","auth/recover":"POST","auth/register":"POST","auth/update-password":"POST","b2b/create-booking":"POST","b2b/dashboard":"GET","bookings/create":"POST","bookings/options":"GET","bookings/preview":"POST","bookings/verify":"GET",config:"GET","cron/reminders":"GET",departures:"GET","documents/booking":"GET","documents/itinerary":"GET","documents/quotation":"GET",leads:"POST",packages:"GET","payments/create-order":"POST","payments/verify":"POST","payments/webhook":"POST","portal/cancel":"POST","portal/dashboard":"GET","portal/profile":"PATCH","quotations/view":"GET",settings:"POST"};
  const saved={SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_ANON_KEY:process.env.SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY:process.env.SUPABASE_SERVICE_ROLE_KEY,CASHFREE_CLIENT_SECRET:process.env.CASHFREE_CLIENT_SECRET};
  delete process.env.SUPABASE_URL;delete process.env.SUPABASE_ANON_KEY;delete process.env.SUPABASE_SERVICE_ROLE_KEY;delete process.env.CASHFREE_CLIENT_SECRET;
  try{for(const [path,method] of Object.entries(checks)){const res=response();await dispatch(request({path,method,body:["GET","HEAD"].includes(method)?undefined:"{}",headers:{"content-type":"application/json"}}),res);assert.notEqual(res.body?.error,"API route not found",`${method} /api/${path} did not dispatch`)}}finally{for(const [key,value] of Object.entries(saved)){if(value===undefined)delete process.env[key];else process.env[key]=value}}
});

test("every frontend API URL resolves through the consolidated router",()=>{
  const used=new Set();
  for(const file of filesBelow(join(process.cwd(),"src")).filter(file=>/\.(js|jsx)$/.test(file))){const source=readFileSync(file,"utf8");for(const match of source.matchAll(/\/api\/([a-z0-9-]+(?:\/[a-z0-9-]+)?)/gi))used.add(match[1])}
  assert.ok(used.size>20,"expected the frontend API surface to be discovered");
  assert.deepEqual([...used].filter(path=>!routes.has(path)),[]);
});

test("route resolution supports Vercel params and direct legacy URLs",()=>{
  assert.equal(routeFromRequest({query:{route:["admin","bookings"]},url:"/ignored"}),"admin/bookings");
  assert.equal(routeFromRequest({query:{route:"bookings/options"},url:"/ignored"}),"bookings/options");
  assert.equal(routeFromRequest({query:{},url:"/api/bookings/verify?reference=NTB-1"}),"bookings/verify");
});

test("Vercel routes API, existing files, then the SPA fallback",()=>{
  const configuration=JSON.parse(readFileSync(join(process.cwd(),"vercel.json"),"utf8"));
  assert.deepEqual(configuration.routes?.[0],{src:"/api/(.*)",dest:"/api/index?route=$1"});
  assert.deepEqual(configuration.routes?.[1],{handle:"filesystem"});
  assert.deepEqual(configuration.routes?.[2],{src:"/assets/(.*)",status:404});
  assert.equal(configuration.routes?.[3]?.status,404);
  assert.equal(configuration.routes?.[4]?.status,404);
  assert.equal(configuration.routes?.[5]?.dest,"/index.html");
  assert.equal(configuration.routes?.[5]?.headers?.["Cache-Control"],"public, max-age=0, must-revalidate");
});

test("router returns JSON 404 for unknown endpoints",async()=>{
  const res=response();await dispatch(request({path:"missing"}),res);assert.equal(res.statusCode,404);assert.equal(res.body.error,"API route not found");
});

test("router parses JSON for ordinary POST endpoints",async()=>{
  routes.set("test/echo",async(req,res)=>res.status(200).json(req.body));
  try{const res=response();await dispatch(request({path:"test/echo",method:"POST",body:'{"ok":true}',headers:{"content-type":"application/json"}}),res);assert.equal(res.statusCode,200);assert.deepEqual(res.body,{ok:true})}finally{routes.delete("test/echo")}
});

test("router preserves GET, POST, PATCH, PUT and DELETE methods",async()=>{
  routes.set("test/method",async(req,res)=>res.status(200).json({method:req.method}));
  try{for(const method of ["GET","POST","PATCH","PUT","DELETE"]){const res=response();await dispatch(request({path:"test/method",method,body:method==="GET"?undefined:"{}",headers:{"content-type":"application/json"}}),res);assert.equal(res.body.method,method)}}finally{routes.delete("test/method")}
});

test("router preserves untouched webhook bytes",async()=>{
  const original=routes.get("payments/webhook");
  routes.set("payments/webhook",async(req,res)=>{const chunks=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));return res.status(200).json({raw:Buffer.concat(chunks).toString("utf8"),body:req.body})});
  try{const payload=' {"signed":true}\n';const res=response();await dispatch(request({path:"payments/webhook",method:"POST",body:payload,headers:{"content-type":"application/json"}}),res);assert.equal(res.body.raw,payload);assert.equal(res.body.body,undefined)}finally{routes.set("payments/webhook",original)}
});
