// Babbingtonn — SE03: indicadores de solicitações
// FTR: Solicitação, Usuário (prestador) | dado derivado: quantidades, idade média/máxima, total, % resolvidas, por prestador
const BaseRelatorio = require('./BaseRelatorio');
const Solicitacao = require('../models/Solicitacao');

class RelatorioSolicitacoes extends BaseRelatorio {
  static codigo = 'SE03';
  static titulo = 'Indicadores de solicitações';

  validarFiltros(f) { return this.exigirCondominio(f); }

  async buscarDados(f) {
    const condominio = await this.buscarCondominio(f.condominio_id);
    const solicitacoes = await this.db.query(
      "SELECT categoria, status, prestador_nome, DATE_FORMAT(criado_em, '%Y-%m-%d %H:%i:%s') AS criado_em FROM solicitacoes WHERE condominio_id = ?",
      [f.condominio_id]);
    const prestadores = await this.db.query("SELECT nome FROM usuarios WHERE perfil = 'prestador' AND status = 'ativo' ORDER BY nome");
    return { condominio, solicitacoes, prestadores };
  }

  calcular({ condominio, solicitacoes, prestadores }, f) {
    const emAberto = (s) => s.status !== 'concluido';
    const idade = (s) => BaseRelatorio.dias(s.criado_em, f.agora.texto); // não tem data de conclusão, então é hoje - abertura
    const porCategoria = Solicitacao.CATEGORIAS.map((cat) => {
      const doGrupo = solicitacoes.filter((s) => s.categoria === cat);
      const idades = doGrupo.filter(emAberto).map(idade);
      return {
        categoria: cat,
        aberto: doGrupo.filter((s) => s.status === 'aberto').length,
        progresso: doGrupo.filter((s) => s.status === 'progresso').length,
        concluido: doGrupo.filter((s) => s.status === 'concluido').length,
        idadeMediaDias: idades.length ? Math.round((idades.reduce((a, b) => a + b, 0) / idades.length) * 10) / 10 : 0,
        idadeMaximaDias: idades.length ? Math.max(...idades) : 0,
      };
    });
    const resolvidas = solicitacoes.filter((s) => s.status === 'concluido').length;
    const porPrestador = prestadores.map((p) => {
      const dele = solicitacoes.filter((s) => s.prestador_nome === p.nome);
      return { prestador: p.nome, total: dele.length, emAberto: dele.filter(emAberto).length, concluidas: dele.length - dele.filter(emAberto).length };
    });
    return {
      condominio: condominio.nome,
      porCategoria,
      porPrestador,
      resumo: { total: solicitacoes.length, resolvidas, percentualResolvidas: BaseRelatorio.pct(resolvidas, solicitacoes.length) },
    };
  }
}

module.exports = RelatorioSolicitacoes;
