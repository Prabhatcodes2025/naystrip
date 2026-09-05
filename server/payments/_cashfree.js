const API_VERSION="2025-01-01";

const safeText=value=>{
  let text=String(value||"")
    .replace(/(x-client-secret|authorization)\s*[:=]\s*[^\r\n,;}]+/gi,"$1=[redacted]")
    .replace(/\b(Bearer)\s+\S+/gi,"$1 [redacted]");
  for(const credential of [process.env.CASHFREE_CLIENT_ID,process.env.CASHFREE_CLIENT_SECRET])if(credential)text=text.replaceAll(credential,"[redacted]");
  return text.slice(0,500);
};

export function cashfreeConfiguration(){
  const environment=String(process.env.CASHFREE_ENV||"sandbox").toLowerCase();
  return {
    clientId:String(process.env.CASHFREE_CLIENT_ID||"").trim(),
    clientSecret:String(process.env.CASHFREE_CLIENT_SECRET||"").trim(),
    environment:environment==="production"?"production":"sandbox",
    apiVersion:API_VERSION,
    baseUrl:environment==="production"?"https://api.cashfree.com/pg":"https://sandbox.cashfree.com/pg",
  };
}

export async function cashfreeRequest(path,options={}){
  const configuration=cashfreeConfiguration();
  if(!configuration.clientId||!configuration.clientSecret)throw new Error("CASHFREE_NOT_CONFIGURED");
  return fetch(`${configuration.baseUrl}${path}`,{
    ...options,
    headers:{
      "Content-Type":"application/json",
      "x-api-version":configuration.apiVersion,
      "x-client-id":configuration.clientId,
      "x-client-secret":configuration.clientSecret,
      ...(options.headers||{}),
    },
  });
}

export async function readCashfreeResponse(response,fallback={}){
  const text=await response.text().catch(()=>"");
  if(!text.trim())return fallback;
  try{return JSON.parse(text)}catch{return {message:safeText(text)}}
}

export function safeCashfreeError(body){
  const source=body&&typeof body==="object"&&!Array.isArray(body)?body:{};
  return {
    code:safeText(source.code||source.type||"CASHFREE_REQUEST_FAILED"),
    message:safeText(source.message||source.error_description||source.error||"Cashfree returned an invalid or empty response"),
  };
}
