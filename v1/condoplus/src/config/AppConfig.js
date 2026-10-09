require('dotenv').config();

/**
 * ============================================================
 * PADRÃO SINGLETON — exemplo 1: AppConfig
 * ============================================================
 * Centraliza a configuração da aplicação (lida do arquivo .env).
 *
 * Por que Singleton?
 *  - O .env é lido UMA única vez, quando a aplicação sobe.
 *  - Todas as partes do sistema (servidor, banco, rotas) enxergam
 *    exatamente a MESMA configuração, sem cada uma ler o .env de novo.
 *
 * Como garantimos uma instância só?
 *  1. A instância fica guardada num atributo estático e privado (#instancia).
 *  2. O acesso é feito por AppConfig.getInstance(), que cria na primeira
 *     chamada e devolve sempre a mesma nas próximas.
 *  3. Se alguém tentar "new AppConfig()" depois que ela já existe,
 *     o construtor lança um erro.
 */
class AppConfig {
  static #instancia = null;

  constructor() {
    if (AppConfig.#instancia) {
      throw new Error('AppConfig é um Singleton: use AppConfig.getInstance().');
    }
    this.porta = Number(process.env.PORT) || 3000;
    this.ambiente = process.env.NODE_ENV || 'desenvolvimento';
    this.banco = Object.freeze({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'condoplus_app',
      password: process.env.DB_PASSWORD || 'condoplus_pass',
      database: process.env.DB_NAME || 'condoplus',
    });
    this.carregadoEm = new Date();
  }

  /** Ponto único de acesso à instância. */
  static getInstance() {
    if (!AppConfig.#instancia) {
      AppConfig.#instancia = new AppConfig();
    }
    return AppConfig.#instancia;
  }

  ehDesenvolvimento() {
    return this.ambiente === 'desenvolvimento';
  }

  resumo() {
    const b = this.banco;
    return `ambiente=${this.ambiente} | porta=${this.porta} | banco=${b.database}@${b.host}:${b.port}`;
  }
}

module.exports = AppConfig;
