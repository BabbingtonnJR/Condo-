// Gabriel — CE07: consultar condomínios por tipo e nome
// entrada: tipo, nome (pedaço) | saída: nome, endereço, tipo, síndico, módulos | ALI: Condomínio, Usuário (síndico)
// não mostra nº de unidades: no modelo de dados isso seria contar as Unidades = cálculo, e CE não calcula
// módulos é o JSON gravado, a tela só lista o que tá ligado (não calcula nada)
const BaseConsulta = require('./BaseConsulta');

class ConsultaCondominios extends BaseConsulta {
  static codigo = 'CE07';
  static titulo = 'Consultar condomínios';
  static entradas = [{ nome: 'tipo', rotulo: 'O tipo', obrigatorio: true }, { nome: 'nome', rotulo: 'Nome' }];

  montarSQL(e) {
    const [where, valores] = BaseConsulta.onde([
      ['tipo = ?', e.tipo], ['nome LIKE ?', e.nome === undefined ? undefined : `%${e.nome}%`]]);
    return ['SELECT nome, endereco, tipo, sindico_nome, modulos FROM condominios' + where + ' ORDER BY nome', valores];
  }

  montar(linhas, e) {
    linhas.forEach((l) => { l.modulos = typeof l.modulos === 'string' ? JSON.parse(l.modulos) : (l.modulos || {}); });
    return super.montar(linhas, e);
  }
}

module.exports = ConsultaCondominios;
