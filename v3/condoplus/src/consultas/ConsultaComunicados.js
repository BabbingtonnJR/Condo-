// Marcel — CE06: buscar comunicados por palavra e período
// entrada: palavra, de, até | saída: título, texto, publicado em | ALI: Comunicado
const BaseConsulta = require('./BaseConsulta');

class ConsultaComunicados extends BaseConsulta {
  static codigo = 'CE06';
  static titulo = 'Buscar comunicados';
  static entradas = [{ nome: 'palavra', rotulo: 'Uma palavra', obrigatorio: true }, { nome: 'de', rotulo: 'De' }, { nome: 'ate', rotulo: 'Até' }];
  static fixos = ['condominio_id'];

  montarSQL(e) {
    const [where, valores] = BaseConsulta.onde([
      ['condominio_id = ?', e.condominio_id],
      ['(titulo LIKE ? OR corpo LIKE ?)', [`%${e.palavra}%`, `%${e.palavra}%`]],
      ['publicado_em >= ?', e.de], ['publicado_em < ? + INTERVAL 1 DAY', e.ate]]);
    return ["SELECT titulo, corpo, DATE_FORMAT(publicado_em, '%Y-%m-%d %H:%i') AS publicado_em FROM comunicados" + where + ' ORDER BY publicado_em DESC', valores];
  }
}

module.exports = ConsultaComunicados;
