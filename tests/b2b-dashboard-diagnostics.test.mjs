import test from "node:test";
import assert from "node:assert/strict";
import dashboard from "../server/b2b/dashboard.js";

const agentId="11111111-1111-4111-8111-111111111111";
const queries={packages:"packages",package_agent_rates:"package_agent_rates",bookings:"bookings + packages + booking_documents",inquiries:"inquiries + lead_activities + packages",quotations:"quotations + inquiries + quotation_lines"};
function setup(t){
 const originalFetch=global.fetch,originalError=console.error,env={...process.env};
 Object.assign(process.env,{SUPABASE_URL:"https://db.example",SUPABASE_ANON_KEY:"private-anon",SUPABASE_SERVICE_ROLE_KEY:"private-service-key"});
 const state={failed:null,body:null,status:400,logs:[]};
 console.error=(event,fields)=>state.logs.push({event,...fields});
 global.fetch=async url=>{
  const parsed=new URL(url),table=parsed.pathname.split("/").pop();
  if(parsed.pathname==="/auth/v1/user")return Response.json({id:agentId});
  if(table==="b2b_agents")return Response.json([{id:agentId,user_id:agentId,verification_status:"approved",email:"private@example.invalid"}]);
  if(["inquiries","quotations","bookings"].includes(table))assert.equal(parsed.searchParams.get("agent_id"),"eq."+agentId);
  if(table==="bookings"){
   assert.match(parsed.searchParams.get("select"),/documents:booking_documents\(id,document_type,created_at:generated_at\)/);
   assert.equal(parsed.searchParams.get("order"),"created_at.desc"); // Orders bookings, not documents.
  }
  if(table===state.failed)return Response.json(state.body,{status:state.status,statusText:"Bad Request"});
  return Response.json([]);
 };
 t.after(()=>{global.fetch=originalFetch;console.error=originalError;process.env=env});
 return state;
}
async function invoke(){
 const res={statusCode:200,status(code){this.statusCode=code;return this},setHeader(){return this},end(body){this.body=JSON.parse(body)}};
 await dashboard({method:"GET",headers:{authorization:"Bearer private-session"}},res);return res;
}
test("dashboard labels each failed Supabase query with schema diagnostics",async t=>{
 const state=setup(t);
 for(const [table,query] of Object.entries(queries)){
  state.failed=table;state.logs=[];state.body={code:"42703",message:`column ${table}.missing_column does not exist`,details:null};
  const res=await invoke();assert.equal(res.statusCode,502);assert.deepEqual(res.body,{error:"Partner records could not be loaded"});
  assert.deepEqual(state.logs,[{event:"b2b_dashboard_query_failed",query,status:400,statusText:"Bad Request",...state.body}]);
 }
});
test("dashboard diagnostics withhold row data and credentials in non-schema errors",async t=>{
 const state=setup(t);state.failed="inquiries";state.body={code:"22P02",message:"private@example.invalid private-session",details:"private-service-key bank data",headers:{authorization:"private-session"}};
 const res=await invoke();assert.equal(res.statusCode,502);const logged=JSON.stringify(state.logs);
 assert.doesNotMatch(logged,/private|bank data/);assert.equal(state.logs[0].code,"22P02");assert.equal(state.logs[0].details,null);
});
test("dashboard rejects unexpected successful object responses without logging their data",async t=>{
 const state=setup(t);state.failed="bookings";state.status=200;state.body={email:"private@example.invalid"};
 assert.equal((await invoke()).statusCode,502);assert.equal(state.logs[0].message,"Expected an array response");assert.doesNotMatch(JSON.stringify(state.logs),/private/);
});
test("dashboard preserves successful empty collections and optional settings fallback",async t=>{
 const state=setup(t);const result=await invoke();assert.equal(result.statusCode,200);assert.deepEqual(result.body.enquiries,[]);assert.deepEqual(result.body.bookings,[]);assert.deepEqual(state.logs,[]);
 state.failed="website_settings";state.body={code:"42P01",message:"relation website_settings does not exist",details:null};
 assert.equal((await invoke()).statusCode,200);assert.equal(state.logs[0].query,"website_settings");
});
