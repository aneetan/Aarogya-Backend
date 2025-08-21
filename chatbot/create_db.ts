import fs from "fs";
import PdfParse from "pdf-parse";

const pdfFile = fs.readFileSync('chatbot/data_sources/redcross_first_aid.pdf');

//get information from pdf
PdfParse(pdfFile).then(function (data) {
   fs.writeFileSync('chatbot/data_sources/extracted_text.txt', data.text);
})