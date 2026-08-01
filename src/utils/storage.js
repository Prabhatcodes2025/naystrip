const API_TIMEOUT=12000;
function inquiryId(prefix){return `${prefix}-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;}
async function postLead(kind,payload){
 const localId=inquiryId(kind==="custom_trip"?"TRIP":"CTC");
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),API_TIMEOUT);
 try{
  const response=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,payload,clientReference:localId,website:"naystrip.com"}),signal:controller.signal});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||"Enquiry service is temporarily unavailable. Please call or WhatsApp us.");
  return {id:data.id||localId};
 }finally{clearTimeout(timer)}
}
export const saveCustomLead=(lead)=>postLead("custom_trip",lead);
export const saveContactLead=(lead)=>postLead("contact",lead);

const AUTH_KEY="naystrip_admin_session";
export function isAdminLoggedIn(){try{return Boolean(sessionStorage.getItem(AUTH_KEY));}catch{return false}}
export async function adminLogin(email,password){const response=await fetch("/api/auth/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});const data=await response.json().catch(()=>({}));if(!response.ok)return false;sessionStorage.setItem(AUTH_KEY,data.access_token);return true;}
export function adminLogout(){sessionStorage.removeItem(AUTH_KEY)}
async function adminRequest(path,options={}){const token=sessionStorage.getItem(AUTH_KEY);const response=await fetch(path,{...options,headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",...(options.headers||{})}});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||"Admin request failed");return data}
export const getCustomLeads=async()=>{const data=await adminRequest("/api/admin/leads?kind=custom_trip");return data.leads};
export const getContactLeads=async()=>{const data=await adminRequest("/api/admin/leads?kind=contact");return data.leads};
export const updateCustomLeadStatus=(id,status,note="",followUpAt=null)=>adminRequest("/api/admin/leads",{method:"PATCH",body:JSON.stringify({id,status,note,followUpAt})});
export const deleteCustomLead=(id)=>updateCustomLeadStatus(id,"closed","Archived from lead queue");
export const updateContactLeadStatus=updateCustomLeadStatus;export const deleteContactLead=deleteCustomLead;
export const getAdminTours=()=>[]; export const getAdminBlogs=()=>[]; export const getAdminStories=()=>[];
export const saveAdminTour=()=>{throw new Error("Connect the admin data service")};export const deleteAdminTour=()=>{};export const saveAdminBlog=()=>{throw new Error("Connect the admin data service")};export const deleteAdminBlog=()=>{};export const saveAdminStory=()=>{throw new Error("Connect the admin data service")};export const deleteAdminStory=()=>{};
export const KEYS={};
