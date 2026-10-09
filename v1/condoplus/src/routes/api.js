const express = require('express');
const RepositoryFactory = require('../repositories/RepositoryFactory');
const CrudController = require('../controllers/CrudController');
const CondominioController = require('../controllers/CondominioController');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

/** Atalho: cria o CRUD completo de um recurso em uma linha. */
function crud(recurso, nomeLegivel, Controller = CrudController) {
  return new Controller(RepositoryFactory.criar(recurso), nomeLegivel).registrar(router, `/${recurso}`);
}

/* Autenticação (RF02, RF03) */
new AuthController().registrar(router);

/* CRUDs — cada linha gera GET, GET/:id, POST, PUT/:id e DELETE/:id */
crud('moradores', 'Morador')            .acao('status', (m) => m.alternarStatus());          // RF04
crud('comunicados', 'Comunicado');                                                          // RF06, RF07
crud('solicitacoes', 'Solicitação');                                                        // RF09–RF11
crud('documentos', 'Documento');                                                            // RF15, RF16
crud('financeiro', 'Lançamento')         .acao('pagar', (l) => l.marcarComoPago());          // RF13, RF14
crud('reservas', 'Reserva')              .acao('confirmar', (r) => r.confirmar())            // RF18
                                         .acao('cancelar', (r) => r.cancelar());
crud('encomendas', 'Encomenda')          .acao('retirar', (e) => e.registrarRetirada());     // RF26, RF27
crud('visitantes', 'Visitante');                                                            // RF28
crud('chamados', 'Chamado')              .acao('resolver', (c) => c.resolver())              // RF24, RF25
                                         .acao('escalar', (c) => c.escalar());
crud('usuarios', 'Usuário');                                                                // RF01
crud('condominios', 'Condomínio', CondominioController)                                     // RF05
  .acao('modulos', (c, body) => c.alterarModulo(body.modulo, body.ativo));

/* Parte III — módulos exclusivos */
crud('vagas', 'Vaga')                                                                       // só comercial
  .acao('reservar', (v, body) => (body.reservado_por ? v.reservar(body.reservado_por) : v.liberar()));
crud('convidados', 'Convidado')                                                             // só clube
  .acao('status', (c, body) => c.avancarStatus(body.status));

module.exports = router;
