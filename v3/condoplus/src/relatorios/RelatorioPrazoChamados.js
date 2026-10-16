// Marcel — SE05: prazo dos chamados de suporte
// FTR: Chamado | dado derivado: horas em aberto, situação do prazo, totais e % vencidos
const BaseRelatorio = require('./BaseRelatorio');

const PRAZO_PADRAO_HORAS = 48;

class RelatorioPrazoChamados extends BaseRelatorio {
  static codigo = 'SE05';
  static titulo = 'Prazo dos chamados de suporte';

  validarFiltros(f) {
    f.prazoHoras = Number(f.prazoHoras) > 0 ? Number(f.prazoHoras) : PRAZO_PADRAO_HORAS;
    return f;
  }

  async buscarDados() {
    return this.db.query(
      "SELECT id, assunto, status, escalado, DATE_FORMAT(aberto_em, '%Y-%m-%d %H:%i:%s') AS aberto_em " +
      "FROM chamados WHERE status <> 'concluido' ORDER BY aberto_em"); // só a tabela chamados: FTR = 1, igual na planilha
  }

  calcular(chamados, f) {
    const linhas = chamados.map((c) => {
      const horas = BaseRelatorio.horas(c.aberto_em, f.agora.texto);
      return { ...c, escalado: !!c.escalado, horasEmAberto: horas, situacao: horas > f.prazoHoras ? 'Vencido' : 'No prazo' };
    });
    const vencidos = linhas.filter((l) => l.situacao === 'Vencido').length;
    return {
      prazoHoras: f.prazoHoras,
      linhas,
      resumo: { totalEmAberto: linhas.length, totalVencidos: vencidos, percentualVencidos: BaseRelatorio.pct(vencidos, linhas.length) },
    };
  }
}

module.exports = RelatorioPrazoChamados;
