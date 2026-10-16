// André — CE04: consultar reservas de um dia
// entrada: data, área | saída: área, data, horário, morador, status | ALI: Reserva, Usuário (quem reservou)
const BaseConsulta = require('./BaseConsulta');

class ConsultaReservas extends BaseConsulta {
  static codigo = 'CE04';
  static titulo = 'Consultar reservas do dia';
  static entradas = [{ nome: 'data_reserva', rotulo: 'A data', obrigatorio: true }, { nome: 'area', rotulo: 'Área' }];
  static fixos = ['condominio_id'];

  montarSQL(e) {
    const [where, valores] = BaseConsulta.onde([
      ['condominio_id = ?', e.condominio_id], ['data_reserva = ?', e.data_reserva], ['area = ?', e.area]]);
    return ["SELECT area, DATE_FORMAT(data_reserva, '%Y-%m-%d') AS data_reserva, hora, morador, status FROM reservas" + where + ' ORDER BY hora', valores];
  }
}

module.exports = ConsultaReservas;
