// Babbingtonn — CE01: consultar morador pela unidade
// entrada: unidade, status | saída: nome, unidade, e-mail, status, cadastrado em | ALI: Usuário (morador), Unidade
const BaseConsulta = require('./BaseConsulta');

class ConsultaMoradorUnidade extends BaseConsulta {
  static codigo = 'CE01';
  static titulo = 'Consultar morador por unidade';
  static entradas = [{ nome: 'unidade', rotulo: 'A unidade', obrigatorio: true }, { nome: 'status', rotulo: 'Status' }];
  static fixos = ['condominio_id'];

  montarSQL(e) {
    const [where, valores] = BaseConsulta.onde([
      ['condominio_id = ?', e.condominio_id], ['unidade = ?', e.unidade], ['status = ?', e.status]]);
    return ["SELECT nome, unidade, email, status, DATE_FORMAT(criado_em, '%Y-%m-%d') AS criado_em FROM moradores" + where + ' ORDER BY nome', valores];
  }
}

module.exports = ConsultaMoradorUnidade;
