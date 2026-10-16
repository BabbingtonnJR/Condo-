// Babbingtonn — mãe das consultas (as CEs da contagem de pontos de função)
// Template Method de novo: executar() = validar entrada > buscar no banco > montar a saída
// diferença pro relatório (SE): aqui NÃO tem calcular(). a CE só devolve o que tá gravado, sem conta nenhuma
const { Database } = require('condoplus-core');
const { log } = require('condoplus-core');
const { ErroValidacao } = require('condoplus-core');

class BaseConsulta {
  static codigo = 'CE';
  static titulo = '';
  static entradas = [];   // [{ nome, rotulo, obrigatorio }] o que o usuário digita/escolhe na tela
  static fixos = [];      // filtros que a tela manda sozinha (ex.: condomínio do síndico), não são DET

  constructor() {
    if (new.target === BaseConsulta) throw new Error('BaseConsulta é abstrata: crie uma subclasse.');
    this.db = Database.getInstance(); // singleton do banco
  }

  async executar(parametros = {}) {  // o template: essa ordem não muda
    const C = this.constructor;
    log.registrar('CONSUL', `${C.name}.executar()  (${C.codigo}, Template Method: entrada > buscar > montar, sem cálculo)`);
    const e = this.validarEntrada(parametros);  // 1. fixo + gancho
    const [sql, valores] = this.montarSQL(e);   // 2. a filha que faz
    const linhas = await this.db.query(sql, valores); // 3. fixo
    return this.montar(linhas, e);              // 4. fixo
  }

  validarEntrada(p) {
    const C = this.constructor;
    const e = {};
    for (const nome of [...C.entradas.map((x) => x.nome), ...C.fixos]) {
      const v = p[nome];
      if (v !== undefined && v !== null && String(v).trim() !== '') e[nome] = String(v).trim();
    }
    const faltando = C.entradas.filter((x) => x.obrigatorio && !e[x.nome]).map((x) => `Informe ${x.rotulo.toLowerCase()}.`);
    const fixosFaltando = C.fixos.filter((n) => !e[n]).map((n) => `Faltou o parâmetro ${n}.`);
    if (faltando.length || fixosFaltando.length) throw new ErroValidacao([...faltando, ...fixosFaltando]);
    return this.ajustarEntrada(e);
  }

  ajustarEntrada(e) { return e; }  // gancho
  montarSQL() { throw new Error(`${this.constructor.name} precisa implementar montarSQL().`); }

  montar(linhas, e) {
    const C = this.constructor;
    return { codigo: C.codigo, titulo: C.titulo, entrada: e, linhas };
  }

  // ajudante: junta os "AND" só dos filtros que vieram
  static onde(partes) {
    const usados = partes.filter(([, valor]) => valor !== undefined);
    return [usados.length ? ' WHERE ' + usados.map(([cond]) => cond).join(' AND ') : '', usados.flatMap(([, valor]) => valor)];
  }
}

module.exports = BaseConsulta;
