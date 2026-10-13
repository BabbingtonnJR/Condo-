/* ============ SESSÃO (dados vindos do /api/login) ============ */
function getUser(){
  try { return JSON.parse(localStorage.getItem('condoplus_user')); }
  catch(e){ return null; }
}
function requireLogin(){
  const u = getUser();
  if(!u){ window.location.href = 'login.html'; return null; }
  return u;
}

/* ============ CONFIG DE PERFIS / ARQUIVOS ============ */
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
                             ['s_solicitacoes','sindico-solicitacoes.html','Solicitações']] },
  administradora: { labelPrefix:'Administradora',
                    screens:[['a_painel','administradora-painel.html','Painel administrativo'],
                             ['a_condominios','administradora-condominios.html','Condomínios'],
                             ['a_modulos','administradora-modulos.html','Módulos por condomínio']] },
  porteiro:       { labelPrefix:'Porteiro',
                    screens:[['p_portaria','porteiro-portaria.html','Portaria']] },
  prestador:      { labelPrefix:'Prestador de Serviço',
                    screens:[['pr_solicitacoes','prestador-solicitacoes.html','Minhas solicitações']] },
  suporte:        { labelPrefix:'Suporte',
                    screens:[['su_chamados','suporte-chamados.html','Fila de chamados']] },
};
const FIRST_PAGE = {
  morador:'morador-inicio.html', sindico:'sindico-painel.html',
  administradora:'administradora-painel.html', porteiro:'porteiro-portaria.html',
  prestador:'prestador-solicitacoes.html', suporte:'suporte-chamados.html'
};

/* ============ HELPERS DE UI ============ */
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}
function openModal(html){
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-backdrop').classList.add('show');
}
function closeModal(){
  document.getElementById('modal-backdrop').classList.remove('show');
}

/* ============ CHAMADAS À API ============ */
const api = {
  async get(path){
    const r = await fetch('/api' + path);
    if(!r.ok) throw new Error((await r.json()).erro || 'Erro ao buscar dados.');
    return r.json();
  },
  async post(path, body){
    const r = await fetch('/api' + path, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    if(!r.ok) throw new Error((await r.json()).erro || 'Erro ao salvar.');
    return r.json();
  },
  async put(path, body){
    const r = await fetch('/api' + path, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    if(!r.ok) throw new Error((await r.json()).erro || 'Erro ao atualizar.');
    return r.json();
  },
  async patch(path, body){
    const r = await fetch('/api' + path, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: body ? JSON.stringify(body) : undefined });
    if(!r.ok) throw new Error((await r.json()).erro || 'Erro ao atualizar.');
    return r.json();
  }
};

/* ============ SIDEBAR (com navegação sensível a módulos — Parte III) ============ */
function labelUnidade(tipo){
  return tipo === 'comercial' ? 'Sala/Andar' : 'Unidade';
}
function labelMorador(tipo){
  return tipo === 'comercial' ? 'Colaboradores' : 'Moradores';
}

function screensForRole(u){
  const info = ROLES[u.perfil];
  let screens = info.screens.slice();
  const tipo = u.condominio_tipo;
  const modulos = (typeof u.condominio_modulos === 'string') ? JSON.parse(u.condominio_modulos) : (u.condominio_modulos || {});

  if(u.perfil === 'sindico'){
    // "Moradores" muda de rótulo conforme o tipo de cliente (residencial x comercial)
    screens = screens.map(s => s[0] === 's_moradores' ? [s[0], s[1], labelMorador(tipo)] : s);
    // Reservas de área comum só aparece se o módulo estiver habilitado para este condomínio
    if(!modulos.reservas_area_comum){
      screens = screens.filter(s => s[0] !== 's_reservas');
    } else if(!screens.find(s => s[0] === 's_reservas')){
      screens.splice(2, 0, ['s_reservas','sindico-reservas.html','Reservas']);
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
  if(u.perfil === 'morador'){
    if(!modulos.reservas_area_comum){
      screens = screens.filter(s => s[0] !== 'm_reservas');
    }
  }
  return screens;
}

function renderSidebar(){
  const u = getUser();
  if(!u) return;
  const info = ROLES[u.perfil];
  const screens = screensForRole(u);
  const nav = screens.map(s =>
    `<a class="nav-item ${s[0]===window.PAGE_SCREEN?'active':''}" href="${s[1]}"><span class="nav-dot"></span>${s[2]}</a>`
  ).join('');
  const condLine = u.condominio_nome ? `${u.condominio_nome} <span class="tag tag-progress" style="margin-left:4px;">${u.condominio_tipo || ''}</span>` : '';
  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-brand"><span class="mark"></span><span>Condo+</span></div>
    <div class="sidebar-role">Perfil atual<strong>${info.labelPrefix} — ${u.nome}${u.unidade ? ' ('+u.unidade+')' : ''}</strong></div>
    ${condLine ? `<div class="sidebar-role" style="padding-top:0;">${condLine}</div>` : ''}
    <nav>${nav}</nav>
    <div class="sidebar-footer"><a href="#" id="logout-link">← Sair</a></div>
  `;
  document.getElementById('logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('condoplus_user');
    window.location.href = 'login.html';
  });
}
document.addEventListener('DOMContentLoaded', () => {
  if(document.getElementById('sidebar')){
    if(!requireLogin()) return;
    renderSidebar();
  }
});
