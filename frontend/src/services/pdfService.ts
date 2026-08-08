import jsPDF from "jspdf";


export function baixarPDF(
titulo: string,
texto: string
) {

const pdf = new jsPDF();


pdf.setFontSize(16);

pdf.text(titulo, 10, 20);


pdf.setFontSize(12);


const linhas =
pdf.splitTextToSize(
texto,
180
);


pdf.text(
linhas,
10,
40
);


pdf.save("resumo.pdf");

}