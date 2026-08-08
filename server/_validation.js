export const clean=(value,max=500)=>String(value??"").trim().replace(/[<>]/g,"").slice(0,max);
export const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern=/^[+\d][\d\s()-]{7,20}$/;
export const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const referencePattern=/^NT[A-Z]-\d{8}-[A-Z0-9]{6}$/;
export const money=(value)=>Math.max(0,Math.round(Number(value||0)*100)/100);
export const dateOnly=(value)=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||""))?String(value):null;
export function bookingReference(prefix="NTB"){return `${prefix}-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,6).toUpperCase()}`}
export function validateTravellers(travellers,counts){if(!Array.isArray(travellers)||travellers.length!==counts.adults+counts.children+counts.infants)return "Traveller details do not match the selected counts";for(const traveller of travellers){if(!clean(traveller.fullName,120)||!clean(traveller.nationality,60)||!clean(traveller.idType,30)||!clean(traveller.idNumber,120))return "Complete every traveller's name, nationality and ID details"}return null}
