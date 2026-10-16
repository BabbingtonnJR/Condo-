// Babbingtonn — rota dos relatórios: GET /api/relatorios/:nome?filtros
// passa pelo manipular() do André (Template Method) e pede o relatório pra fábrica do Gabriel
const { BaseController } = require('condoplus-core');
const RelatorioFactory = require('../relatorios/RelatorioFactory');

class RelatorioController extends BaseController {
  registrar(router) {
    router.get('/relatorios', this.manipular(() => RelatorioFactory.disponiveis()));
    router.get('/relatorios/:nome', this.manipular((req) => RelatorioFactory.criar(req.params.nome).gerar(req.query)));
    return this;
  }
}

module.exports = RelatorioController;
