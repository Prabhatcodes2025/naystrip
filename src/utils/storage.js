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
export const getCustomLeads=()=>[]; export const getContactLeads=()=>[]; export const getAdminTours=()=>[]; export const getAdminBlogs=()=>[]; export const getAdminStories=()=>[];
export const updateCustomLeadStatus=()=>{};export const deleteCustomLead=()=>{};export const updateContactLeadStatus=()=>{};export const deleteContactLead=()=>{};export const saveAdminTour=()=>{throw new Error("Connect the admin data service")};export const deleteAdminTour=()=>{};export const saveAdminBlog=()=>{throw new Error("Connect the admin data service")};export const deleteAdminBlog=()=>{};export const saveAdminStory=()=>{throw new Error("Connect the admin data service")};export const deleteAdminStory=()=>{};
export const KEYS={};
