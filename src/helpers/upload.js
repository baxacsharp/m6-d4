import PdfPrinter from "pdfmake";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import fs from "fs-extra";

import { pipeline } from "stream";

const asyncPipeLine = promisify(pipeline);
export const generatePDFStream = async (data) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: ["First Paragraph"],
  };

  const options = {
    // ...
  };

  const pdfReadableStream = printer.createPdfKitDocument(
    docDefinition,
    options
  );
  pdfReadableStream.end();
  const path = join(dirname(fileURLToPath(import.meta.url)), "mypdf.pdf");
  const destination = fs.createWriteStream(path);
  await asyncPipeLine(pdfReadableStream, destination);
};
