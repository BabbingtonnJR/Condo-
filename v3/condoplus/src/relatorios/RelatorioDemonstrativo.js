// André — SE02: demonstrativo financeiro mensal (síndico e morador)
// FTR: Lançamento Financeiro, Unidade, Condomínio | dado derivado: totais, taxa de arrecadação, adimplentes/inadimplentes, média
const BaseRelatorio = require('./BaseRelatorio');

class RelatorioDemonstrativo extends BaseRelatorio {
  static codigo = 'SE02';
  static titulo = 'Demonstrativo financeiro mensal';

  validarFiltros(f) { return this.exigirCondominio(f); }

  async buscarDados(f) {
    const condominio = await this.buscarCondominio(f.condominio_id);
    const lancamentos = await this.db.query(
      'SELECT unidade, referencia, valor, vencimento, status FROM financeiro WHERE condominio_id = ? ORDER BY vencimento',
      [f.condominio_id]);
    return { condominio, lancamentos };
  }

  calcular({ condominio, lancamentos }, f) {
    // competências na ordem do vencimento, a mais nova primeiro
    const porComp = new Map();
    for (const l of lancamentos) {
      if (!porComp.has(l.referencia)) porComp.set(l.referencia, { referencia: l.referencia, vencimento: l.vencimento, itens: [] });
      porComp.get(l.referencia).itens.push(l);
    }
    const competencias = [...porComp.values()].sort((a, b) => (a.vencimento < b.vencimento ? 1 : -1));
    const resumo = (c) => {
      const emitido = c.itens.reduce((a, l) => a + Number(l.valor), 0);
      const arrecadado = c.itens.filter((l) => l.status === 'pago').reduce((a, l) => a + Number(l.valor), 0);
      return {
        competencia: c.referencia, vencimento: c.vencimento,
        totalEmitido: BaseRelatorio.dinheiro(emitido), totalArrecadado: BaseRelatorio.dinheiro(arrecadado),
        totalPendente: BaseRelatorio.dinheiro(emitido - arrecadado), taxaArrecadacao: BaseRelatorio.pct(arrecadado, emitido),
      };
    };
    // sem competência escolhida: a última que já venceu (mês fechado)
    const escolhida = competencias.find((c) => c.referencia === f.competencia)
      || competencias.find((c) => c.vencimento < f.agora.dia) || competencias[0];
    if (!escolhida) return { condominio: condominio.nome, competencias: [], mes: null, historico: [] };

    const unidades = [...new Set(escolhida.itens.map((l) => l.unidade))];
    const inadimplentes = unidades.filter((u) => escolhida.itens.some((l) => l.unidade === u && l.status === 'pendente' && l.vencimento < f.agora.dia));
    const mes = resumo(escolhida);
    return {
      condominio: condominio.nome,
      competencias: competencias.map((c) => c.referencia),
      mes: {
        ...mes,
        unidadesAdimplentes: unidades.length - inadimplentes.length,
        unidadesInadimplentes: inadimplentes.length,
        valorMedioPorUnidade: BaseRelatorio.dinheiro(mes.totalEmitido / (unidades.length || 1)),
      },
      historico: competencias.slice(0, 6).map(resumo),
    };
  }
}

module.exports = RelatorioDemonstrativo;
