// backend/scripts/gerarHashSenha.ts
import bcrypt from "bcrypt";

async function main() {
  const senha = process.argv[2];

  if (!senha) {
    console.error("Uso: npx ts-node scripts/gerarHashSenha.ts <senha>");
    process.exit(1);
  }

  const hash = await bcrypt.hash(senha, 10);
  console.log("\n✅ Hash gerado:\n");
  console.log(hash);
}

main();