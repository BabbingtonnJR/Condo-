// Babbingtonn — Singleton #2. um pool só de conexão com o MySQL pro sistema todo
// André, nos repositórios é só Database.getInstance().query(sql, params)
const mysql = require('mysql2/promise');
const AppConfig = require('../config/AppConfig');

class Database {
  static #instancia = null;
  #pool; // privado, ninguém mexe de fora

  constructor() {
    if (Database.#instancia) {
      throw new Error('Database é um Singleton: use Database.getInstance().');
    }
    const { banco } = AppConfig.getInstance(); // pega host/senha do outro singleton
    this.#pool = mysql.createPool({
      ...banco,
      charset: 'utf8mb4',
      dateStrings: true, // data vem como texto, sem dor de cabeça com fuso
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  static getInstance() {
    if (!Database.#instancia) {
      Database.#instancia = new Database();
    }
    return Database.#instancia;
  }

  async query(sql, params = []) {
    const [resultado] = await this.#pool.query(sql, params);
    return resultado;
  }

  async testarConexao() {
    await this.query('SELECT 1');
    return true;
  }
}

module.exports = Database;
