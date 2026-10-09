const Entidade = require('./Entidade');
const { Conv, ehDataISO } = require('./conversores');
const { ErroValidacao } = require('../erros');

/**
 * Reserva de área comum. Tabela: reservas
 * Atributos: id, area, data_reserva, hora, morador, status, condominio_id
 */
class Reserva extends Entidade {
  static STATUS = ['pendente', 'confirmada', 'cancelada'];
  static campos = ['area', 'data_reserva', 'hora', 'morador', 'status', 'condominio_id'];
  static padroes = { status: 'pendente', hora: '' };
  static conversores = {
    area: Conv.texto, data_reserva: Conv.texto, hora: Conv.texto,
    morador: Conv.texto, status: Conv.texto, condominio_id: Conv.idOuNulo,
  };

  validar() {
    const erros = [];
    if (!this.area) erros.push('Escolha a área.');
    if (!ehDataISO(this.data_reserva)) erros.push('Escolha uma data.');
    if (!this.morador) erros.push('Informe quem está reservando.');
    if (!Reserva.STATUS.includes(this.status)) erros.push('Status inválido.');
    return erros;
  }

  estaAtiva() { return this.status !== 'cancelada'; }

  confirmar() {
    if (this.status === 'cancelada') throw new ErroValidacao('Não é possível confirmar uma reserva cancelada.');
    this.status = 'confirmada';
    return this;
  }

  cancelar() {
    this.status = 'cancelada';
    return this;
  }
}

module.exports = Reserva;
