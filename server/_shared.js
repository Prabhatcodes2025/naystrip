const json=(res,status,body)=>{res.status(status).setHeader("Content-Type","application/json");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(body));};
const allowedOrigins=new Set(["https://www.naystrip.com","https://naystrip.com","https://naystrip.vercel.app"]);
export function isAllowedOrigin(origin){if(!origin)return true;try{const configured=process.env.PUBLIC_SITE_URL?new URL(process.env.PUBLIC_SITE_URL).origin:null;return allowedOrigins.has(origin)||origin===configured}catch{return false}}
export function guard(req,res){
 if(req.method!=="POST"){json(res,405,{error:"Method not allowed"});return false;}
 const origin=req.headers.origin;if(!isAllowedOrigin(origin)&&process.env.NODE_ENV==="production"){json(res,403,{error:"Origin not allowed"});return false;}
 const length=Number(req.headers["content-length"]||0);if(length>25000){json(res,413,{error:"Request too large"});return false;}return true;
}
export async function supabaseRequest(path,options={}){const url=process.env.SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error("SERVICE_NOT_CONFIGURED");return fetch(`${url}/rest/v1/${path}`,{...options,headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",...(options.headers||{})}})}
export {json};
