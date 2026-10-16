// Babbingtonn — v5: base das telas de consulta (CE01 a CE08)
// filha da BasePage do Marcel (o iniciar() continua o mesmo Template Method)
// a tela tem 2 partes: ENTRADA (campos + botão Consultar) e SAÍDA (tabela com o que tá gravado no banco)
// os campos de entrada são criados pelo CampoFactory do Gabriel, igual nos formulários de CRUD
class ConsultaPage extends BasePage {
  constructor(cfg){
    super(cfg.tela);
    this.cfg = cfg;           // { tela, consulta, codigo, titulo, entradas, fixos, colunas, antesDeCarregar, ajuda }
    this.resultado = null;    // null = ainda não consultou
    this.valores = { ...(cfg.valoresIniciais || {}) };
  }

  r(v){ return typeof v === 'function' ? v(this) : v; }
  titulo(){ return this.r(this.cfg.titulo); }
  subtitulo(){ return `<span class="se-code">${esc(this.cfg.codigo)}</span>consulta: entrada → saída, sem cálculo`; }

  async carregarDados(){  // na abertura só carrega o que os selects precisam
    if(this.cfg.antesDeCarregar) await this.cfg.antesDeCarregar(this);
    return null;
  }

  renderizarConteudo(){
    this._campos = this.r(this.cfg.entradas).map(def => CampoFactory.criar(def));
    const ajuda = this.r(this.cfg.ajuda);
    return `
      ${ajuda ? `<div class="helper-note">${ajuda}</div>` : ''}
      <div class="panel"><h3>Entrada</h3>
        <form class="filtros consulta-form" onsubmit="pagina.consultar(); return false;">
          ${this._campos.map(c => c.renderizar(this.valores[c.nome], this, true)).join('')}
          <button class="btn btn-primary" type="submit" id="btn-consultar">Consultar</button>
        </form>
      </div>
      ${this.renderizarSaida()}`;
  }

  renderizarSaida(){
    const colunas = this.r(this.cfg.colunas);
    if(this.resultado === null) return `<div class="panel"><h3>Saída</h3><div class="empty">Preencha a entrada e clique em <strong>Consultar</strong>.</div></div>`;
    const linhas = this.resultado.linhas;
    const corpo = linhas.map(l => `<tr>${colunas.map(c => `<td class="${c.num ? 'num' : ''}">${c.html(l, this)}</td>`).join('')}</tr>`).join('')
      || `<tr><td colspan="${colunas.length}"><div class="empty">Nada encontrado com essa entrada.</div></td></tr>`;
    return `<div class="panel"><h3>Saída</h3><div class="table-wrap"><table>
      <thead><tr>${colunas.map(c => `<th class="${c.num ? 'num' : ''}">${esc(c.rotulo)}</th>`).join('')}</tr></thead>
      <tbody>${corpo}</tbody></table></div></div>`;
  }

  async consultar(){  // botão "Consultar"
    const entrada = {};
    for(const campo of this._campos){
      const valor = campo.ler();
      const erro = campo.validar(valor, true);
      if(erro){ toast(erro); document.getElementById(campo.idHtml).focus(); return; }
      entrada[campo.nome] = valor;
    }
    this.valores = entrada;
    const params = { ...entrada, ...(this.r(this.cfg.fixos) || {}) };
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)).toString();
    const botao = document.getElementById('btn-consultar');
    botao.disabled = true;
    try {
      api.botao = 'Consultar';
      this.resultado = await api.get(`/consultas/${this.cfg.consulta}?${qs}`);
      this.desenhar();
    } catch(e){
      toast(e.message);
      botao.disabled = false;
    }
  }
}
