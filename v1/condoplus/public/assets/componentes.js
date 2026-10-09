/* =====================================================================
 * COMPONENTES REAPROVEITÁVEIS DO FRONT-END
 * Antes, cada tela tinha sua própria função tagStatus(), sua formatação
 * de data e seu HTML de formulário. Agora tudo isso existe UMA vez aqui.
 * ===================================================================== */

/* ---------- Formatação ---------- */
const fmt = {
  /** "2026-09-10" ou "2026-09-10 08:30:00" -> "10/09/2026" */
  data(v){
    if(!v) return '—';
    const [a, m, d] = String(v).slice(0, 10).split('-');
    return d ? `${d}/${m}/${a}` : String(v);
  },
  /** "2026-09-10 08:30:00" -> "10/09/2026 08:30" */
  dataHora(v){
    if(!v) return '—';
    const hora = String(v).slice(11, 16);
    return hora ? `${fmt.data(v)} ${hora}` : fmt.data(v);
  },
  moeda(v){
    return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 });
  },
  /** Data de hoje (fuso local) em AAAA-MM-DD */
  hoje(){
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  },
};

/* ---------- Tags de status (uma tabela para o sistema inteiro) ---------- */
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

/* =====================================================================
 * PADRÃO FACTORY METHOD — exemplo 3: CampoFactory (front-end)
 * ---------------------------------------------------------------------
 * Produto abstrato .... Campo
 * Produtos concretos .. CampoTexto, CampoSenha, CampoNumero, CampoData,
 *                       CampoAreaTexto, CampoSelecao, CampoBooleano
 * Fábrica ............. CampoFactory.criar(definicao)
 *
 * As telas descrevem os campos só com dados, ex.:
 *     { nome:'email', rotulo:'E-mail', tipo:'email', obrigatorio:true }
 * e a fábrica decide qual classe instanciar. Toda classe concreta sabe
 * se desenhar (renderizar), ler o valor digitado (ler) e se validar.
 * Para um tipo novo de campo (ex.: CPF com máscara), basta uma classe
 * nova e uma linha no registro — nenhuma tela muda.
 * ===================================================================== */
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
  /** Cada subclasse desenha o seu controle. */
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
  constructor(def){ super(def); this.ignorarSeVazio = true; } // vazio na edição = mantém a senha atual
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
  /** opcoes pode ser ['A','B'], [['valor','Rótulo'], ...] ou uma função (pagina) => lista */
  opcoes(pagina){
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
  /** O método de fábrica: recebe a descrição do campo e devolve o objeto certo. */
  criar(def){
    const Classe = this.registro[def.tipo || 'texto'];
    if(!Classe) throw new Error(`Tipo de campo desconhecido: ${def.tipo}`);
    return new Classe(def);
  },
};
