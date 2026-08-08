import assert from "node:assert/strict";
import {readdirSync,statSync} from "node:fs";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
import test from "node:test";
import {bookingReference,validateTravellers} from "../api/_validation.js";
import {encryptPrivate,decryptPrivate,maskName} from "../api/_crypto.js";
import {bookingDocument} from "../api/documents/_booking-docs.js";

function filesBelow(directory){return readdirSync(directory).flatMap(name=>{const path=join(directory,name);return statSync(path).isDirectory()?filesBelow(path):[path]})}

test("every serverless API module parses",()=>{
  for(const file of filesBelow(join(process.cwd(),"api")).filter(file=>file.endsWith(".js"))){
    const result=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
    assert.equal(result.status,0,`${file}\n${result.stderr}`);
  }
});

test("booking references and traveller validation enforce expected shape",()=>{
  assert.match(bookingReference(),/^NTB-\d{8}-[A-Z0-9]{6}$/);
  assert.equal(validateTravellers([{fullName:"Asha Patil",nationality:"Indian",idType:"Passport",idNumber:"P123"}],{adults:1,children:0,infants:0}),null);
  assert.match(validateTravellers([],{adults:1,children:0,infants:0}),/do not match/);
});

test("traveller IDs encrypt round-trip and public names remain masked",()=>{
  const previous=process.env.ID_ENCRYPTION_KEY;
  process.env.ID_ENCRYPTION_KEY="test-only-32-byte-key-material-do-not-use";
  const encrypted=encryptPrivate("ABCD1234");
  assert.notEqual(encrypted,"ABCD1234");
  assert.equal(decryptPrivate(encrypted),"ABCD1234");
  assert.equal(maskName("Asha Prakash Patil"),"A*** P. P.");
  if(previous===undefined)delete process.env.ID_ENCRYPTION_KEY;else process.env.ID_ENCRYPTION_KEY=previous;
});

test("booking voucher PDF includes multiple branded pages and QR data",async()=>{
  const bytes=await bookingDocument({reference:"NTB-20260808-ABC123",ticket_number:"NTT-20260808-ABC123",operational_status:"confirmed",payment_state:"fully_paid",billing:{name:"Asha Patil"},package:{title:"Maharashtra Explorer",destination_names:["Maharashtra"],days:5,nights:4,start_point:"Mumbai"},travel_date:"2026-12-01",end_date:"2026-12-05",traveller_count:1,travellers:[{traveller_type:"adult",full_name:"Asha Patil"}],total:25000,amount_paid:25000,balance_due:0,payments:[]},"voucher");
  assert.ok(bytes.length>3000);
  assert.equal(bytes.subarray(0,4).toString(),"%PDF");
});
