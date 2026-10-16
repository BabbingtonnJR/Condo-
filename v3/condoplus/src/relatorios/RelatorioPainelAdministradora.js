// Gabriel — SE06: painel consolidado da administradora
// FTR: Condomínio, Unidade, Usuário, Chamado, Solicitação, Lançamento Financeiro | tudo calculado na hora
const BaseRelatorio = require('./BaseRelatorio');

class RelatorioPainelAdministradora extends BaseRelatorio {
  static codigo = 'SE06';
  static titulo = 'Painel consolidado da administradora';

  async buscarDados(f) {
    const q = (sql, p = []) => this.db.query(sql, p);
    const [condominios, moradores, solicitacoes, chamados, vencidos, usuarios, cobradas] = await Promise.all([
      q('SELECT id, nome, tipo, unidades FROM condominios ORDER BY nome'),
      q("SELECT condominio_id, COUNT(*) n FROM moradores WHERE status = 'ativo' GROUP BY condominio_id"),
      q("SELECT condominio_id, COUNT(*) n FROM solicitacoes WHERE status <> 'concluido' GROUP BY condominio_id"),
      q("SELECT condominio_id, COUNT(*) n, SUM(escalado) escalados FROM chamados WHERE status <> 'concluido' GROUP BY condominio_id"),
      q("SELECT condominio_id, COUNT(DISTINCT unidade) unidades, SUM(valor) valor FROM financeiro WHERE status = 'pendente' AND vencimento < ? GROUP BY condominio_id", [f.agora.dia]),
      q("SELECT COUNT(*) n FROM usuarios WHERE status = 'ativo'"),
      q('SELECT condominio_id, COUNT(DISTINCT unidade) n FROM financeiro GROUP BY condominio_id'), // clube não tem "unidades", tem títulos
    ]);
    return { condominios, moradores, solicitacoes, chamados, vencidos, cobradas, totalUsuarios: Number(usuarios[0].n) };
  }

  calcular(d) {
    const de = (lista, id, campo = 'n') => Number((lista.find((x) => x.condominio_id === id) || {})[campo] || 0);
    const porCondominio = d.condominios.map((c) => {
      const unidadesInad = de(d.vencidos, c.id, 'unidades');
      const base = c.unidades || de(d.cobradas, c.id); // sem nº de unidades (clube) usa quem recebe cobrança
      return {
        condominio: c.nome, tipo: c.tipo, unidades: c.unidades,
        moradores: de(d.moradores, c.id),
        solicitacoesAbertas: de(d.solicitacoes, c.id),
        chamadosAbertos: de(d.chamados, c.id),
        chamadosEscalados: de(d.chamados, c.id, 'escalados'),
        taxaInadimplencia: BaseRelatorio.pct(unidadesInad, base),
        totalEmAberto: BaseRelatorio.dinheiro(de(d.vencidos, c.id, 'valor')),
        _inad: unidadesInad, _base: base, // só pra média ponderada, sai antes de responder
      };
    });
    const somaInad = porCondominio.reduce((a, c) => a + c._inad, 0);
    const somaBase = porCondominio.reduce((a, c) => a + c._base, 0);
    porCondominio.forEach((c) => { delete c._inad; delete c._base; });
    return {
      porCondominio,
      carteira: {
        totalCondominios: porCondominio.length,
        totalUnidades: porCondominio.reduce((a, c) => a + c.unidades, 0),
        totalUsuarios: d.totalUsuarios,
        inadimplenciaMedia: BaseRelatorio.pct(somaInad, somaBase), // ponderada: um clube com 2 títulos não puxa a média sozinho
        totalEmAberto: BaseRelatorio.dinheiro(porCondominio.reduce((a, c) => a + c.totalEmAberto, 0)),
      },
    };
  }
}

module.exports = RelatorioPainelAdministradora;
