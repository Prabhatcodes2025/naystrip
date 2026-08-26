import {json,supabaseRequest} from "./_shared.js";

const mapBlog=(row)=>({id:row.id,slug:row.slug,title:row.title,subtitle:row.body?.subtitle||"",description:row.excerpt||"",excerpt:row.excerpt||"",content:row.body?.content||"",author:row.body?.author||row.author_name||"",image:row.cover_image||"",category:row.seo?.category||"Travel Guides",seoTitle:row.seo?.title||"",seoDescription:row.seo?.description||"",featured:Boolean(row.seo?.featured),published:row.status==="published",date:row.published_at||row.created_at,createdAt:row.created_at});
const mapStory=(row)=>({id:row.id,name:row.name,destination:row.destination,rating:row.rating,image:row.photo||"",testimonial:row.testimonial,published:row.status==="published",createdAt:row.created_at});

export default async function handler(req,res){
  if(req.method!=="GET")return json(res,405,{error:"Method not allowed"});
  try{
    const resource=String(req.query?.resource||"blogs");
    if(resource==="stories"){
      const response=await supabaseRequest("testimonials?status=eq.published&select=*&order=created_at.desc");
      if(!response.ok)return json(res,502,{error:"Unable to load traveller stories"});
      return json(res,200,{stories:(await response.json()).map(mapStory)});
    }
    const response=await supabaseRequest("blogs?status=eq.published&select=*&order=published_at.desc.nullslast,created_at.desc");
    if(!response.ok)return json(res,502,{error:"Unable to load blog posts"});
    return json(res,200,{blogs:(await response.json()).map(mapBlog)});
  }catch(error){console.error("public_content_failed",error);return json(res,500,{error:"Content is temporarily unavailable"})}
}
