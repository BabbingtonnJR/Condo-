// Babbingtonn — CE02: consultar solicitações por categoria e status
// entrada: categoria, status, unidade | saída: título, unidade, categoria, status, prestador, aberta em
// ALI: Solicitação, Unidade, Usuário (prestador)
const BaseConsulta = require('./BaseConsulta');

class ConsultaSolicitacoes extends BaseConsulta {
  static codigo = 'CE02';
  static titulo = 'Consultar solicitações';
  static entradas = [{ nome: 'categoria', rotulo: 'A categoria', obrigatorio: true }, { nome: 'status', rotulo: 'Status' }, { nome: 'unidade', rotulo: 'Unidade' }];
  static fixos = ['condominio_id'];

  montarSQL(e) {
    const [where, valores] = BaseConsulta.onde([
      ['condominio_id = ?', e.condominio_id], ['categoria = ?', e.categoria], ['status = ?', e.status], ['unidade = ?', e.unidade]]);
    return ["SELECT titulo, unidade, categoria, status, prestador_nome, DATE_FORMAT(criado_em, '%Y-%m-%d %H:%i') AS criado_em FROM solicitacoes" +
      where + ' ORDER BY criado_em DESC', valores];
  }
}

module.exports = ConsultaSolicitacoes;
