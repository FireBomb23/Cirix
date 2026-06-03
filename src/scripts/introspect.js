// Script auxiliar: lê o esquema real das tabelas em projeto_BD para podermos
// mapear os models Sequelize corretamente (sem alterar nada na BD).
const sequelize = require('../config/database');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('OK: ligacao a projeto_BD estabelecida.\n');

    const [cols] = await sequelize.query(`
      SELECT table_name, column_name, data_type, is_nullable,
             character_maximum_length, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);

    let current = null;
    for (const c of cols) {
      if (c.table_name !== current) {
        current = c.table_name;
        console.log(`\n== ${current} ==`);
      }
      const len = c.character_maximum_length ? `(${c.character_maximum_length})` : '';
      const nn = c.is_nullable === 'NO' ? 'NOT NULL' : '';
      const def = c.column_default ? `default ${c.column_default}` : '';
      console.log(`   ${c.column_name} : ${c.data_type}${len} ${nn} ${def}`.trimEnd());
    }
    console.log('\n--- FIM ---');
  } catch (e) {
    console.error('ERRO:', e.message);
  } finally {
    await sequelize.close();
  }
}

main();
