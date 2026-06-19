// Insere (ou atualiza) os 3 utilizadores de demo na BD projeto_BD.
// Usar: node src/scripts/seed-users.js
require('dotenv').config();
const { sequelize, User } = require('../models');

const DEMO_USERS = [
  {
    name: 'João Silva',
    email: 'admin@ciryx.pt',
    password_hash: 'admin123',
    role: 'admin',
    company: null,
    twofa_word1: 'segurança',
    twofa_word2: 'firewall',
    twofa_word3: 'cifra',
    active: true,
  },
  {
    name: 'Maria Santos',
    email: 'manager@ciryx.pt',
    password_hash: 'manager123',
    role: 'manager',
    company: null,
    twofa_word1: 'proteção',
    twofa_word2: 'ameaça',
    twofa_word3: 'escudo',
    active: true,
  },
  {
    name: 'Carlos Oliveira',
    email: 'cliente@empresa.pt',
    password_hash: 'cliente123',
    role: 'client',
    company: 'Empresa ABC, Lda.',
    twofa_word1: 'privacidade',
    twofa_word2: 'código',
    twofa_word3: 'autenticação',
    active: true,
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Ligação à BD estabelecida.\n');

    for (const u of DEMO_USERS) {
      const existing = await User.findOne({ where: { email: u.email } });
      if (existing) {
        await existing.update(u);
        console.log(`🔄 Atualizado: ${u.email}`);
      } else {
        await User.create(u);
        console.log(`➕ Criado:     ${u.email}`);
      }
    }

    console.log('\n✅ Seed concluído! Utilizadores de demo prontos.');
    console.log('\nCredenciais:');
    console.log('  admin@ciryx.pt     / admin123    (role: admin)');
    console.log('  manager@ciryx.pt   / manager123  (role: manager)');
    console.log('  cliente@empresa.pt / cliente123  (role: client)');
  } catch (e) {
    console.error('❌ Erro:', e.message || String(e));
    if (e.parent) console.error('   Causa SQL:', e.parent.message);
    if (e.original) console.error('   Original:', e.original.message);
    console.error(e.stack || e);
  } finally {
    await sequelize.close();
  }
}

seed();
