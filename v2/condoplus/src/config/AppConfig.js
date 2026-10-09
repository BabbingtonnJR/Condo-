// Babbingtonn — Singleton #1. lê o .env uma vez só e todo mundo usa a mesma config
// pra usar: AppConfig.getInstance()  (não tem como dar new, é de propósito)
require('dotenv').config();

class AppConfig {
  static #instancia = null; // o único objeto fica guardado aqui

  constructor() {
    if (AppConfig.#instancia) {  // já tem um? então não deixa criar outro
      throw new Error('AppConfig é um Singleton: use AppConfig.getInstance().');
    }
    this.porta = Number(process.env.PORT) || 3000;
    this.ambiente = process.env.NODE_ENV || 'desenvolvimento';
    this.banco = Object.freeze({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'condoplus_app',
      password: process.env.DB_PASSWORD ?? 'condoplus_pass', // ?? pq no XAMPP a senha costuma ser vazia
      database: process.env.DB_NAME || 'condoplus',
    });
  }

  static getInstance() {  // cria na 1ª vez, depois é sempre o mesmo
    if (!AppConfig.#instancia) {
      AppConfig.#instancia = new AppConfig();
    }
    return AppConfig.#instancia;
  }

  resumo() {
    const b = this.banco;
    return `ambiente=${this.ambiente} | porta=${this.porta} | banco=${b.database}@${b.host}:${b.port}`;
  }
}

module.exports = AppConfig;
