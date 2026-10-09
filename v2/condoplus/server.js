// Babbingtonn — sobe o servidor. usa os dois singletons (config + banco)
const express = require('express');
const path = require('path');
const AppConfig = require('./src/config/AppConfig');
const Database = require('./src/db/Database');
const apiRoutes = require('./src/routes/api');

const config = AppConfig.getInstance();
const app = express();

app.use(express.json());
app.use('/api', apiRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.redirect('/login.html'));

// rota que não existe
app.use('/api', (req, res) => res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` }));

app.use((err, req, res, next) => {  // JSON zoado e outros erros soltos
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ erro: status === 400 ? 'Corpo da requisição inválido.' : err.message });
});

app.listen(config.porta, async () => {
  console.log(`Condo+ rodando em http://localhost:${config.porta}`);
  console.log(`Configuração: ${config.resumo()}`);
  try {
    await Database.getInstance().testarConexao();
    console.log('Conexão com o banco: OK');
  } catch (e) {
    console.error('Não foi possível conectar ao banco:', e.message);
    console.error('Confira o arquivo .env e se o MySQL/MariaDB está rodando.');
  }
});
