const bcrypt = require("bcrypt");

const senha = process.argv[2];
const hash = process.argv[3];

if (!senha || !hash) {
  console.error("Uso: node testar-hash.js <senha> <hash>");
  process.exit(1);
}

bcrypt.compare(senha, hash).then((ok) => {
  console.log("Senha correta?", ok);
});