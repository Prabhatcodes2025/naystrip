import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

const C = { navy: rgb(35/255,59/255,79/255), orange: rgb(244/255,92/255,15/255), forest: rgb(23/255,60/255,52/255), grey: rgb(.35,.39,.43), pale: rgb(1,.98,.95), line: rgb(.84,.87,.89), white: rgb(1,1,1) };
const wrap = (font, value, size, width) => {
  const lines=[]; let line="";
  const printable=Array.from(String(value??"")).map((char)=>{const code=char.charCodeAt(0);return code===9||code===10||code===13||(code>=32&&code<=255)?char:"-"}).join("");
  for (const word of printable.split(/\s+/).filter(Boolean)) {
    const candidate=line?`${line} ${word}`:word;
    if (line && font.widthOfTextAtSize(candidate,size)>width) { lines.push(line); line=word; } else line=candidate;
  }
  if (line) lines.push(line);
  return lines.length?lines:[""];
};

export async function createDocumentPdf(model, settings) {
  const pdf=await PDFDocument.create();
  const regular=await pdf.embedFont(StandardFonts.Helvetica), bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  let logo=null; try { logo=await pdf.embedPng(await readFile(join(process.cwd(),"public","branding","naystrip-logo.png"))); } catch {}
  let page,y;
  const addPage=()=>{
    page=pdf.addPage([595.28,841.89]); page.drawRectangle({x:0,y:0,width:595.28,height:841.89,color:C.pale}); page.drawRectangle({x:0,y:823,width:595.28,height:19,color:C.orange});
    if(logo){const scaled=logo.scaleToFit(116,65);page.drawImage(logo,{x:40,y:742,width:scaled.width,height:scaled.height});const watermark=logo.scaleToFit(250,150);page.drawImage(logo,{x:(595.28-watermark.width)/2,y:340,width:watermark.width,height:watermark.height,opacity:.04})}
    page.drawText(String(settings.brandName||"NaysTrip & Treks"),{x:365,y:790,size:10,font:bold,color:C.forest}); page.drawText(settings.tagline||"Leisure to Adventure",{x:365,y:775,size:8,font:regular,color:C.grey}); page.drawText(`${settings.phone||""} | ${settings.email||""}`,{x:365,y:760,size:7,font:regular,color:C.grey}); y=720;
  };
  const ensure=(height=80)=>{if(!page||y-height<55)addPage()};
  const drawLines=(value,{x=42,width=510,size=9,font=regular,color=C.navy,leading=12}={})=>{const lines=wrap(font,value,size,width);ensure(lines.length*leading+8);for(const line of lines){page.drawText(line,{x,y,size,font,color});y-=leading}return lines.length*leading};
  const sectionHeading=(value)=>{ensure(38);y-=8;page.drawRectangle({x:40,y:y-18,width:515,height:24,color:C.forest});page.drawText(value.toUpperCase(),{x:50,y:y-11,size:9,font:bold,color:C.white});y-=31};
  const keyRows=(items)=>{for(const item of items||[]){const valueLines=wrap(regular,item.value,8.5,350),height=Math.max(26,valueLines.length*11+10);ensure(height+5);page.drawRectangle({x:40,y:y-height,width:515,height,color:C.white,borderColor:C.line,borderWidth:.5});page.drawRectangle({x:40,y:y-height,width:145,height,color:C.pale});page.drawText(String(item.label).toUpperCase(),{x:48,y:y-16,size:7,font:bold,color:C.orange});let ly=y-15;for(const line of valueLines){page.drawText(line,{x:195,y:ly,size:8.5,font:regular,color:C.navy});ly-=11}y-=height}y-=5};
  const drawTable=(data)=>{const columns=data.headers.length,width=515/columns;const renderHeader=()=>{ensure(28);for(let i=0;i<columns;i++){page.drawRectangle({x:40+i*width,y:y-25,width,height:25,color:C.forest,borderColor:C.line,borderWidth:.5});const headerLines=wrap(bold,data.headers[i],7,width-12).slice(0,2);headerLines.forEach((line,index)=>page.drawText(line,{x:46+i*width,y:y-14-index*8,size:7,font:bold,color:C.white}))}y-=25};renderHeader();for(const values of data.rows){const wrapped=values.map((value)=>wrap(regular,value,7.5,width-12));const height=Math.max(28,...wrapped.map(lines=>lines.length*10+10));if(y-height<55){addPage();sectionHeading(`${model.title} - continued`);renderHeader()}for(let i=0;i<columns;i++){page.drawRectangle({x:40+i*width,y:y-height,width,height,color:C.white,borderColor:C.line,borderWidth:.5});let ly=y-14;for(const line of wrapped[i]){page.drawText(line,{x:46+i*width,y:ly,size:7.5,font:regular,color:C.navy});ly-=10}}y-=height}y-=5};
  addPage(); drawLines(model.title,{size:19,font:bold,color:C.forest}); y-=2; drawLines(model.subtitle,{size:10,font:bold,color:C.orange}); page.drawText(model.reference,{x:425,y:y+12,size:8,font:bold,color:C.grey}); y-=8;
  if(model.status==="draft")page.drawText("DRAFT",{x:420,y:675,size:28,font:bold,color:rgb(.85,.85,.85),rotate:degrees(25)});
  keyRows(model.meta);
  for(const section of model.sections||[]){if(!section?.heading||(!section.rows?.length&&!section.table?.rows?.length&&!section.bullets?.length&&!section.text))continue;sectionHeading(section.heading);if(section.text){drawLines(section.text,{size:8.5});y-=8}if(section.rows?.length)keyRows(section.rows);if(section.table?.rows?.length)drawTable(section.table);for(const bullet of section.bullets||[]){const lines=wrap(regular,bullet,8.5,490);ensure(lines.length*11+8);page.drawCircle({x:47,y:y-3,size:2,color:C.orange});let ly=y;for(const line of lines){page.drawText(line,{x:56,y:ly,size:8.5,font:regular,color:C.navy});ly-=11}y-=lines.length*11+5}}
  const pages=pdf.getPages(); pages.forEach((item,index)=>{item.drawLine({start:{x:40,y:38},end:{x:555,y:38},thickness:.5,color:C.line});item.drawText(`${settings.brandName||"NaysTrip"} | ${settings.email||""} | ${settings.phone||""}`,{x:40,y:22,size:7,font:regular,color:C.grey});item.drawText(`Page ${index+1} of ${pages.length}`,{x:500,y:22,size:7,font:regular,color:C.grey})});
  return Buffer.from(await pdf.save());
}
