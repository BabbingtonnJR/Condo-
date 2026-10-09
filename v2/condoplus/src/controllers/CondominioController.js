// Gabriel — igual ao CrudController do André, só que cria o condomínio pela minha fábrica
const CrudController = require('./CrudController');
const { CondominioCreator } = require('../factories/CondominioFactory');

class CondominioController extends CrudController {
  criarEntidade(dados) {
    return CondominioCreator.paraTipo(dados.tipo || 'residencial').novoCondominio(dados);
  }

  formatar(resultado) {
    const anexar = (c) => ({ ...c, rotulos: CondominioCreator.paraTipo(c.tipo).rotulos() });
    if (Array.isArray(resultado)) return resultado.map(anexar);
    return resultado && resultado.tipo ? anexar(resultado) : resultado;
  }
}

module.exports = CondominioController;
