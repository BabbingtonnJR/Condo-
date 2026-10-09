const Entidade = require('./Entidade');
const { Conv, ehDataISO } = require('./conversores');
const { ErroValidacao } = require('../erros');

/**
 * Vaga do estacionamento rotativo — módulo EXCLUSIVO de condomínios comerciais.
 * Tabela: vagas_estacionamento
 * Atributos: id, condominio_id, codigo, data_reserva, reservado_por, criado_em
 */
class Vaga extends Entidade {
  static campos = ['condominio_id', 'codigo', 'data_reserva', 'reservado_por'];
  static somenteLeitura = ['criado_em'];
  static conversores = {
    condominio_id: Conv.idOuNulo, codigo: (v) => Conv.texto(v).toUpperCase(),
    data_reserva: Conv.texto, reservado_por: Conv.textoOuNulo,
  };

  validar() {
    const erros = [];
    if (!this.condominio_id) erros.push('Vaga precisa de um condomínio.');
    if (!this.codigo) erros.push('Informe o código da vaga.');
    if (!ehDataISO(this.data_reserva)) erros.push('Informe a data.');
    return erros;
  }

  estaLivre() { return !this.reservado_por; }

  reservar(nome) {
    if (!this.estaLivre()) throw new ErroValidacao(`A vaga ${this.codigo} já está ocupada.`);
    if (!Conv.textoOuNulo(nome)) throw new ErroValidacao('Informe quem vai usar a vaga.');
    this.reservado_por = Conv.texto(nome);
    return this;
  }

  liberar() {
    this.reservado_por = null;
    return this;
  }
}

module.exports = Vaga;
