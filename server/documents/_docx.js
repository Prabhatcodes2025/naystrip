import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, Packer, PageNumber, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType } from "docx";

const NAVY = "233B4F", ORANGE = "F45C0F", FOREST = "173C34", PALE = "FFF8F1", GREY = "59636B", WHITE = "FFFFFF";
const borders = { top: { style: BorderStyle.SINGLE, size: 2, color: "D9DEE2" }, bottom: { style: BorderStyle.SINGLE, size: 2, color: "D9DEE2" }, left: { style: BorderStyle.SINGLE, size: 2, color: "D9DEE2" }, right: { style: BorderStyle.SINGLE, size: 2, color: "D9DEE2" } };
const run = (text, options = {}) => new TextRun({ text: String(text ?? ""), font: "Arial", size: options.size || 20, bold: options.bold, color: options.color || NAVY });
const paragraph = (text, options = {}) => new Paragraph({ children: [run(text, options)], spacing: { before: options.before || 0, after: options.after ?? 100, line: 276 }, alignment: options.alignment });
const cell = (value, { bold = false, fill = WHITE, color = NAVY, width } = {}) => new TableCell({ width: width ? { size: width, type: WidthType.DXA } : undefined, borders, shading: { type: ShadingType.CLEAR, fill }, margins: { top: 90, bottom: 90, left: 120, right: 120 }, children: [paragraph(value || "", { bold, color, after: 0, size: 18 })] });
const dataTable = (headers, data, widths) => new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: widths, rows: [new TableRow({ tableHeader: true, children: headers.map((header, index) => cell(header, { bold: true, fill: FOREST, color: WHITE, width: widths[index] })) }), ...data.map((values) => new TableRow({ children: values.map((value, index) => cell(value, { fill: PALE, width: widths[index] })) }))] });
const keyValueTable = (rows) => dataTable(["DETAIL", "INFORMATION"], rows.map((item) => [item.label, item.value]), [2700, 6660]);
const heading = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(text, { bold: true, color: ORANGE, size: 25 })], spacing: { before: 220, after: 100 }, keepNext: true });

export async function createDocumentDocx(model, settings) {
  let logo = null;
  try { logo = await readFile(join(process.cwd(), "public", "branding", "naystrip-logo.png")); } catch {}
  const children = [];
  const headerRuns = [];
  if (logo) headerRuns.push(new ImageRun({ data: logo, transformation: { width: 150, height: 67 }, type: "png" }));
  children.push(new Paragraph({ children: headerRuns, spacing: { after: 80 } }));
  children.push(new Paragraph({ children: [run(model.title, { bold: true, size: 38, color: FOREST })], spacing: { after: 30 } }));
  children.push(new Paragraph({ children: [run(model.subtitle, { size: 22, color: GREY }), new TextRun({ text: `\t${model.reference}`, font: "Arial", size: 20, bold: true, color: ORANGE })], tabStops: [{ type: "right", position: 9360 }], spacing: { after: 180 } }));
  if (model.meta?.length) children.push(keyValueTable(model.meta));
  for (const section of model.sections || []) {
    if (!section?.heading || (!section.rows?.length && !section.table?.rows?.length && !section.bullets?.length && !section.text)) continue;
    children.push(heading(section.heading));
    if (section.text) children.push(paragraph(section.text));
    if (section.rows?.length) children.push(keyValueTable(section.rows));
    if (section.table?.rows?.length) {
      const count = section.table.headers.length;
      const base = Math.floor(9360 / count);
      const widths = section.table.headers.map((_, index) => index === count - 1 ? 9360 - base * (count - 1) : base);
      children.push(dataTable(section.table.headers, section.table.rows, widths));
    }
    for (const item of section.bullets || []) children.push(new Paragraph({ text: item, bullet: { level: 0 }, style: "Normal", spacing: { after: 70 } }));
  }
  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 20, color: NAVY }, paragraph: { spacing: { after: 100, line: 276 } } } }, paragraphStyles: [{ id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Arial", size: 25, bold: true, color: ORANGE }, paragraph: { spacing: { before: 220, after: 100 }, keepNext: true } }] },
    sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(`${settings.brandName || "NaysTrip"} | ${settings.email || "hello@naystrip.com"} | ${settings.phone || ""} | Page `, { size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY }), run(" of ", { size: 16, color: GREY }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: GREY })] })] }) }, children }],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}

