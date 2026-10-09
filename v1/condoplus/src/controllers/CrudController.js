const BaseController = require('./BaseController');
const { ErroNaoEncontrado } = require('../erros');

/**
 * Controller genérico de CRUD. Uma linha nas rotas
 *     new CrudController(repo).registrar(router, '/moradores')
 * cria os 5 endpoints REST de um recurso:
 *     GET    /moradores          listar (com filtros por query string)
 *     GET    /moradores/:id      consultar
 *     POST   /moradores          cadastrar
 *     PUT    /moradores/:id      editar
 *     DELETE /moradores/:id      excluir
 * e acao() cria endpoints extras que chamam um método de domínio
 * (ex.: PATCH /moradores/:id/status -> morador.alternarStatus()).
 */
class CrudController extends BaseController {
  constructor(repositorio, nomeRecurso = 'Registro') {
    super();
    this.repo = repositorio;
    this.nomeRecurso = nomeRecurso;
    this.router = null;
    this.caminho = null;
  }

  /**
   * FACTORY METHOD (bônus): como criar a entidade nova a partir do formulário.
   * O padrão é delegar ao repositório; o CondominioController sobrescreve
   * para usar a fábrica de tipos de condomínio.
   */
  criarEntidade(dados) {
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

  /** Endpoint PATCH /caminho/:id/<nome> que executa uma regra de negócio da entidade. */
  acao(nome, regra) {
    this.router.patch(`${this.caminho}/:id/${nome}`, this.manipular(async (req) => {
      const entidade = await this.obter(req.params.id);
      regra(entidade, req.body || {});
      return this.repo.salvar(entidade);
    }));
    return this;
  }
}

module.exports = CrudController;
