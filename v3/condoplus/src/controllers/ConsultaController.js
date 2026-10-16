// Babbingtonn — rota das consultas: GET /api/consultas/:nome?entrada
// mesmo esquema do RelatorioController: manipular() do André + fábrica do Gabriel
const { BaseController } = require('condoplus-core');
const ConsultaFactory = require('../consultas/ConsultaFactory');

class ConsultaController extends BaseController {
  registrar(router) {
    router.get('/consultas', this.manipular(() => ConsultaFactory.disponiveis()));
    router.get('/consultas/:nome', this.manipular((req) => ConsultaFactory.criar(req.params.nome).executar(req.query)));
    return this;
  }
}

module.exports = ConsultaController;
