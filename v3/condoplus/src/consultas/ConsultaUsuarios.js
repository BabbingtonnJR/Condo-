// Gabriel — CE08: consultar usuários por perfil e condomínio
// entrada: perfil, condomínio, status | saída: nome, e-mail, perfil, condomínio, unidade, status
// ALI: Usuário, Condomínio, Unidade
const BaseConsulta = require('./BaseConsulta');

class ConsultaUsuarios extends BaseConsulta {
  static codigo = 'CE08';
  static titulo = 'Consultar usuários';
  static entradas = [{ nome: 'perfil', rotulo: 'O perfil', obrigatorio: true }, { nome: 'condominio_id', rotulo: 'Condomínio' }, { nome: 'status', rotulo: 'Status' }];

  montarSQL(e) {
    const [where, valores] = BaseConsulta.onde([
      ['u.perfil = ?', e.perfil], ['u.condominio_id = ?', e.condominio_id], ['u.status = ?', e.status]]);
    return ['SELECT u.nome, u.email, u.perfil, c.nome AS condominio, u.unidade, u.status FROM usuarios u ' +
      'LEFT JOIN condominios c ON c.id = u.condominio_id' + where + ' ORDER BY u.nome', valores]; // nunca devolve a senha
  }
}

module.exports = ConsultaUsuarios;
