// André — boleto de cada unidade (tabela financeiro)
const { Entidade } = require('condoplus-core');
const { Conv, hojeISO, ehDataISO } = require('condoplus-core');
const { ErroValidacao } = require('condoplus-core');

class Lancamento extends Entidade {
  static STATUS = ['pendente', 'pago'];
  static campos = ['unidade', 'referencia', 'valor', 'vencimento', 'status', 'condominio_id'];
  static padroes = { status: 'pendente' };
  static conversores = {
    unidade: Conv.texto, referencia: Conv.texto, valor: Conv.decimal,
    vencimento: Conv.texto, status: Conv.texto, condominio_id: Conv.idOuNulo,
  };

  validar() {
    const erros = [];
    if (!this.unidade) erros.push('Informe a unidade.');
    if (!this.referencia) erros.push('Informe a referência (ex.: Setembro/2026).');
    if (!(this.valor > 0)) erros.push('O valor precisa ser maior que zero.');
    if (!ehDataISO(this.vencimento)) erros.push('Informe a data de vencimento.');
    if (!Lancamento.STATUS.includes(this.status)) erros.push('Status inválido.');
    return erros;
  }

  estaPago() { return this.status === 'pago'; }

  estaVencido(hoje = hojeISO()) {
    return !this.estaPago() && this.vencimento < hoje;
  }

  marcarComoPago() {  // botão "Marcar como pago" (pagar duas vezes não dá)
    if (this.estaPago()) throw new ErroValidacao('Este lançamento já está pago.');
    this.status = 'pago';
    return this;
  }

  toJSON() {  // manda "vencido" junto pro front pintar de vermelho
    return { ...this, valor: Number(this.valor), vencido: this.estaVencido() };
  }
}

module.exports = Lancamento;
