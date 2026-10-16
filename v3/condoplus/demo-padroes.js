// Babbingtonn — mostra os 3 padrões rodando no terminal, nem precisa do MySQL ligado
// node demo-padroes.js   (ou só um: singleton | template | factory)
const AppConfig = require('./src/config/AppConfig');
const { Database, BaseRepository } = require('condoplus-core'); // v6: vêm do pacote
const RepositoryFactory = require('./src/repositories/RepositoryFactory');
const { CondominioCreator } = require('./src/factories/CondominioFactory');
const { Morador } = require('./src/models');

function titulo(t) { console.log('\n=== ' + t + ' ==='); }

async function singleton() {  // Babbingtonn: mostra que só existe 1 AppConfig e 1 Database
  titulo('SINGLETON');
  const a = AppConfig.getInstance();
  const b = AppConfig.getInstance();
  console.log('AppConfig: as duas chamadas devolvem o mesmo objeto?', a === b);
  try { new AppConfig(); } catch (e) { console.log('Tentando "new AppConfig()":', e.message); }

  const usuarios = RepositoryFactory.criar('usuarios');
  const vagas = RepositoryFactory.criar('vagas');
  console.log('Database: os repositórios de usuários e de vagas usam o mesmo pool?',
    usuarios.db === vagas.db && usuarios.db === Database.getInstance());
}

async function template() {  // André: a mãe não roda sozinha e a filha só mexe no gancho
  titulo('TEMPLATE METHOD');
  try { new BaseRepository('x'); } catch (e) { console.log('Tentando usar a mãe sozinha:', e.message); }

  const repo = RepositoryFactory.criar('moradores');
  console.log('MoradorRepository reescreve salvar()?', Object.prototype.hasOwnProperty.call(Object.getPrototypeOf(repo), 'salvar'));
  console.log('MoradorRepository preenche o gancho antesDeSalvar()?', Object.prototype.hasOwnProperty.call(Object.getPrototypeOf(repo), 'antesDeSalvar'));
  try {
    await repo.salvar(new Morador({ nome: '' }));
  } catch (e) {
    console.log('Passo 1 da receita (validar) barrou o morador:', e.message);
  }
}

async function factory() {  // Gabriel: cada criador monta o condomínio do jeito do tipo
  titulo('FACTORY METHOD');
  for (const tipo of ['residencial', 'comercial', 'clube']) {
    const criador = CondominioCreator.paraTipo(tipo);
    const c = criador.novoCondominio({ nome: 'Exemplo' });
    console.log(`${criador.constructor.name.padEnd(18)} -> módulos ligados: ${c.modulosAtivos().join(', ')}`
      + ` | pessoas: ${criador.rotulos().pessoas}`);
  }
  try { CondominioCreator.paraTipo('coworking'); } catch (e) { console.log('Tipo que ainda não existe:', e.message); }
  console.log('RepositoryFactory.criar("moradores") ->', RepositoryFactory.criar('moradores').constructor.name);
  console.log('RepositoryFactory.criar("vagas")     ->', RepositoryFactory.criar('vagas').constructor.name);
}

(async () => {
  const qual = (process.argv[2] || 'todos').toLowerCase();
  if (qual === 'singleton' || qual === 'todos') await singleton();
  if (qual === 'template' || qual === 'todos') await template();
  if (qual === 'factory' || qual === 'todos') await factory();
  process.exit(0);
})();
