require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const documentRoutes = require('./routes/documentRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const articleRoutes = require('./routes/articleRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const teamRoutes = require('./routes/teamRoutes');
const annualServiceRoutes = require('./routes/annualServiceRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const contactRoutes = require('./routes/contactRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const techAssetRoutes = require('./routes/techAssetRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const pentestRoutes = require('./routes/pentestRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // permite os pedidos do frontend React (porta 5173)
app.use(express.json({ limit: '10mb' })); // limite maior para suportar upload de ficheiros (base64)

// Cabecalhos de seguranca basicos (sem dependencias externas)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// Rota raiz simples (verificacao rapida)
app.get('/', (req, res) => {
  res.json({
    api: 'Cyrix API',
    estado: 'online',
    recursos: [
      '/users', '/tickets', '/documents', '/service-requests',
      '/articles', '/services', '/team', '/annual-services', '/audit-log', '/contact', '/conversations',
    ],
  });
});

// Rotas (MVC)
app.use('/users', userRoutes);
app.use('/tickets', ticketRoutes);
app.use('/documents', documentRoutes);
app.use('/service-requests', serviceRequestRoutes);
app.use('/articles', articleRoutes);
app.use('/services', serviceRoutes);
app.use('/team', teamRoutes);
app.use('/annual-services', annualServiceRoutes);
app.use('/audit-log', auditLogRoutes);
app.use('/contact', contactRoutes);
app.use('/conversations', conversationRoutes);
app.use('/tech-assets', techAssetRoutes);
app.use('/incidents', incidentRoutes);
app.use('/pentests', pentestRoutes);

// Arranque do servidor (apos testar a ligacao a BD)
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Ligacao a base de dados projeto_BD estabelecida com sucesso.');
  } catch (err) {
    console.error('AVISO: nao foi possivel ligar a base de dados:', err.message);
    console.error('O servidor vai arrancar na mesma, mas os pedidos a BD irao falhar.');
  }

  app.listen(PORT, () => {
    console.log(`Servidor Express a correr em http://localhost:${PORT}`);
  });
}

start();
