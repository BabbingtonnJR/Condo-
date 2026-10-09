const R = require('./Repositorios');

/**
 * ============================================================
 * PADRÃO FACTORY METHOD — exemplo 2: RepositoryFactory
 * ============================================================
 * Variante "parametrizada" do Factory Method (descrita no livro do GoF):
 * um único método de fábrica — criar(nome) — decide QUAL classe
 * concreta instanciar a partir de um parâmetro.
 *
 * Quem usa (as rotas, o AuthController) não conhece as classes
 * concretas (MoradorRepository, VagaRepository...): pede pelo nome do
 * recurso e recebe um objeto que segue a interface do BaseRepository.
 * Para adicionar uma tabela nova basta registrar mais uma linha aqui.
 *
 * Como bônus, a fábrica guarda cada repositório criado (cache) para
 * não instanciar o mesmo repositório a cada requisição.
 */
const REGISTRO = {
  usuarios: R.UsuarioRepository,
  condominios: R.CondominioRepository,
  moradores: R.MoradorRepository,
  comunicados: R.ComunicadoRepository,
  solicitacoes: R.SolicitacaoRepository,
  documentos: R.DocumentoRepository,
  financeiro: R.LancamentoRepository,
  reservas: R.ReservaRepository,
  encomendas: R.EncomendaRepository,
  visitantes: R.VisitanteRepository,
  chamados: R.ChamadoRepository,
  vagas: R.VagaRepository,
  convidados: R.ConvidadoRepository,
};

class RepositoryFactory {
  static #cache = new Map();

  /** O método de fábrica. */
  static criar(nome) {
    if (!RepositoryFactory.#cache.has(nome)) {
      const Classe = REGISTRO[nome];
      if (!Classe) throw new Error(`Repositório desconhecido: "${nome}".`);
      RepositoryFactory.#cache.set(nome, new Classe());
    }
    return RepositoryFactory.#cache.get(nome);
  }

  static disponiveis() {
    return Object.keys(REGISTRO);
  }
}

module.exports = RepositoryFactory;
