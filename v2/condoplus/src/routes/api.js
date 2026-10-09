// André — todas as rotas. cada crud() é uma linha e já cria o CRUD inteiro
// o nome no fim da linha é de quem fez cada um
const express = require('express');
const RepositoryFactory = require('../repositories/RepositoryFactory');
const CrudController = require('../controllers/CrudController');
const CondominioController = require('../controllers/CondominioController');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

function crud(recurso, nomeLegivel, Controller = CrudController) {
  return new Controller(RepositoryFactory.criar(recurso), nomeLegivel).registrar(router, `/${recurso}`);
}

new AuthController().registrar(router); // Gabriel

crud('moradores', 'Morador')      .acao('status', (m) => m.alternarStatus()); // Babbingtonn
crud('comunicados', 'Comunicado'); // Babbingtonn
crud('solicitacoes', 'Solicitação'); // Babbingtonn
crud('documentos', 'Documento'); // André
crud('financeiro', 'Lançamento')  .acao('pagar', (l) => l.marcarComoPago()); // André
crud('reservas', 'Reserva')       .acao('confirmar', (r) => r.confirmar()) // André
                                  .acao('cancelar', (r) => r.cancelar());
crud('encomendas', 'Encomenda')   .acao('retirar', (e) => e.registrarRetirada()); // Marcel
crud('visitantes', 'Visitante'); // Marcel
crud('chamados', 'Chamado')       .acao('resolver', (c) => c.resolver()) // Marcel
                                  .acao('escalar', (c) => c.escalar());
crud('usuarios', 'Usuário'); // Gabriel
crud('condominios', 'Condomínio', CondominioController) // Gabriel
  .acao('modulos', (c, body) => c.alterarModulo(body.modulo, body.ativo));
crud('vagas', 'Vaga') // Gabriel (só comercial)
  .acao('reservar', (v, body) => (body.reservado_por ? v.reservar(body.reservado_por) : v.liberar()));
crud('convidados', 'Convidado') // Gabriel (só clube)
  .acao('status', (c, body) => c.avancarStatus(body.status));

module.exports = router;
