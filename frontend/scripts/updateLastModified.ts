import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// Corrige __dirname no ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho da pasta com as páginas legais
const legalPagesDir = path.resolve(__dirname, "../src/pages/legal");

// Pasta para os JSONs
const outputDir = path.join(legalPagesDir, "lastModified");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Lista arquivos .tsx na pasta legal
const files = fs.readdirSync(legalPagesDir).filter(f => f.endsWith(".tsx"));

if (files.length === 0) {
  console.log("Nenhum arquivo .tsx encontrado em", legalPagesDir);
}

files.forEach(file => {
  const filePath = path.join(legalPagesDir, file);
  let lastCommitDate: string;

  try {
    lastCommitDate = execSync(`git log -1 --format=%cd --date=iso "${filePath}"`)
      .toString()
      .trim();
  } catch (err) {
    console.warn(`Não foi possível obter a data de ${file}, usando data atual.`);
    lastCommitDate = new Date().toISOString();
  }

  const jsonFileName = file.replace(".tsx", ".json");
  const outputPath = path.join(outputDir, jsonFileName);

  fs.writeFileSync(outputPath, JSON.stringify({ date: lastCommitDate }, null, 2));
  console.log(`Updated lastModified: ${jsonFileName} -> ${lastCommitDate}`);
});