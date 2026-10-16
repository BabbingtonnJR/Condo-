// Babbingtonn — porta de entrada do pacote: tudo que dá pra reusar sai daqui
// const { Database, BaseRepository, CrudController, Entidade } = require('condoplus-core')
const Database = require('./lib/Database');               // Singleton
const BaseRepository = require('./lib/BaseRepository');   // Template Method (salvar/listar/excluir)
const BaseController = require('./lib/BaseController');   // Template Method (manipular)
const CrudController = require('./lib/CrudController');   // CRUD inteiro numa linha
const Entidade = require('./lib/Entidade');               // classe mãe das entidades
const log = require('./lib/log');
const erros = require('./lib/erros');
const conversores = require('./lib/conversores');

module.exports = {
  Database, BaseRepository, BaseController, CrudController, Entidade, log,
  ...erros,        // ErroAplicacao, ErroValidacao, ErroNaoEncontrado, ErroAutenticacao
  ...conversores,  // Conv, hojeISO, ehDataISO, ehEmail
  versao: require('./package.json').version,
};
