const { ErroValidacao } = require('../erros');

/**
 * Classe base (abstrata) de todas as entidades do domínio.
 *
 * Cada subclasse só DECLARA seus atributos em listas estáticas:
 *   - campos         -> colunas que o usuário pode gravar/editar
 *   - somenteLeitura -> colunas preenchidas pelo banco (ex.: datas de criação)
 *   - padroes        -> valores iniciais
 *   - conversores    -> como converter cada campo (texto, número, booleano...)
 *
 * O construtor, a atualização e a conversão para o banco são escritos
 * UMA vez aqui e reaproveitados pelas 13 entidades (reuso por herança).
 */
class Entidade {
  static campos = [];
  static somenteLeitura = [];
  static padroes = {};
  static conversores = {};

  constructor(dados = {}) {
    if (new.target === Entidade) throw new Error('Entidade é abstrata.');
    const C = this.constructor;
    this.id = dados.id != null && dados.id !== '' ? Number(dados.id) : null;
    for (const campo of C.campos) {
      const valor = dados[campo] !== undefined ? dados[campo] : C.padroes[campo];
      this[campo] = C.converter(campo, valor);
    }
    for (const campo of C.somenteLeitura) {
      this[campo] = dados[campo] ?? null;
    }
  }

  static converter(campo, valor) {
    if (valor === undefined) return null;
    const conversor = this.conversores[campo];
    return conversor ? conversor(valor) : valor;
  }

  /** Lista de mensagens de erro. Vazia = entidade válida. (cada subclasse sobrescreve) */
  validar() {
    return [];
  }

  garantirValida() {
    const erros = this.validar();
    if (erros.length) throw new ErroValidacao(erros);
  }

  ehNova() {
    return this.id == null;
  }

  /** Aplica uma atualização parcial (só os campos enviados). */
  atualizarCom(dados = {}) {
    const C = this.constructor;
    for (const campo of C.campos) {
      if (dados[campo] !== undefined) this[campo] = C.converter(campo, dados[campo]);
    }
    return this;
  }

  /** Objeto { coluna: valor } pronto para INSERT/UPDATE. */
  toDB() {
    const linha = {};
    for (const campo of this.constructor.campos) linha[campo] = this[campo] === undefined ? null : this[campo];
    return linha;
  }
}

module.exports = Entidade;
