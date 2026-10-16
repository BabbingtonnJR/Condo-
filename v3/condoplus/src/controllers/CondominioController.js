// Gabriel — igual ao CrudController do André, só que cria o condomínio pela minha fábrica
const { CrudController } = require('condoplus-core');
const { CondominioCreator } = require('../factories/CondominioFactory');
const { log } = require('condoplus-core');

class CondominioController extends CrudController {
  criarEntidade(dados) {
    const criador = CondominioCreator.paraTipo(dados.tipo || 'residencial');
    log.registrar('FABRICA', `CondominioCreator.paraTipo('${dados.tipo || 'residencial'}') -> ${criador.constructor.name}  (Factory Method)`);
    return criador.novoCondominio(dados);
  }

  formatar(resultado) {
    const anexar = (c) => ({ ...c, rotulos: CondominioCreator.paraTipo(c.tipo).rotulos() });
    if (Array.isArray(resultado)) return resultado.map(anexar);
    return resultado && resultado.tipo ? anexar(resultado) : resultado;
  }
}

module.exports = CondominioController;
