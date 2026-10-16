// Marcel — coisas que toda tela usa: sessão, menu, api.get/post/put/del, toast e modal

// sessão
function getUser(){
  try { return JSON.parse(localStorage.getItem('condoplus_user')); }
  catch(e){ return null; }
}
function setUser(u){ localStorage.setItem('condoplus_user', JSON.stringify(u)); }
function logout(){
  localStorage.removeItem('condoplus_user');
  window.location.href = 'login.html';
}
function requireLogin(){
  const u = getUser();
  if(!u){ window.location.href = 'login.html'; return null; }
  return u;
}

// telas de cada perfil: [código, arquivo, nome no menu]
const ROLES = {
  morador:        { labelPrefix:'Morador',
                    screens:[['m_home','morador-inicio.html','Início'],
                             ['m_comunicados','morador-comunicados.html','Comunicados'],
                             ['m_financeiro','morador-financeiro.html','Financeiro'],
                             ['m_solicitacoes','morador-solicitacoes.html','Solicitações'],
                             ['m_documentos','morador-documentos.html','Documentos'],
                             ['m_reservas','morador-reservas.html','Reservas'],
                             ['m_encomendas','morador-encomendas.html','Encomendas'],
                             ['_sec',null,'Consultas'],
                             ['c_comunicados','consulta-comunicados.html','Buscar comunicados']] },
  sindico:        { labelPrefix:'Síndico',
                    screens:[['s_painel','sindico-painel.html','Painel do síndico'],
                             ['s_moradores','sindico-moradores.html','Moradores'],
                             ['s_comunicados','sindico-comunicados.html','Comunicados'],
                             ['s_documentos','sindico-documentos.html','Documentos'],
                             ['s_financeiro','sindico-financeiro.html','Financeiro'],
                             ['s_solicitacoes','sindico-solicitacoes.html','Solicitações'],
                             ['_sec',null,'Relatórios'],  // v4: daqui pra baixo são as SEs
                             ['s_inadimplencia','sindico-inadimplencia.html','Inadimplência'],
                             ['s_demonstrativo','sindico-demonstrativo.html','Demonstrativo mensal'],
                             ['s_indicadores','sindico-indicadores.html','Indicadores de solicitações'],
                             ['s_ocupacao','sindico-ocupacao.html','Ocupação das áreas','reservas_area_comum'], // 4º item = módulo que precisa estar ligado
                             ['_sec',null,'Consultas'],  // v5: as CEs
                             ['c_moradores','consulta-moradores.html','Morador por unidade'],
                             ['c_solicitacoes','consulta-solicitacoes.html','Solicitações'],
                             ['c_boletos','consulta-boletos.html','Boletos da unidade'],
                             ['c_reservas','consulta-reservas.html','Reservas do dia','reservas_area_comum'],
                             ['c_comunicados','consulta-comunicados.html','Buscar comunicados']] },
  administradora: { labelPrefix:'Administradora',
                    screens:[['a_painel','administradora-painel.html','Painel consolidado'],
                             ['a_condominios','administradora-condominios.html','Condomínios'],
                             ['a_usuarios','administradora-usuarios.html','Usuários'],
                             ['a_modulos','administradora-modulos.html','Módulos por condomínio'],
                             ['_sec',null,'Consultas'],
                             ['c_condominios','consulta-condominios.html','Condomínios por tipo'],
                             ['c_usuarios','consulta-usuarios.html','Usuários por perfil']] },
  porteiro:       { labelPrefix:'Porteiro',
                    screens:[['p_encomendas','porteiro-encomendas.html','Encomendas'],
                             ['p_visitantes','porteiro-visitantes.html','Visitantes']] },
  prestador:      { labelPrefix:'Prestador de Serviço',
                    screens:[['pr_solicitacoes','prestador-solicitacoes.html','Minhas solicitações']] },
  suporte:        { labelPrefix:'Suporte',
                    screens:[['su_chamados','suporte-chamados.html','Fila de chamados'],
                             ['_sec',null,'Relatórios'],
                             ['su_prazos','suporte-prazos.html','Prazo dos chamados'],
                             ['_sec',null,'Consultas'],
                             ['c_chamados','consulta-chamados.html','Chamados por status']] },
};
const FIRST_PAGE = {
  morador:'morador-inicio.html', sindico:'sindico-painel.html',
  administradora:'administradora-painel.html', porteiro:'porteiro-encomendas.html',
  prestador:'prestador-solicitacoes.html', suporte:'suporte-chamados.html'
};

// avisos e modal
function toast(msg){
  const t = document.getElementById('toast');
  if(!t) return alert(msg);
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=>t.classList.remove('show'), 2600);
}
function openModal(html){
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-backdrop').classList.add('show');
}
function closeModal(){
  const b = document.getElementById('modal-backdrop');
  if(b) b.classList.remove('show');
}
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });

// api: se der erro, joga com a msg do servidor
const api = {
  botao: null, // a tela coloca aqui o botão clicado antes de chamar (aparece no terminal do servidor)
  async _req(metodo, path, body){
    const arquivo = location.pathname.split('/').pop() || 'index.html';
    const classe = window.pagina ? window.pagina.constructor.name : 'script da página';
    const tela = `${arquivo} (${classe})`;
    const botao = this.botao; this.botao = null;
    const opcoes = { method: metodo, headers: {
      'X-Tela': encodeURIComponent(tela),  // vai pro log do terminal (src/log.js do Babbingtonn)
      'X-Botao': encodeURIComponent(botao || ''),
    } };
    if(body !== undefined){
      opcoes.headers['Content-Type'] = 'application/json';
      opcoes.body = JSON.stringify(body);
    }
    console.log(`[Condo+] ${tela}${botao ? ` | botão "${botao}"` : ''} -> ${metodo} /api${path}`); // aparece no F12
    const r = await fetch('/api' + path, opcoes);
    let dados = null;
    try { dados = await r.json(); } catch(e) { /* resposta sem JSON */ }
    if(!r.ok) throw new Error((dados && dados.erro) || `Erro ${r.status} ao acessar o servidor.`);
    return dados;
  },
  get(path){ return this._req('GET', path); },
  post(path, body){ return this._req('POST', path, body); },
  put(path, body){ return this._req('PUT', path, body); },
  patch(path, body){ return this._req('PATCH', path, body); },
  del(path){ return this._req('DELETE', path); },
};

// variabilidade: nomes e módulos vêm do login (fábrica do Gabriel)
const ROTULOS_PADRAO = { pessoas:'Moradores', pessoa:'morador', unidade:'Unidade' };

function rotulos(u){ return (u && u.condominio_rotulos) || ROTULOS_PADRAO; }
function labelMorador(u){ return rotulos(u).pessoas; }
function labelUnidade(u){ return rotulos(u).unidade; }
function modulosDe(u){
  const m = u && u.condominio_modulos;
  return (typeof m === 'string') ? JSON.parse(m) : (m || {});
}

function screensForRole(u){  // monta o menu só com o que tá ligado pro condomínio
  const info = ROLES[u.perfil];
  if(!info) return [];
  let screens = info.screens.slice();
  const modulos = modulosDe(u);

  if(u.perfil === 'sindico'){
    screens = screens.map(s => s[0] === 's_moradores' ? [s[0], s[1], labelMorador(u)] : s);
    screens = screens.map(s => s[0] === 'c_moradores' ? [s[0], s[1], `${rotulos(u).pessoa[0].toUpperCase() + rotulos(u).pessoa.slice(1)} por ${labelUnidade(u).toLowerCase()}`] : s);
    if(modulos.reservas_area_comum){
      screens.splice(3, 0, ['s_reservas','sindico-reservas.html','Reservas']);
    }
    if(modulos.estacionamento_rotativo){ // só no comercial
      screens.splice(screens.findIndex(s => s[0] === '_sec'), 0, ['s_estacionamento','sindico-estacionamento.html','Estacionamento rotativo']);
    }
    if(modulos.controle_convidados_evento){ // só no clube
      screens.splice(screens.findIndex(s => s[0] === '_sec'), 0, ['s_convidados','sindico-convidados.html','Convidados de evento']);
    }
  }
  screens = screens.filter(s => !s[3] || modulos[s[3]]); // v5: item com módulo no 4º campo só aparece se o módulo tá ligado
  if(u.perfil === 'morador' && !modulos.reservas_area_comum){
    screens = screens.filter(s => s[0] !== 'm_reservas');
  }
  return screens;
}

function renderSidebar(telaAtiva){
  const u = getUser();
  if(!u) return;
  const info = ROLES[u.perfil];
  const nav = screensForRole(u).map(s => s[0] === '_sec'
    ? `<div class="nav-section">${esc(s[2])}</div>`  // v4: título de seção no menu
    : `<a class="nav-item ${s[0]===telaAtiva?'active':''}" href="${s[1]}"><span class="nav-dot"></span>${esc(s[2])}</a>`
  ).join('');
  const condLine = u.condominio_nome
    ? `${esc(u.condominio_nome)} <span class="tag tag-progress" style="margin-left:4px;">${esc(u.condominio_tipo || '')}</span>`
    : '';
  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-brand"><span class="mark"></span><span>Condo+</span></div>
    <div class="sidebar-role">Perfil atual<strong>${esc(info.labelPrefix)} — ${esc(u.nome)}${u.unidade ? ' ('+esc(u.unidade)+')' : ''}</strong></div>
    ${condLine ? `<div class="sidebar-role" style="padding-top:0;">${condLine}</div>` : ''}
    <nav>${nav}</nav>
    <div class="sidebar-footer"><a href="#" id="logout-link">← Sair</a></div>
  `;
  document.getElementById('logout-link').addEventListener('click', (e) => { e.preventDefault(); logout(); });
}

function esc(v){  // escapa < > " pra texto do banco não quebrar a tela
  return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
