// Babbingtonn — v4: base das telas de relatório (SE01 a SE06)
// é filha da BasePage do Marcel, então o iniciar() (Template Method) continua igual
// aqui eu já faço o carregarDados: chama GET /api/relatorios/<nome> com os filtros
// a tela filha só diz qual relatório é, quais filtros manda e desenha o resultado
class RelatorioPage extends BasePage {
  constructor(tela, relatorio){
    super(tela);
    if(new.target === RelatorioPage) throw new Error('RelatorioPage é abstrata: crie uma subclasse.');
    this.relatorio = relatorio;   // ex.: 'inadimplencia' -> RelatorioFactory lá no back
    this.valoresFiltro = {};      // o que o usuário escolheu nos filtros da tela
  }

  // gancho: filtros fixos (condomínio do síndico, por exemplo)
  filtros(){ return { condominio_id: this.usuario.condominio_id }; }

  async carregarDados(){  // o mesmo pra todo relatório
    const todos = { ...this.filtros(), ...this.valoresFiltro };
    const qs = new URLSearchParams(Object.entries(todos).filter(([, v]) => v !== null && v !== undefined && v !== '')).toString();
    return api.get(`/relatorios/${this.relatorio}${qs ? '?' + qs : ''}`);
  }

  // o código da SE aparece embaixo do título, pra achar fácil na planilha de PF
  subtitulo(){
    const d = this.dados;
    if(!d) return '';
    return `<span class="se-code">${esc(d.codigo)}</span>${d.condominio ? esc(d.condominio) + ' · ' : ''}gerado em ${fmt.dataHora(d.geradoEm)}`;
  }

  // filtro mudou? guarda e busca de novo
  async filtrar(nome, valor){
    this.valoresFiltro[nome] = valor;
    api.botao = `Filtro "${nome}" = ${valor}`;
    await this.recarregar();
  }

  // pedacinhos de HTML que toda tela de relatório usa
  kpi(valor, rotulo, derivado = true){
    return `<div class="panel stat"><div class="num">${valor}${derivado ? '<span class="derivado">*</span>' : ''}</div><div class="lbl">${esc(rotulo)}</div></div>`;
  }
  kpis(lista){  // lista de [valor, rotulo, derivado?]
    const classe = lista.length >= 4 ? 'grid-4' : 'grid-3';
    return `<div class="${classe}">${lista.map(k => this.kpi(...k)).join('')}</div>`;
  }
  // colunas: [{ rotulo, html(linha), num: true se for número, derivado: true se for calculado }]
  tabela(titulo, colunas, linhas, { vazio = 'Nada para mostrar.', total = '' } = {}){
    const th = colunas.map(c => `<th class="${c.num ? 'num' : ''}">${esc(c.rotulo)}${c.derivado ? '<span class="derivado">*</span>' : ''}</th>`).join('');
    const corpo = linhas.map(l => `<tr>${colunas.map(c => `<td class="${c.num ? 'num' : ''}">${c.html(l)}</td>`).join('')}</tr>`).join('')
      || `<tr><td colspan="${colunas.length}"><div class="empty">${esc(vazio)}</div></td></tr>`;
    return `<div class="panel">${titulo ? `<h3>${esc(titulo)}</h3>` : ''}<div class="table-wrap"><table>
      <thead><tr>${th}</tr></thead><tbody>${corpo}${linhas.length ? total : ''}</tbody></table></div></div>`;
  }
  barra(pct){ return `<div class="barra" title="${fmt.pct(pct)}"><span style="width:${Math.min(100, pct)}%"></span></div>`; }
  rodape(extra = ''){
    return `<div class="rodape-relatorio"><span class="derivado">*</span> dado derivado: calculado pelo servidor na hora, não fica gravado no banco.${extra ? ' ' + esc(extra) : ''}</div>`;
  }
}
