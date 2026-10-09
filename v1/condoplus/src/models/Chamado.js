const Entidade = require('./Entidade');
const { Conv } = require('./conversores');
const { ErroValidacao } = require('../erros');

/**
 * Chamado de suporte técnico. Tabela: chamados
 * Atributos: id, usuario, assunto, status, escalado, aberto_em
 */
class Chamado extends Entidade {
  static STATUS = ['aberto', 'progresso', 'concluido'];
  static campos = ['usuario', 'assunto', 'status', 'escalado'];
  static somenteLeitura = ['aberto_em'];
  static padroes = { status: 'aberto', escalado: false };
  static conversores = {
    usuario: Conv.texto, assunto: Conv.texto, status: Conv.texto, escalado: Conv.booleano,
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
