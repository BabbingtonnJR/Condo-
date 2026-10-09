const BaseController = require('./BaseController');
const RepositoryFactory = require('../repositories/RepositoryFactory');
const { CondominioCreator } = require('../factories/CondominioFactory');
const { ErroAutenticacao, ErroAplicacao } = require('../erros');

/**
 * Login e sessão. Monta o "pacote" que o front-end guarda: dados do
 * usuário + tipo, módulos e rótulos do condomínio dele (variabilidade).
 */
class AuthController extends BaseController {
  constructor() {
    super();
    this.usuarios = RepositoryFactory.criar('usuarios');
    this.condominios = RepositoryFactory.criar('condominios');
  }

  async montarSessao(usuario) {
    const c = usuario.condominio_id ? await this.condominios.buscarPorId(usuario.condominio_id) : null;
    return {
      ...usuario.toPublico(),
      condominio_nome: c ? c.nome : null,
      condominio_tipo: c ? c.tipo : null,
      condominio_modulos: c ? c.modulos : {},
      condominio_rotulos: c ? CondominioCreator.paraTipo(c.tipo).rotulos() : null,
    };
  }

  registrar(router) {
    router.post('/login', this.manipular(async (req) => {
      const { email, senha } = req.body || {};
      const usuario = await this.usuarios.buscarPorEmail(email);
      if (!usuario || !usuario.conferirSenha(senha)) throw new ErroAutenticacao('E-mail ou senha inválidos.');
      if (!usuario.ehAtivo()) throw new ErroAplicacao('Usuário desativado.', 403);
      return { usuario: await this.montarSessao(usuario) };
    }));

    // Recarrega a sessão a cada tela: se a administradora ligar/desligar um
    // módulo, o menu do síndico muda na hora, sem precisar sair e entrar.
    router.get('/sessao/:id', this.manipular(async (req) => {
      const usuario = await this.usuarios.buscarPorId(req.params.id);
      if (!usuario || !usuario.ehAtivo()) throw new ErroAutenticacao('Sessão inválida.');
      return { usuario: await this.montarSessao(usuario) };
    }));
    return this;
  }
}

module.exports = AuthController;
