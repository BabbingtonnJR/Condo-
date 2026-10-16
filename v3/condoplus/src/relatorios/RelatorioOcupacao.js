// Gabriel — SE04: ocupação das áreas comuns
// FTR: Reserva | dado derivado: totais, taxa de ocupação, horário de pico
// variabilidade: só existe se o condomínio tem o módulo de reservas ligado
const BaseRelatorio = require('./BaseRelatorio');
const { ErroValidacao } = require('condoplus-core');

class RelatorioOcupacao extends BaseRelatorio {
  static codigo = 'SE04';
  static titulo = 'Ocupação das áreas comuns';

  validarFiltros(f) {
    this.exigirCondominio(f);
    if (f.mes && !/^\d{4}-\d{2}$/.test(f.mes)) throw new ErroValidacao('Mês inválido (use AAAA-MM).');
    return f;
  }

  async buscarDados(f) {
    const condominio = await this.buscarCondominio(f.condominio_id);
    if (!condominio.modulos.reservas_area_comum) {
      throw new ErroValidacao('Este condomínio não tem o módulo de reservas ligado, então não tem relatório de ocupação.');
    }
    const mes = f.mes || f.agora.dia.slice(0, 7);
    const reservas = await this.db.query(
      "SELECT area, data_reserva, hora, status FROM reservas WHERE condominio_id = ? AND DATE_FORMAT(data_reserva, '%Y-%m') = ?",
      [f.condominio_id, mes]);
    return { condominio, reservas, mes };
  }

  calcular({ condominio, reservas, mes }) {
    const [ano, m] = mes.split('-').map(Number);
    const diasNoMes = new Date(Date.UTC(ano, m, 0)).getUTCDate();
    const areas = [...new Set(reservas.map((r) => r.area))].sort();
    const porArea = areas.map((area) => {
      const daArea = reservas.filter((r) => r.area === area);
      const ativas = daArea.filter((r) => r.status !== 'cancelada');
      const diasOcupados = new Set(ativas.map((r) => r.data_reserva)).size;
      // horário de pico = hora de início que mais aparece (moda)
      const contagem = {};
      for (const r of ativas) { const h = (String(r.hora).match(/(\d{1,2})\s*h/) || [])[1]; if (h) contagem[h] = (contagem[h] || 0) + 1; }
      const pico = Object.entries(contagem).sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
      return {
        area, totalReservas: daArea.length,
        confirmadas: daArea.filter((r) => r.status === 'confirmada').length,
        pendentes: daArea.filter((r) => r.status === 'pendente').length,
        canceladas: daArea.filter((r) => r.status === 'cancelada').length,
        diasOcupados, taxaOcupacao: BaseRelatorio.pct(diasOcupados, diasNoMes), horarioPico: pico ? `${pico[0]}h` : '—',
      };
    });
    return { condominio: condominio.nome, mes, diasNoMes, porArea };
  }
}

module.exports = RelatorioOcupacao;
