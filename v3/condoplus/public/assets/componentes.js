// Gabriel — formatação (fmt), etiquetas de status (tag) e o CampoFactory (Factory Method #3)

// formatação
const fmt = {
  data(v){ // "2026-09-10" -> "10/09/2026"
    if(!v) return '—';
    const [a, m, d] = String(v).slice(0, 10).split('-');
    return d ? `${d}/${m}/${a}` : String(v);
  },
  dataHora(v){ // "2026-09-10 08:30:00" -> "10/09/2026 08:30"
    if(!v) return '—';
    const hora = String(v).slice(11, 16);
    return hora ? `${fmt.data(v)} ${hora}` : fmt.data(v);
  },
  moeda(v){
    return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 });
  },
  pct(v){ // 46.8 -> "46,8%" (v4)
    return Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits:1 }) + '%';
  },
  hoje(){
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  },
};

// etiquetas de status: grupo -> valor -> [classe css, texto]
const TAGS = {
  solicitacao: { aberto:['tag-open','Aberto'], progresso:['tag-progress','Em andamento'], concluido:['tag-done','Concluído'] },
  reserva:     { pendente:['tag-open','Pendente'], confirmada:['tag-done','Confirmada'], cancelada:['tag-inactive','Cancelada'] },
  ativo:       { ativo:['tag-done','Ativo'], inativo:['tag-inactive','Inativo'] },
  lancamento:  { pendente:['tag-open','Pendente'], pago:['tag-done','Pago'], vencido:['tag-late','Vencido'] },
  convidado:   { convidado:['tag-open','Convidado'], confirmado:['tag-progress','Confirmado'], presente:['tag-done','Presente'] },
  encomenda:   { 'false':['tag-open','Aguardando retirada'], 'true':['tag-done','Retirada'] },
  vaga:        { livre:['tag-done','Livre'], ocupada:['tag-progress','Ocupada'] },
};
function tag(grupo, valor){
  const chave = (typeof valor === 'boolean' || valor === 0 || valor === 1) ? String(!!valor) : String(valor);
  const [classe, rotulo] = (TAGS[grupo] || {})[chave] || ['tag-progress', valor];
  return `<span class="tag ${classe}">${esc(rotulo)}</span>`;
}

// Factory Method #3: a tela só descreve o campo ({ nome: 'email', tipo: 'email' }) e o CampoFactory cria o objeto certo
// todo campo sabe se desenhar (renderizar), pegar o valor (ler) e se validar
class Campo {
  constructor(def){
    if(new.target === Campo) throw new Error('Campo é abstrato.');
    this.def = def;
    this.nome = def.nome;
    this.rotulo = def.rotulo || def.nome;
    this.placeholder = def.placeholder || '';
    this.ignorarSeVazio = false;
  }
  get idHtml(){ return 'campo-' + this.nome; }
  obrigatorio(modoCriacao){ return !!this.def.obrigatorio || (!!this.def.obrigatorioNaCriacao && modoCriacao); }

  renderizar(valor, pagina, modoCriacao){
    const dica = this.def.dica ? `<div class="field-hint">${esc(this.def.dica)}</div>` : '';
    return `<div class="field">
      <label for="${this.idHtml}">${esc(this.rotulo)}${this.obrigatorio(modoCriacao) ? ' *' : ''}</label>
      ${this.renderizarControle(valor ?? '', pagina)}${dica}
    </div>`;
  }
  renderizarControle(valor, pagina){ throw new Error('renderizarControle() não implementado'); }
  ler(){ return document.getElementById(this.idHtml).value.trim(); }
  validar(valor, modoCriacao){
    if(this.obrigatorio(modoCriacao) && (valor === '' || valor === null)) return `Preencha o campo "${this.rotulo}".`;
    return null;
  }
}

class CampoTexto extends Campo {
  renderizarControle(v){
    const tipo = this.def.tipo === 'email' ? 'email' : 'text';
    return `<input id="${this.idHtml}" type="${tipo}" value="${esc(v)}" placeholder="${esc(this.placeholder)}">`;
  }
  validar(valor, modoCriacao){
    const erro = super.validar(valor, modoCriacao);
    if(erro) return erro;
    if(this.def.tipo === 'email' && valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'Informe um e-mail válido.';
    return null;
  }
}

class CampoSenha extends Campo {
  constructor(def){ super(def); this.ignorarSeVazio = true; } // vazio no editar = fica a senha antiga
  renderizarControle(){
    return `<input id="${this.idHtml}" type="password" autocomplete="new-password" placeholder="${esc(this.placeholder)}">`;
  }
}

class CampoNumero extends Campo {
  renderizarControle(v){
    return `<input id="${this.idHtml}" type="number" step="${this.def.passo || '1'}" min="${this.def.minimo ?? ''}" value="${esc(v)}" placeholder="${esc(this.placeholder)}">`;
  }
  ler(){ const t = super.ler(); return t === '' ? '' : Number(t); }
}

class CampoData extends Campo {
  renderizarControle(v){ return `<input id="${this.idHtml}" type="date" value="${esc(String(v).slice(0,10))}">`; }
}

class CampoAreaTexto extends Campo {
  renderizarControle(v){ return `<textarea id="${this.idHtml}" rows="4" placeholder="${esc(this.placeholder)}">${esc(v)}</textarea>`; }
}

class CampoSelecao extends Campo {
  opcoes(pagina){  // opcoes pode ser ['A','B'], [['valor','Texto']] ou uma função
    const lista = typeof this.def.opcoes === 'function' ? this.def.opcoes(pagina) : (this.def.opcoes || []);
    return lista.map(o => Array.isArray(o) ? o : [o, o]);
  }
  renderizarControle(v, pagina){
    const opts = this.opcoes(pagina).map(([valor, rotulo]) =>
      `<option value="${esc(valor)}" ${String(valor) === String(v) ? 'selected' : ''}>${esc(rotulo)}</option>`).join('');
    return `<select id="${this.idHtml}">${opts}</select>`;
  }
}

class CampoBooleano extends CampoSelecao {
  opcoes(){ return [['false', this.def.rotuloNao || 'Não'], ['true', this.def.rotuloSim || 'Sim']]; }
  renderizarControle(v, pagina){ return super.renderizarControle(String(!!v && v !== 'false' && v !== 0), pagina); }
  ler(){ return super.ler() === 'true'; }
}

const CampoFactory = {
  registro: {
    texto: CampoTexto, email: CampoTexto, senha: CampoSenha, numero: CampoNumero,
    data: CampoData, areatexto: CampoAreaTexto, selecao: CampoSelecao, booleano: CampoBooleano,
  },
  criar(def){  // a fábrica em si
    const Classe = this.registro[def.tipo || 'texto'];
    if(!Classe) throw new Error(`Tipo de campo desconhecido: ${def.tipo}`);
    return new Classe(def);
  },
};
