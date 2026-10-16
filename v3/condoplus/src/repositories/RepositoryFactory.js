// Gabriel — Factory Method #2. pede pelo nome: RepositoryFactory.criar('moradores') e pronto
// tabela nova = mais uma linha no REGISTRO
const R = require('./Repositorios');

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

  static criar(nome) {  // a fábrica em si
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
