import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { validMedia } from "../server/admin/media.js";
import { imageCandidates, imageFallbackFor } from "../src/data/imageFallbacks.js";

test("media validation accepts real supported signatures and rejects spoofed files",()=>{
  assert.equal(validMedia("image/jpeg",Buffer.from([0xff,0xd8,0xff,0x00])),true);
  assert.equal(validMedia("image/png",Buffer.from([137,80,78,71,13,10,26,10])),true);
  assert.equal(validMedia("image/webp",Buffer.from("RIFF0000WEBP")),true);
  assert.equal(validMedia("image/jpeg",Buffer.from("not an image")),false);
  assert.equal(validMedia("image/svg+xml",Buffer.from("<svg/>")),false);
});

test("image fallbacks are destination-aware and deduplicated",()=>{
  assert.match(imageFallbackFor("Mumbai city"),/unsplash/);
  assert.match(imageFallbackFor("Kashmir trek"),/unsplash/);
  const candidates=imageCandidates("https://example.com/a.jpg","Mumbai","https://example.com/a.jpg");
  assert.equal(new Set(candidates).size,candidates.length);
  assert.ok(candidates.length>=2);
});

test("public media remains isolated from private booking documents",()=>{
  const migration=readFileSync(join(process.cwd(),"supabase/migrations/004_public_media.sql"),"utf8");
  const handler=readFileSync(join(process.cwd(),"server/admin/media.js"),"utf8");
  assert.match(migration,/site-media[^]*public[^]*true/i);
  assert.doesNotMatch(migration,/booking-documents[^]*public[^]*true/i);
  assert.match(handler,/requireAdmin/);
  assert.match(handler,/SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(handler,/VITE_.*SERVICE_ROLE/);
});
