const CrudController = require('./CrudController');
const { CondominioCreator } = require('../factories/CondominioFactory');

/**
 * Sobrescreve o factory method criarEntidade(): em vez de criar um
 * Condominio "cru", pede ao criador do tipo escolhido (residencial,
 * comercial ou clube) que monte o condomínio já com os módulos padrão.
 */
class CondominioController extends CrudController {
  criarEntidade(dados) {
    return CondominioCreator.paraTipo(dados.tipo || 'residencial').novoCondominio(dados);
  }

  /** Gancho do Template Method: acrescenta os rótulos do tipo na resposta. */
  formatar(resultado) {
    const anexar = (c) => ({ ...c, rotulos: CondominioCreator.paraTipo(c.tipo).rotulos() });
    if (Array.isArray(resultado)) return resultado.map(anexar);
    return resultado && resultado.tipo ? anexar(resultado) : resultado;
  }
}

module.exports = CondominioController;
