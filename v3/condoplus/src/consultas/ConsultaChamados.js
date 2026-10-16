// Marcel — CE05: consultar chamados por status
// entrada: status, escalado, assunto (pedaço) | saída: assunto, usuário, status, escalado, aberto em | ALI: Chamado, Usuário (quem abriu)
const BaseConsulta = require('./BaseConsulta');

class ConsultaChamados extends BaseConsulta {
  static codigo = 'CE05';
  static titulo = 'Consultar chamados';
  static entradas = [{ nome: 'status', rotulo: 'O status', obrigatorio: true }, { nome: 'escalado', rotulo: 'Escalado' }, { nome: 'assunto', rotulo: 'Assunto' }];

  montarSQL(e) {
    const [where, valores] = BaseConsulta.onde([
      ['status = ?', e.status],
      ['escalado = ?', e.escalado === undefined ? undefined : (e.escalado === 'true' ? 1 : 0)],
      ['assunto LIKE ?', e.assunto === undefined ? undefined : `%${e.assunto}%`]]);
    return ["SELECT assunto, usuario, status, escalado, DATE_FORMAT(aberto_em, '%Y-%m-%d %H:%i') AS aberto_em FROM chamados" + where + ' ORDER BY aberto_em DESC', valores];
  }
}

module.exports = ConsultaChamados;
