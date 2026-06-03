// Cria a base de dados projeto_BD (se nao existir) e aplica o schema.sql + seed.sql.
// Usa as credenciais do src/.env. Corre com:  node scripts/setup-db.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const cfg = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};
const DB = process.env.DB_NAME || 'projeto_BD';

const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');

async function main() {
  // 1) Ligar a base de manutencao "postgres" para poder criar a projeto_BD
  const admin = new Client({ ...cfg, database: 'postgres' });
  try {
    await admin.connect();
  } catch (e) {
    console.error('\n[ERRO] Nao consegui ligar ao PostgreSQL.');
    console.error('Mensagem:', e.message);
    console.error('Confirma DB_HOST/DB_PORT/DB_USER/DB_PASSWORD no src/.env (porta provavel: 5143).\n');
    process.exit(1);
  }

  // 2) Criar a base de dados se ainda nao existir
  const existe = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB]);
  if (existe.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${DB}"`);
    console.log(`[OK] Base de dados "${DB}" criada.`);
  } else {
    console.log(`[INFO] Base de dados "${DB}" ja existia.`);
  }
  await admin.end();

  // 3) Ligar a projeto_BD e aplicar o schema (tabelas + dados de exemplo)
  const db = new Client({ ...cfg, database: DB });
  await db.connect();

  const schema = fs.readFileSync(schemaPath, 'utf8');
  try {
    await db.query(schema);
    console.log('[OK] schema.sql aplicado (tabelas e dados de exemplo criados).');
  } catch (e) {
    if (/already exists|ja existe/i.test(e.message)) {
      console.log('[INFO] As tabelas ja existem nesta base de dados - schema.sql ignorado.');
      console.log('       (Para recriar do zero, apaga a base e volta a correr este comando.)');
    } else {
      throw e;
    }
  }

  // 4) Mostrar as tabelas existentes
  const t = await db.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log('\nTabelas em ' + DB + ':');
  t.rows.forEach((r) => console.log('   - ' + r.table_name));

  await db.end();
  console.log('\n[CONCLUIDO] Base de dados pronta a usar.');
}

main().catch((e) => {
  console.error('[ERRO]', e.message);
  process.exit(1);
});
