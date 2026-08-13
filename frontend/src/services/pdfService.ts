import jsPDF from "jspdf";

export function baixarPDF(titulo: string, texto: string) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  const largura = pdf.internal.pageSize.getWidth();
  const altura = pdf.internal.pageSize.getHeight();
  const margemX = 20;
  const margemY = 20;
  const larguraUtil = largura - margemX * 2;
  const linhaAltura = 6;
  const tamanho = 11;

  // Remove emojis e símbolos não suportados pelo jsPDF
  const removerEmojis = (t: string) =>
    t.replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
     .replace(/[\u{2600}-\u{27BF}]/gu, "")
     .replace(/[^\x00-\x7FÀ-ÿ]/g, "")
     .trim();

  const tituloLimpo = removerEmojis(titulo);

  // Calcula altura necessária para o título
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  const tituloLinhas = pdf.splitTextToSize(tituloLimpo, larguraUtil);
  const alturaFaixa = 20 + tituloLinhas.length * 8;

  // Faixa azul no topo — altura dinâmica
  pdf.setFillColor(29, 78, 216);
  pdf.rect(0, 0, largura, alturaFaixa, "F");

  // Label topo
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Resumo por IA · Oportuniza", margemX, 12);

  // Título em negrito branco
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text(tituloLinhas, margemX, 22);

  // Linha divisória abaixo da faixa
  const yDivisoria = alturaFaixa + 6;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(margemX, yDivisoria, largura - margemX, yDivisoria);

  let cursorY = yDivisoria + 10;

  const limparMarkdown = (linha: string) =>
    removerEmojis(
      linha
        .replace(/^#+\s*/, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`(.+?)`/g, "$1")
        .replace(/^[*-]\s+/, "")
        .trim()
    );

  const linhas = texto.split("\n");

  for (const linha of linhas) {
    if (cursorY > altura - margemY) {
      pdf.addPage();
      cursorY = margemY;
    }

    const vazia = linha.trim() === "";
    if (vazia) { cursorY += 3; continue; }

    const ehItem = linha.trim().startsWith("* ") || linha.trim().startsWith("- ");
    const textoLimpo = limparMarkdown(linha);

    if (!textoLimpo) continue;

    if (ehItem) {
      pdf.setFontSize(tamanho);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(30, 30, 30);
      pdf.text("•", margemX, cursorY);

      const matchNegrito = linha.match(/^[*-]\s+\*\*(.+?)\*\*[:\s]*(.*)/);

      if (matchNegrito) {
        const termoBold = removerEmojis(matchNegrito[1].replace(/`/g, ""));
        const resto = removerEmojis(
          matchNegrito[2]
            .replace(/\*\*(.+?)\*\*/g, "$1")
            .replace(/\*(.+?)\*/g, "$1")
            .replace(/`(.+?)`/g, "$1")
        );

        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 30, 30);
        const largBold = pdf.getTextWidth(termoBold + ": ");
        pdf.text(termoBold + ":", margemX + 6, cursorY);

        if (resto) {
          pdf.setFont("helvetica", "normal");
          const xResto = margemX + 6 + largBold;
          const largResto = larguraUtil - 8 - largBold;

          if (largResto > 10) {
            const restoLinhas = pdf.splitTextToSize(resto, largResto);
            pdf.text(restoLinhas[0], xResto, cursorY);

            if (restoLinhas.length > 1) {
              cursorY += linhaAltura;
              const continuacao = pdf.splitTextToSize(restoLinhas.slice(1).join(" "), larguraUtil - 8);
              pdf.text(continuacao, margemX + 6, cursorY);
              cursorY += linhaAltura * continuacao.length;
            } else {
              cursorY += linhaAltura;
            }
          } else {
            cursorY += linhaAltura;
            const continuacao = pdf.splitTextToSize(resto, larguraUtil - 8);
            pdf.text(continuacao, margemX + 6, cursorY);
            cursorY += linhaAltura * continuacao.length;
          }
        } else {
          cursorY += linhaAltura;
        }
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(30, 30, 30);
        const quebradas = pdf.splitTextToSize(textoLimpo, larguraUtil - 8);
        pdf.text(quebradas, margemX + 6, cursorY);
        cursorY += linhaAltura * quebradas.length;
      }

      cursorY += 2;
      continue;
    }

    pdf.setFontSize(tamanho);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(30, 30, 30);
    const quebradas = pdf.splitTextToSize(textoLimpo, larguraUtil);
    pdf.text(quebradas, margemX, cursorY);
    cursorY += linhaAltura * quebradas.length + 1;
  }

  // Rodapé
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")} · oportunizajovem.vercel.app`,
    margemX,
    altura - 10
  );

  pdf.save(`resumo-${tituloLimpo.slice(0, 30).replace(/\s+/g, "-").toLowerCase()}.pdf`);
}