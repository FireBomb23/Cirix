// Converte para hash bcrypt qualquer password que ainda esteja em texto simples.
// Util para bases de dados criadas antes de existir o hashing.
// Correr com:  npm run hash-passwords   (ou: node scripts/hash-passwords.js)
require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, User } = require('../models');

// Ja parece um hash? (bcrypt comeca por $2a/$2b/$2y)
const looksHashed = (s) => typeof s === 'string' && /^\$2[aby]\$/.test(s);

async function main() {
  await sequelize.authenticate();
  const users = await User.findAll();
  let n = 0;
  for (const u of users) {
    if (!looksHashed(u.password_hash)) {
      u.password_hash = await bcrypt.hash(u.password_hash, 10);
      await u.save({ hooks: false }); // ja esta em hash, nao voltar a cifrar
      n++;
      console.log('  hashed:', u.email);
    }
  }
  console.log(`\n[OK] ${n} password(s) convertida(s) para hash bcrypt (de ${users.length} utilizador(es)).`);
  await sequelize.close();
}

main().catch((e) => {
  console.error('[ERRO]', e.message);
  process.exit(1);
});
