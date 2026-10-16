// Marcel — chamado do suporte técnico
const { Entidade } = require('condoplus-core');
const { Conv } = require('condoplus-core');
const { ErroValidacao } = require('condoplus-core');

class Chamado extends Entidade {
  static STATUS = ['aberto', 'progresso', 'concluido'];
  static campos = ['usuario', 'assunto', 'status', 'escalado', 'condominio_id']; // condominio_id veio na v4 (SE06)
  static somenteLeitura = ['aberto_em'];
  static padroes = { status: 'aberto', escalado: false };
  static conversores = {
    usuario: Conv.texto, assunto: Conv.texto, status: Conv.texto, escalado: Conv.booleano, condominio_id: Conv.idOuNulo,
  };

  validar() {
    const erros = [];
    if (!this.usuario) erros.push('Informe quem abriu o chamado.');
    if (!this.assunto) erros.push('Informe o assunto.');
    if (!Chamado.STATUS.includes(this.status)) erros.push('Status inválido.');
    return erros;
  }

  escalar() {
    if (this.status === 'concluido') throw new ErroValidacao('Chamado concluído não pode ser escalado.');
    this.escalado = true;
    return this;
  }

  resolver() {
    this.status = 'concluido';
    return this;
  }
}

module.exports = Chamado;
