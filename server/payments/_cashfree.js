const API_VERSION="2025-01-01";

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
