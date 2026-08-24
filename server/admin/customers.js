import {requireAdmin} from "../_admin.js";
import {json,supabaseRequest} from "../_shared.js";

export default async function handler(req,res){
  const admin=await requireAdmin(req,res);if(!admin)return;
  if(req.method!=="GET")return json(res,405,{error:"Method not allowed"});
  try{
    const id=String(req.query?.id||"").replace(/[^a-f0-9-]/gi,"").slice(0,40);
    const customerResponse=await supabaseRequest(`customers?${id?`user_id=eq.${encodeURIComponent(id)}&`:""}select=*&order=created_at.desc`);
    const customers=await customerResponse.json();
    if(!customerResponse.ok)return json(res,502,{error:"Unable to load customers"});
    const authResponse=await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`,{headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`}});
    const authData=authResponse.ok?await authResponse.json():{users:[]};
    const users=new Map((authData.users||[]).map((user)=>[user.id,user]));
    const bookingResponse=await supabaseRequest(`bookings?${id?`customer_id=eq.${encodeURIComponent(id)}&`:"customer_id=not.is.null&"}select=*,package:packages(title),payments(id,amount,status,created_at),documents:booking_documents(id,document_type,created_at),cancellations:cancellation_requests(id,status,created_at)&order=created_at.desc`);
    const bookings=bookingResponse.ok?await bookingResponse.json():[];
    const rows=customers.map((customer)=>{const user=users.get(customer.user_id);const own=bookings.filter((booking)=>booking.customer_id===customer.user_id);return {...customer,email:user?.email||own[0]?.billing?.email||null,registered_at:user?.created_at||customer.created_at,booking_count:own.length,latest_booking:own[0]||null,payment_summary:{successful:own.flatMap((booking)=>booking.payments||[]).filter((payment)=>payment.status==="successful").length,pending:own.flatMap((booking)=>booking.payments||[]).filter((payment)=>["created","pending"].includes(payment.status)).length},bookings:id?own:undefined}});
    return json(res,200,id?{customer:rows[0]||null}:{customers:rows});
  }catch(error){console.error("admin_customers_failed",error);return json(res,500,{error:"Customer service unavailable"})}
}
