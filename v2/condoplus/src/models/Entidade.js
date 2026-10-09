// André — mãe de todas as classes do domínio
// a filha só lista os campos e escreve o validar(), o resto (construtor, editar, toDB) vem daqui
const { ErroValidacao } = require('../erros');

class Entidade {
  static campos = [];
  static somenteLeitura = [];
  static padroes = {};
  static conversores = {};

  constructor(dados = {}) {
    if (new.target === Entidade) throw new Error('Entidade é abstrata.');
    const C = this.constructor;
    this.id = dados.id != null && dados.id !== '' ? Number(dados.id) : null;
    for (const campo of C.campos) {  // cria this.nome, this.email... pela lista da filha
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

  validar() {  // cada filha devolve os erros, lista vazia = tá ok
    return [];
  }

  garantirValida() {
    const erros = this.validar();
    if (erros.length) throw new ErroValidacao(erros);
  }

  ehNova() {
    return this.id == null;
  }

  atualizarCom(dados = {}) {  // no editar só troca o que veio
    const C = this.constructor;
    for (const campo of C.campos) {
      if (dados[campo] !== undefined) this[campo] = C.converter(campo, dados[campo]);
    }
    return this;
  }

  toDB() {  // vira { coluna: valor } pro INSERT/UPDATE
    const linha = {};
    for (const campo of this.constructor.campos) linha[campo] = this[campo] === undefined ? null : this[campo];
    return linha;
  }
}

module.exports = Entidade;
