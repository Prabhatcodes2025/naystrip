import { buildDocumentModel, documentSettings } from "./_document-data.js";
import { createDocumentDocx } from "./_docx.js";
import { createDocumentPdf } from "./_document-pdf.js";

const legacyTypes={voucher:"hotel_voucher"};

export async function generateBookingDocument(booking,type="hotel_voucher",format="pdf",options={}){
  const normalized=legacyTypes[type]||type;
  const settings=options.settings||await documentSettings();
  const model=buildDocumentModel(booking,normalized,{...options,settings});
  const bytes=format==="docx"?await createDocumentDocx(model,settings):await createDocumentPdf(model,settings);
  return {bytes,model,contentType:format==="docx"?"application/vnd.openxmlformats-officedocument.wordprocessingml.document":"application/pdf",extension:format};
}

export async function bookingDocument(booking,type="voucher"){
  return (await generateBookingDocument(booking,type,"pdf")).bytes;
}
