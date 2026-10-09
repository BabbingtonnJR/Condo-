/* ============ SESSÃO (dados vindos do /api/login) ============ */
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

/* ============ CONFIG DE PERFIS / TELAS ============ */
const ROLES = {
  morador:        { labelPrefix:'Morador',
                    screens:[['m_home','morador-inicio.html','Início'],
                             ['m_comunicados','morador-comunicados.html','Comunicados'],
                             ['m_financeiro','morador-financeiro.html','Financeiro'],
                             ['m_solicitacoes','morador-solicitacoes.html','Solicitações'],
                             ['m_documentos','morador-documentos.html','Documentos'],
                             ['m_reservas','morador-reservas.html','Reservas'],
                             ['m_encomendas','morador-encomendas.html','Encomendas']] },
  sindico:        { labelPrefix:'Síndico',
                    screens:[['s_painel','sindico-painel.html','Painel do síndico'],
                             ['s_moradores','sindico-moradores.html','Moradores'],
                             ['s_comunicados','sindico-comunicados.html','Comunicados'],
                             ['s_documentos','sindico-documentos.html','Documentos'],
                             ['s_financeiro','sindico-financeiro.html','Financeiro'],
                             ['s_solicitacoes','sindico-solicitacoes.html','Solicitações']] },
  administradora: { labelPrefix:'Administradora',
                    screens:[['a_painel','administradora-painel.html','Painel administrativo'],
                             ['a_condominios','administradora-condominios.html','Condomínios'],
                             ['a_usuarios','administradora-usuarios.html','Usuários'],
                             ['a_modulos','administradora-modulos.html','Módulos por condomínio']] },
  porteiro:       { labelPrefix:'Porteiro',
                    screens:[['p_encomendas','porteiro-encomendas.html','Encomendas'],
                             ['p_visitantes','porteiro-visitantes.html','Visitantes']] },
  prestador:      { labelPrefix:'Prestador de Serviço',
                    screens:[['pr_solicitacoes','prestador-solicitacoes.html','Minhas solicitações']] },
  suporte:        { labelPrefix:'Suporte',
                    screens:[['su_chamados','suporte-chamados.html','Fila de chamados']] },
};
const FIRST_PAGE = {
  morador:'morador-inicio.html', sindico:'sindico-painel.html',
  administradora:'administradora-painel.html', porteiro:'porteiro-encomendas.html',
  prestador:'prestador-solicitacoes.html', suporte:'suporte-chamados.html'
};

/* ============ HELPERS DE UI ============ */
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

/* ============ CHAMADAS À API ============ */
const api = {
  async _req(metodo, path, body){
    const opcoes = { method: metodo };
    if(body !== undefined){
      opcoes.headers = { 'Content-Type':'application/json' };
      opcoes.body = JSON.stringify(body);
    }
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

/* ============ VARIABILIDADE: rótulos e módulos do condomínio ============ */
const ROTULOS_PADRAO = { pessoas:'Moradores', pessoa:'morador', unidade:'Unidade' };

function rotulos(u){ return (u && u.condominio_rotulos) || ROTULOS_PADRAO; }
function labelMorador(u){ return rotulos(u).pessoas; }
function labelUnidade(u){ return rotulos(u).unidade; }
function modulosDe(u){
  const m = u && u.condominio_modulos;
  return (typeof m === 'string') ? JSON.parse(m) : (m || {});
}

/* ============ SIDEBAR (navegação sensível a módulos — Parte III) ============ */
function screensForRole(u){
  const info = ROLES[u.perfil];
  if(!info) return [];
  let screens = info.screens.slice();
  const modulos = modulosDe(u);

  if(u.perfil === 'sindico'){
    // "Moradores" muda de rótulo conforme o tipo de cliente
    screens = screens.map(s => s[0] === 's_moradores' ? [s[0], s[1], labelMorador(u)] : s);
    // Reservas de área comum só aparece se o módulo estiver habilitado
    if(modulos.reservas_area_comum){
      screens.splice(3, 0, ['s_reservas','sindico-reservas.html','Reservas']);
    }
    // Estacionamento rotativo — módulo EXCLUSIVO comercial
    if(modulos.estacionamento_rotativo){
      screens.push(['s_estacionamento','sindico-estacionamento.html','Estacionamento rotativo']);
    }
    // Controle de convidados por evento — módulo EXCLUSIVO clube
    if(modulos.controle_convidados_evento){
      screens.push(['s_convidados','sindico-convidados.html','Convidados de evento']);
    }
  }
  if(u.perfil === 'morador' && !modulos.reservas_area_comum){
    screens = screens.filter(s => s[0] !== 'm_reservas');
  }
  return screens;
}

function renderSidebar(telaAtiva){
  const u = getUser();
  if(!u) return;
  const info = ROLES[u.perfil];
  const nav = screensForRole(u).map(s =>
    `<a class="nav-item ${s[0]===telaAtiva?'active':''}" href="${s[1]}"><span class="nav-dot"></span>${esc(s[2])}</a>`
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

/* Escapa texto antes de colocar no HTML (evita quebrar a tela com < ou ") */
function esc(v){
  return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
