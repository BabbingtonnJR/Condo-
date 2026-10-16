// André — CE03: consultar boletos de uma unidade
// entrada: unidade, status | saída: unidade, referência, valor, vencimento, status | ALI: Lançamento Financeiro, Unidade
// mostra o status gravado (pendente/pago). "vencido" seria calculado, aí já é coisa da SE01
const BaseConsulta = require('./BaseConsulta');

class ConsultaBoletos extends BaseConsulta {
  static codigo = 'CE03';
  static titulo = 'Consultar boletos da unidade';
  static entradas = [{ nome: 'unidade', rotulo: 'A unidade', obrigatorio: true }, { nome: 'status', rotulo: 'Status' }];
  static fixos = ['condominio_id'];

  montarSQL(e) {
    const [where, valores] = BaseConsulta.onde([
      ['condominio_id = ?', e.condominio_id], ['unidade = ?', e.unidade], ['status = ?', e.status]]);
    return ["SELECT unidade, referencia, valor, DATE_FORMAT(vencimento, '%Y-%m-%d') AS vencimento, status FROM financeiro" + where + ' ORDER BY vencimento DESC', valores];
  }
}

module.exports = ConsultaBoletos;
