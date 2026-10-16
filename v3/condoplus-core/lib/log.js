// Babbingtonn — log das requisições no terminal (quem chamou quem em cada clique)
// no pacote vem desligado: o projeto liga com log.configurar({ ligado: true })
// uso no express: app.use('/api', log.iniciar)
const { AsyncLocalStorage } = require('async_hooks');

const contexto = new AsyncLocalStorage(); // guarda as linhas de cada requisição separadas
const opcoes = { ligado: false, ignorar: [] };

function configurar({ ligado = false, ignorar = [] } = {}) {
  opcoes.ligado = !!ligado;
  opcoes.ignorar = ignorar; // caminhos que não precisam aparecer (ex.: ['/sessao'])
}

// middleware: abre o bloco quando a requisição chega e imprime tudo quando termina
function iniciar(req, res, next) {
  if (!opcoes.ligado || opcoes.ignorar.some((p) => req.path.startsWith(p))) return next();
  const linhas = [];
  const inicio = Date.now();
  const tela = decodeURIComponent(req.get('X-Tela') || 'desconhecida');
  const botao = decodeURIComponent(req.get('X-Botao') || '');
  linhas.push(['TELA', `${tela}${botao ? `  |  botão: "${botao}"` : '  |  (carregando a tela)'}`]);
  res.on('finish', () => {
    const hora = new Date().toLocaleTimeString('pt-BR');
    const saida = ['-'.repeat(78), `[${hora}] ${req.method} ${req.originalUrl}   ->  ${res.statusCode} em ${Date.now() - inicio} ms`];
    for (const [tipo, msg] of linhas) saida.push(`   ${tipo.padEnd(8)}${msg}`);
    console.log(saida.join('\n'));
  });
  contexto.run({ linhas }, () => next());
}

// qualquer classe chama isso pra aparecer no bloco da requisição atual
function registrar(tipo, msg) {
  if (!opcoes.ligado) return;
  const atual = contexto.getStore();
  if (atual) atual.linhas.push([tipo, msg]);
}

module.exports = { configurar, iniciar, registrar };
