// Babbingtonn — Singleton: um pool só de conexão com o MySQL pra aplicação toda
// no pacote ele não lê .env nenhum: quem usa chama Database.configurar({...}) uma vez e pronto
// depois é sempre Database.getInstance().query(sql, params)
const mysql = require('mysql2/promise');
const log = require('./log');

class Database {
  static #instancia = null;
  static #config = null; // host, user, senha... quem passa é o projeto que instalou o pacote
  #pool;

  constructor() {
    if (Database.#instancia) {
      throw new Error('Database é um Singleton: use Database.getInstance().');
    }
    this.#pool = null; // o pool só abre na 1ª query, aí dá tempo do projeto chamar configurar()
  }

  #abrirPool() {
    if (!Database.#config) {
      throw new Error('Chame Database.configurar({ host, port, user, password, database }) antes de usar o banco.');
    }
    this.#pool = mysql.createPool({
      ...Database.#config,
      charset: 'utf8mb4',
      dateStrings: true, // data vem como texto, sem dor de cabeça com fuso
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  static configurar(config) {  // tem que vir antes da 1ª query
    if (Database.#instancia && Database.#instancia.#pool) throw new Error('O banco já foi aberto, configure antes de usar.');
    Database.#config = Object.freeze({ ...config });
    return Database;
  }

  static getInstance() {  // cria na 1ª vez, depois é sempre o mesmo
    if (!Database.#instancia) {
      Database.#instancia = new Database();
    }
    return Database.#instancia;
  }

  async query(sql, params = []) {
    log.registrar('BANCO', sql.replace(/\s+/g, ' ').trim().slice(0, 150)); // só o SQL, sem os valores (pode ter senha)
    if (!this.#pool) this.#abrirPool();
    const [resultado] = await this.#pool.query(sql, params);
    return resultado;
  }

  async testarConexao() {
    await this.query('SELECT 1');
    return true;
  }

  async fechar() {  // pros scripts e testes conseguirem terminar
    if (this.#pool) await this.#pool.end();
    this.#pool = null;
  }
}

module.exports = Database;
