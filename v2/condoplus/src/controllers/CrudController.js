// André — CRUD genérico. crud('x') nas rotas já cria GET, GET/:id, POST, PUT e DELETE
// e .acao('nome', regra) vira um PATCH /x/:id/nome
const BaseController = require('./BaseController');
const { ErroNaoEncontrado } = require('../erros');

class CrudController extends BaseController {
  constructor(repositorio, nomeRecurso = 'Registro') {
    super();
    this.repo = repositorio;
    this.nomeRecurso = nomeRecurso;
    this.router = null;
    this.caminho = null;
  }

  criarEntidade(dados) {  // o Gabriel sobrescreve isso no CondominioController pra usar a fábrica dele
    return this.repo.novaEntidade(dados);
  }

  async obter(id) {
    const entidade = await this.repo.buscarPorId(id);
    if (!entidade) throw new ErroNaoEncontrado(this.nomeRecurso);
    return entidade;
  }

  registrar(router, caminho) {
    this.router = router;
    this.caminho = caminho;

    router.get(caminho, this.manipular((req) => this.repo.listar(req.query)));
    router.get(`${caminho}/:id`, this.manipular((req) => this.obter(req.params.id)));
    router.post(caminho, this.manipular((req) => this.repo.salvar(this.criarEntidade(req.body || {})), 201));
    router.put(`${caminho}/:id`, this.manipular(async (req) => {
      const entidade = await this.obter(req.params.id);
      return this.repo.salvar(entidade.atualizarCom(req.body || {}));
    }));
    router.delete(`${caminho}/:id`, this.manipular(async (req) => {
      await this.obter(req.params.id);
      await this.repo.excluir(req.params.id);
      return { ok: true };
    }));
    return this;
  }

  acao(nome, regra) {  // PATCH /x/:id/nome: roda a regra da classe e salva
    this.router.patch(`${this.caminho}/:id/${nome}`, this.manipular(async (req) => {
      const entidade = await this.obter(req.params.id);
      regra(entidade, req.body || {});
      return this.repo.salvar(entidade);
    }));
    return this;
  }
}

module.exports = CrudController;
