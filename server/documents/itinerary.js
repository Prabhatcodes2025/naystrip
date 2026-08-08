import { getTourBySlug } from "../../src/data/tours.js";
import { colours,createBrandedPdf,sendPdf,wrap } from "./_pdf.js";

export default async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 const slug=String(req.query?.slug||"").replace(/[^a-z0-9-]/gi,"").slice(0,100);const tour=getTourBySlug(slug);if(!tour)return res.status(404).json({error:"Package not found"});
 const {pdf,regular,bold,addPage}=await createBrandedPdf(tour.title,`${tour.duration}  •  ${tour.destinations.join(" • ")}`);let {page,y}=addPage();
 const ensure=(needed=80)=>{if(y<needed){({page,y}=addPage())}};
 const paragraph=(text,{size=9,font=regular,colour=colours.grey,indent=0,leading=14}={})=>{for(const line of wrap(font,text,size,500-indent)){ensure(70);page.drawText(line,{x:42+indent,y,size,font,color:colour});y-=leading}y-=5};
 paragraph(tour.overview,{size:10});
 for(const item of tour.itinerary){ensure(120);page.drawText(`DAY ${String(item.day).padStart(2,"0")}  ${item.title}`,{x:42,y,size:13,font:bold,color:colours.orange});y-=21;paragraph(item.details,{indent:12});if(item.meals)paragraph(`Meals: ${item.meals}`,{font:bold,indent:12});if(item.stay)paragraph(`Stay: ${item.stay}`,{font:bold,indent:12});y-=7}
 ensure(130);page.drawText("INCLUSIONS",{x:42,y,size:13,font:bold,color:colours.forest});y-=21;for(const item of tour.inclusions)paragraph(`• ${item}`,{indent:8});
 ensure(130);page.drawText("EXCLUSIONS",{x:42,y,size:13,font:bold,color:colours.forest});y-=21;for(const item of tour.exclusions)paragraph(`• ${item}`,{indent:8});
 const bytes=await pdf.save();return sendPdf(res,bytes,`naystrip-${slug}-itinerary.pdf`);
}
