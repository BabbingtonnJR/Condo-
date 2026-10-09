const Entidade = require('./Entidade');
const { Conv } = require('./conversores');
const { ErroValidacao } = require('../erros');

/**
 * Convidado de evento — módulo EXCLUSIVO de clubes. Tabela: convidados_evento
 * Atributos: id, condominio_id, evento, convidado, responsavel, status, criado_em
 */
class Convidado extends Entidade {
  static FLUXO = ['convidado', 'confirmado', 'presente'];
  static campos = ['condominio_id', 'evento', 'convidado', 'responsavel', 'status'];
  static somenteLeitura = ['criado_em'];
  static padroes = { status: 'convidado', responsavel: '' };
  static conversores = {
    condominio_id: Conv.idOuNulo, evento: Conv.texto, convidado: Conv.texto,
    responsavel: Conv.texto, status: Conv.texto,
  };

  validar() {
    const erros = [];
    if (!this.condominio_id) erros.push('Convidado precisa de um condomínio.');
    if (!this.evento) erros.push('Informe o evento.');
    if (!this.convidado) erros.push('Informe o nome do convidado.');
    if (!Convidado.FLUXO.includes(this.status)) erros.push('Status inválido.');
    return erros;
  }

  /** Avança no fluxo convidado → confirmado → presente (ou vai direto ao status informado). */
  avancarStatus(novo) {
    const destino = novo || Convidado.FLUXO[Convidado.FLUXO.indexOf(this.status) + 1];
    if (!Convidado.FLUXO.includes(destino)) throw new ErroValidacao('Status inválido para convidado.');
    this.status = destino;
    return this;
  }
}

module.exports = Convidado;
