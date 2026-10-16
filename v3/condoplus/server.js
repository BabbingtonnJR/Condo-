// Babbingtonn — sobe o servidor. usa os dois singletons (config daqui + banco que agora vem do pacote condoplus-core)
const express = require('express');
const path = require('path');
const AppConfig = require('./src/config/AppConfig');
const { Database } = require('condoplus-core');
const apiRoutes = require('./src/routes/api');
const { log } = require('condoplus-core');

const config = AppConfig.getInstance();
Database.configurar(config.banco); // v6: o pacote não lê .env, a gente passa a config pra ele
log.configurar({ ligado: config.logRequisicoes, ignorar: ['/sessao'] });
const app = express();

app.use(express.json());
app.use('/api', log.iniciar); // mostra no terminal quem chamou o quê
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
  console.log(`Núcleo reutilizável: condoplus-core v${require('condoplus-core').versao} (pacote instalado pelo npm)`);
  if (config.logRequisicoes) {
    console.log('Log das requisições: LIGADO (cada clique na tela aparece aqui embaixo)');
    console.log('  TELA = de onde veio | BACK = classe que atendeu | GANCHO = regra da filha (Template Method)');
    console.log('  FABRICA = Factory Method | REGRA = método da classe | BANCO = SQL rodado pelo Database (Singleton)');
    console.log('  RELAT = relatório SE (Template Method) | CONSUL = consulta CE (Template Method, sem cálculo)');
  }
  try {
    await Database.getInstance().testarConexao();
    console.log('Conexão com o banco: OK');
  } catch (e) {
    console.error('Não foi possível conectar ao banco:', e.message);
    console.error('Confira o arquivo .env e se o MySQL/MariaDB está rodando.');
  }
});
