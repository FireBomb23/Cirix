require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const utilizadorRoutes = require('./routes/utilizadorRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const incidenteRoutes = require('./routes/incidenteRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // permite os pedidos do frontend React (porta 5173)
app.use(express.json());

// Rota raiz simples (verificacao rapida)
app.get('/', (req, res) => {
  res.json({
    api: 'Cirix API',
    estado: 'online',
    recursos: ['/utilizadores', '/clientes', '/incidentes', '/tickets'],
  });
});

// Rotas (MVC)
app.use('/utilizadores', utilizadorRoutes);
app.use('/clientes', clienteRoutes);
app.use('/incidentes', incidenteRoutes);
app.use('/tickets', ticketRoutes);

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
