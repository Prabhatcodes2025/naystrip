import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const colours={navy:rgb(35/255,59/255,79/255),orange:rgb(244/255,92/255,15/255),forest:rgb(23/255,60/255,52/255),grey:rgb(.35,.39,.43)};
export const wrap=(font,text,size,width)=>{const words=String(text||"").split(/\s+/);const lines=[];let line="";for(const word of words){const candidate=line?`${line} ${word}`:word;if(font.widthOfTextAtSize(candidate,size)>width&&line){lines.push(line);line=word}else line=candidate}if(line)lines.push(line);return lines};

export async function createBrandedPdf(title,subtitle=""){
 const pdf=await PDFDocument.create();const regular=await pdf.embedFont(StandardFonts.Helvetica);const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 let logo=null;try{logo=await pdf.embedPng(await readFile(join(process.cwd(),"public","branding","naystrip-logo.png")))}catch(error){console.error("pdf_logo_unavailable",error.message)}
 const addPage=()=>{const page=pdf.addPage([595.28,841.89]);page.drawRectangle({x:0,y:0,width:595.28,height:841.89,color:rgb(1,.98,.95)});page.drawRectangle({x:0,y:823,width:595.28,height:19,color:colours.orange});if(logo){const scaled=logo.scaleToFit(118,118);page.drawImage(logo,{x:42,y:685,width:scaled.width,height:scaled.height})}page.drawText("NAYSTRIP • LEISURE TO ADVENTURE",{x:365,y:790,size:8,font:bold,color:colours.forest});page.drawText("hello@naystrip.com  |  +91 8097132424",{x:365,y:776,size:7,font:regular,color:colours.grey});page.drawText(title,{x:42,y:650,size:25,font:bold,color:colours.forest,maxWidth:510});if(subtitle)page.drawText(subtitle,{x:42,y:625,size:10,font:regular,color:colours.grey,maxWidth:510});return {page,y:590}};
 return {pdf,regular,bold,addPage};
}

export function sendPdf(res,bytes,filename){res.setHeader("Content-Type","application/pdf");res.setHeader("Content-Disposition",`attachment; filename="${filename}"`);res.setHeader("Cache-Control","private, no-store");return res.status(200).send(Buffer.from(bytes))}
