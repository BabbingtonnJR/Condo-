// André — SE01: relatório de inadimplência por unidade
// FTR: Lançamento Financeiro, Unidade, Usuário (morador) | dado derivado: dias de atraso, multa, juros, atualizado, totais, %
const BaseRelatorio = require('./BaseRelatorio');

const MULTA = 0.02;          // 2% fixo
const JUROS_MES = 0.01;      // 1% ao mês, proporcional aos dias

class RelatorioInadimplencia extends BaseRelatorio {
  static codigo = 'SE01';
  static titulo = 'Inadimplência por unidade';

  validarFiltros(f) { return this.exigirCondominio(f); }

  async buscarDados(f) {
    const condominio = await this.buscarCondominio(f.condominio_id);
    const vencidos = await this.db.query(
      "SELECT unidade, referencia, valor, vencimento FROM financeiro WHERE condominio_id = ? AND status = 'pendente' AND vencimento < ? ORDER BY unidade, vencimento",
      [f.condominio_id, f.agora.dia]);
    const moradores = await this.db.query(
      "SELECT nome, unidade, status FROM moradores WHERE condominio_id = ? ORDER BY status, nome", [f.condominio_id]);
    const [{ n }] = await this.db.query('SELECT COUNT(DISTINCT unidade) n FROM financeiro WHERE condominio_id = ?', [f.condominio_id]);
    if (!condominio.unidades) condominio.unidades = Number(n); // clube: conta os títulos cobrados
    return { condominio, vencidos, moradores };
  }

  calcular({ condominio, vencidos, moradores }, f) {
    const nomes = (unidade) => {  // prefere o ativo; se só tiver inativo mostra com aviso
      const daUnidade = moradores.filter((m) => m.unidade === unidade);
      const ativos = daUnidade.filter((m) => m.status === 'ativo');
      if (ativos.length) return ativos.map((m) => m.nome).join(', ');
      return daUnidade.length ? daUnidade[0].nome + ' (inativo)' : '—';
    };
    const linhas = vencidos.map((l) => {
      const valor = Number(l.valor);
      const diasAtraso = BaseRelatorio.dias(l.vencimento, f.agora.dia);
      const multa = BaseRelatorio.dinheiro(valor * MULTA);
      const juros = BaseRelatorio.dinheiro(valor * JUROS_MES * diasAtraso / 30);
      return {
        unidade: l.unidade, morador: nomes(l.unidade), referencia: l.referencia, vencimento: l.vencimento,
        valor, diasAtraso, multa, juros, atualizado: BaseRelatorio.dinheiro(valor + multa + juros),
      };
    });
    const unidades = new Set(linhas.map((l) => l.unidade)).size;
    return {
      condominio: condominio.nome,
      linhas,
      resumo: {
        totalInadimplente: BaseRelatorio.dinheiro(linhas.reduce((a, l) => a + l.atualizado, 0)),
        unidadesInadimplentes: unidades,
        unidadesCondominio: condominio.unidades,
        percentualInadimplencia: BaseRelatorio.pct(unidades, condominio.unidades),
      },
      regras: 'Multa de 2% + juros de 1% ao mês proporcionais aos dias de atraso. % = unidades inadimplentes ÷ unidades do condomínio.',
    };
  }
}

module.exports = RelatorioInadimplencia;
