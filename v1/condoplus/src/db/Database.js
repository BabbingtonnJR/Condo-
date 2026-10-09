const mysql = require('mysql2/promise');
const AppConfig = require('../config/AppConfig');

/**
 * ============================================================
 * PADRÃO SINGLETON — exemplo 2: Database
 * ============================================================
 * Mantém UM único pool de conexões com o MySQL para toda a aplicação.
 *
 * Por que Singleton?
 *  - Abrir um pool novo a cada requisição esgotaria as conexões do MySQL.
 *  - Todos os repositórios (MoradorRepository, UsuarioRepository...)
 *    chamam Database.getInstance() e reaproveitam o MESMO pool.
 *
 * Note que o Database depende do OUTRO Singleton (AppConfig) para
 * saber host, usuário e senha do banco.
 */
class Database {
  static #instancia = null;
  #pool; // atributo privado: ninguém de fora mexe no pool diretamente

  constructor() {
    if (Database.#instancia) {
      throw new Error('Database é um Singleton: use Database.getInstance().');
    }
    const { banco } = AppConfig.getInstance();
    this.#pool = mysql.createPool({
      ...banco,
      charset: 'utf8mb4',
      dateStrings: true, // datas chegam como texto "AAAA-MM-DD", sem problema de fuso
      waitForConnections: true,
      connectionLimit: 10,
    });
    this.totalConsultas = 0;
    this.criadoEm = new Date();
  }

  /** Ponto único de acesso à instância. */
  static getInstance() {
    if (!Database.#instancia) {
      Database.#instancia = new Database();
    }
    return Database.#instancia;
  }

  /** Executa um SQL com parâmetros (?) e devolve as linhas / resultado. */
  async query(sql, params = []) {
    this.totalConsultas++;
    const [resultado] = await this.#pool.query(sql, params);
    return resultado;
  }

  async testarConexao() {
    await this.query('SELECT 1');
    return true;
  }

  async encerrar() {
    await this.#pool.end();
    Database.#instancia = null;
  }
}

module.exports = Database;
