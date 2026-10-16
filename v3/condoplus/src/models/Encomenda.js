// Marcel — encomenda que chegou na portaria
const { Entidade } = require('condoplus-core');
const { Conv } = require('condoplus-core');
const { ErroValidacao } = require('condoplus-core');

class Encomenda extends Entidade {
  static campos = ['morador', 'unidade', 'descricao', 'retirado', 'condominio_id'];
  static somenteLeitura = ['recebido_em'];
  static padroes = { retirado: false, descricao: '' };
  static conversores = {
    morador: Conv.texto, unidade: Conv.texto, descricao: Conv.texto,
    retirado: Conv.booleano, condominio_id: Conv.idOuNulo,
  };

  validar() {
    const erros = [];
    if (!this.morador) erros.push('Informe o morador.');
    if (!this.unidade) erros.push('Informe a unidade.');
    return erros;
  }

  estaPendente() { return !this.retirado; }

  registrarRetirada() {  // botão "Registrar retirada", só uma vez né
    if (this.retirado) throw new ErroValidacao('Esta encomenda já foi retirada.');
    this.retirado = true;
    return this;
  }
}

module.exports = Encomenda;
