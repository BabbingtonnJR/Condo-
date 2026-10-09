// Marcel — Template Method #3
// toda tela segue o iniciar(): login > sessão > menu > carregarDados() > renderizarConteudo()
// a tela filha só escreve esses dois últimos e pronto
class BasePage {
  constructor(tela){
    if(new.target === BasePage) throw new Error('BasePage é abstrata: crie uma subclasse.');
    this.tela = tela;
    this.usuario = null;
    this.dados = null;
    this.main = null;
    this._form = null;
  }

  async iniciar(){  // o template: essa ordem não muda
    window.pagina = this; // pros onclick="pagina.xxx()" funcionarem
    this.usuario = getUser();
    if(!this.usuario){ window.location.href = 'login.html'; return; } // 1. login
    this.montarEsqueleto(); // 2. esqueleto
    await this.atualizarSessao(); // 3. sessão (módulos)
    if(!this.verificarAcesso()) return; // 4. pode ver essa tela?
    renderSidebar(this.tela); // 5. menu
    try {
      this.main.innerHTML = '<div class="loading">Carregando…</div>';
      this.dados = await this.carregarDados(); // 6. a filha que faz
      this.desenhar(); // 7. a filha também + gancho
    } catch(e) {
      this.mostrarErro(e);
    }
  }

  // esses dois a filha TEM que fazer
  async carregarDados(){ throw new Error(`${this.constructor.name} precisa implementar carregarDados().`); }
  renderizarConteudo(dados){ throw new Error(`${this.constructor.name} precisa implementar renderizarConteudo().`); }

  // ganchos, muda se quiser
  titulo(){ return ''; }
  subtitulo(){ return ''; }
  acoesTopo(){ return ''; }
  aoRenderizar(){}

  // daqui pra baixo é tudo fixo
  desenhar(){
    this.main.innerHTML = this.renderizarTopo() + this.renderizarConteudo(this.dados);
    this.aoRenderizar();
  }

  async recarregar(){
    try { this.dados = await this.carregarDados(); this.desenhar(); }
    catch(e){ toast(e.message); }
  }

  renderizarTopo(){
    const sub = this.subtitulo(), acoes = this.acoesTopo();
    return `<div class="topbar">
      <div><h2>${esc(this.titulo())}</h2>${sub ? `<div class="crumb">${sub}</div>` : ''}</div>
      ${acoes ? `<div class="actions">${acoes}</div>` : ''}
    </div>`;
  }

  montarEsqueleto(){
    if(!document.getElementById('main-content')){
      document.body.insertAdjacentHTML('afterbegin', `
        <div class="app-shell">
          <aside class="sidebar" id="sidebar"></aside>
          <main class="main" id="main-content"></main>
        </div>
        <div class="modal-backdrop" id="modal-backdrop"><div class="modal" id="modal-body" role="dialog" aria-modal="true"></div></div>
        <div class="toast" id="toast" role="status"></div>`);
    }
    this.main = document.getElementById('main-content');
  }

  async atualizarSessao(){  // puxa os módulos de novo, vai que a administradora mudou algo
    try {
      const { usuario } = await api.get('/sessao/' + this.usuario.id);
      this.usuario = usuario;
      setUser(usuario);
    } catch(e) {
      if(/Sessão inválida/.test(e.message)) logout();
    }
  }

  verificarAcesso(){  // módulo desligado? volta pro início
    const liberada = screensForRole(this.usuario).some(s => s[0] === this.tela);
    if(!liberada){ window.location.href = FIRST_PAGE[this.usuario.perfil] || 'login.html'; return false; }
    return true;
  }

  mostrarErro(e){
    this.main.innerHTML = `<div class="error-box">${esc(e.message)}</div>`;
  }

  // formulário no modal (os campos vêm do CampoFactory do Gabriel)
  abrirFormulario({ titulo, subtitulo = '', campos, valores = {}, rotuloBotao = 'Salvar', modoCriacao = true, aoConfirmar }){
    const objetos = campos.map(def => CampoFactory.criar(def));
    this._form = { campos: objetos, aoConfirmar, modoCriacao };
    openModal(`
      <h3>${esc(titulo)}</h3>
      ${subtitulo ? `<p class="sub">${esc(subtitulo)}</p>` : ''}
      ${objetos.map(c => c.renderizar(valores[c.nome], this, modoCriacao)).join('')}
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="form-confirmar" onclick="pagina.confirmarFormulario()">${esc(rotuloBotao)}</button>
      </div>`);
    const primeiro = document.querySelector('#modal-body input, #modal-body select, #modal-body textarea');
    if(primeiro) primeiro.focus();
  }

  async confirmarFormulario(){
    const { campos, aoConfirmar, modoCriacao } = this._form;
    const dados = {};
    for(const campo of campos){
      const valor = campo.ler();
      const erro = campo.validar(valor, modoCriacao);
      if(erro){ toast(erro); document.getElementById(campo.idHtml).focus(); return; }
      if(!(campo.ignorarSeVazio && valor === '')) dados[campo.nome] = valor;
    }
    const botao = document.getElementById('form-confirmar');
    botao.disabled = true;
    try {
      await aoConfirmar(dados);
      closeModal();
    } catch(e) {
      toast(e.message);
    } finally {
      botao.disabled = false;
    }
  }
}

// CrudPage (também minha): tela de cadastro pronta, vocês só passam a config
// recurso, colunas, campos, filtros, fixos, acoes... olha qualquer tela de CRUD que fica fácil
class CrudPage extends BasePage {
  constructor(cfg){
    super(cfg.tela);
    this.cfg = Object.assign({
      permitirCriar: true,
      podeEditar: () => true,
      podeExcluir: () => true,
      acoes: [],
      vazio: 'Nenhum registro cadastrado ainda.',
      descricao: (i) => i.nome || i.titulo || i.codigo || i.convidado || i.assunto || `#${i.id}`,
    }, cfg);
    this.itens = [];
  }

  // aceita valor direto ou função
  r(valor, ...args){ return typeof valor === 'function' ? valor(...(args.length ? args : [this])) : valor; }

  titulo(){ return this.r(this.cfg.titulo); }
  subtitulo(){ return this.r(this.cfg.subtitulo) || ''; }
  nomeSingular(){ return this.r(this.cfg.nomeSingular) || 'registro'; }
  acoesTopo(){
    if(!this.cfg.permitirCriar) return '';
    const rotulo = this.r(this.cfg.rotuloNovo) || `Cadastrar ${this.nomeSingular()}`;
    return `<button class="btn btn-primary" onclick="pagina.novo()">+ ${esc(rotulo)}</button>`;
  }

  async carregarDados(){
    if(this.cfg.antesDeCarregar) await this.cfg.antesDeCarregar(this);
    const filtros = Object.entries(this.r(this.cfg.filtros) || {})
      .filter(([, v]) => v !== null && v !== undefined && v !== '');
    const qs = new URLSearchParams(filtros).toString();
    this.itens = await api.get(this.cfg.recurso + (qs ? '?' + qs : ''));
    return this.itens;
  }

  renderizarConteudo(itens){
    const colunas = this.r(this.cfg.colunas);
    const ajuda = this.r(this.cfg.ajuda);
    const cabecalho = this.cfg.cabecalho ? this.cfg.cabecalho(itens, this) : '';
    const linhas = itens.map(item => this.renderizarLinha(item, colunas)).join('');
    const vazio = `<tr><td colspan="${colunas.length + 1}"><div class="empty">${esc(this.r(this.cfg.vazio))}</div></td></tr>`;
    return `
      ${ajuda ? `<div class="helper-note">${ajuda}</div>` : ''}
      ${cabecalho}
      <div class="panel"><div class="table-wrap"><table>
        <thead><tr>${colunas.map(c => `<th>${esc(c.rotulo)}</th>`).join('')}<th></th></tr></thead>
        <tbody>${linhas || vazio}</tbody>
      </table></div></div>`;
  }

  renderizarLinha(item, colunas){
    const celulas = colunas.map(c => `<td>${c.html ? c.html(item, this) : esc(item[c.campo] ?? '—')}</td>`).join('');
    return `<tr>${celulas}<td><div class="row-actions">${this.botoesDaLinha(item)}</div></td></tr>`;
  }

  botoesDaLinha(item){
    const botoes = [];
    this.cfg.acoes.forEach((acao, i) => {
      if(acao.mostrar && !acao.mostrar(item, this)) return;
      const rotulo = typeof acao.rotulo === 'function' ? acao.rotulo(item) : acao.rotulo;
      botoes.push(`<button class="btn ${acao.perigo ? 'btn-danger' : 'btn-ghost'} btn-sm" onclick="pagina.executarAcao(${i}, ${item.id})">${esc(rotulo)}</button>`);
    });
    if(this.cfg.podeEditar(item, this)) botoes.push(`<button class="btn btn-ghost btn-sm" onclick="pagina.editar(${item.id})">Editar</button>`);
    if(this.cfg.podeExcluir(item, this)) botoes.push(`<button class="btn btn-danger btn-sm" onclick="pagina.excluir(${item.id})">Excluir</button>`);
    return botoes.join('');
  }

  item(id){ return this.itens.find(i => i.id === id); }

  camposDoFormulario(modoCriacao){
    return this.r(this.cfg.campos).filter(c => modoCriacao || !c.somenteNaCriacao);
  }

  novo(){  // botão "+ Cadastrar"
    this.abrirFormulario({
      titulo: `Cadastrar ${this.nomeSingular()}`,
      campos: this.camposDoFormulario(true),
      valores: this.r(this.cfg.valoresIniciais) || {},
      rotuloBotao: 'Cadastrar',
      modoCriacao: true,
      aoConfirmar: async (dados) => {
        await api.post(this.cfg.recurso, { ...(this.r(this.cfg.fixos) || {}), ...dados });
        toast('Cadastro realizado.');
        await this.recarregar();
      },
    });
  }

  editar(id){  // botão "Editar"
    const item = this.item(id);
    this.abrirFormulario({
      titulo: `Editar ${this.nomeSingular()}`,
      campos: this.camposDoFormulario(false),
      valores: item,
      rotuloBotao: 'Salvar alterações',
      modoCriacao: false,
      aoConfirmar: async (dados) => {
        await api.put(`${this.cfg.recurso}/${id}`, dados);
        toast('Alterações salvas.');
        await this.recarregar();
      },
    });
  }

  async excluir(id){  // botão "Excluir"
    const item = this.item(id);
    if(!confirm(`Excluir "${this.cfg.descricao(item)}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.del(`${this.cfg.recurso}/${id}`);
      toast('Registro excluído.');
      await this.recarregar();
    } catch(e){ toast(e.message); }
  }

  async executarAcao(indice, id){  // botões extras (cfg.acoes)
    const acao = this.cfg.acoes[indice];
    const item = this.item(id);
    const rodar = async (dados) => {
      const msg = await acao.executar(item, this, dados);
      if(msg) toast(msg);
      await this.recarregar();
    };
    if(acao.campos){ // tipo o reservar vaga, que pede um nome antes
      this.abrirFormulario({
        titulo: acao.tituloFormulario || acao.rotulo, campos: acao.campos,
        rotuloBotao: acao.rotuloBotao || 'Confirmar', aoConfirmar: rodar,
      });
      return;
    }
    if(acao.confirmar && !confirm(acao.confirmar)) return;
    try { await rodar({}); } catch(e){ toast(e.message); }
  }
}
