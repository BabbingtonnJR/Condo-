// Babbingtonn — mãe dos relatórios (as SEs da contagem de pontos de função)
// mais um Template Method: todo relatório segue gerar() = filtros > buscar > calcular > montar
// a filha só escreve buscarDados() e calcular(); os números calculados (dado derivado) é o que faz ser SE
const { Database } = require('condoplus-core');
const { log } = require('condoplus-core');
const { ErroValidacao } = require('condoplus-core');

class BaseRelatorio {
  static codigo = 'SE';
  static titulo = '';

  constructor() {
    if (new.target === BaseRelatorio) throw new Error('BaseRelatorio é abstrata: crie uma subclasse.');
    this.db = Database.getInstance(); // singleton do banco
  }

  async gerar(filtros = {}) {  // o template: essa ordem não muda
    const C = this.constructor;
    log.registrar('RELAT', `${C.name}.gerar()  (${C.codigo}, Template Method: filtros > buscar > calcular > montar)`);
    const f = this.validarFiltros({ ...filtros });   // 1. gancho
    f.agora = await this.agoraDoBanco();            // 2. relógio do banco, pra conta bater com o SQL
    const dados = await this.buscarDados(f);        // 3. a filha que faz
    const resultado = this.calcular(dados, f);      // 4. a filha que faz (aqui nasce o dado derivado)
    return this.montar(resultado, f);               // 5. fixo
  }

  validarFiltros(f) { return f; }  // gancho, a filha mexe se precisar
  async buscarDados() { throw new Error(`${this.constructor.name} precisa implementar buscarDados().`); }
  calcular() { throw new Error(`${this.constructor.name} precisa implementar calcular().`); }

  montar(resultado, f) {
    const { agora, ...filtros } = f;
    return { codigo: this.constructor.codigo, titulo: this.constructor.titulo, geradoEm: agora.texto, filtros, ...resultado };
  }

  // ---------- ajudantes que as filhas usam ----------

  exigirCondominio(f) {
    f.condominio_id = Number(f.condominio_id);
    if (!f.condominio_id) throw new ErroValidacao('Informe o condomínio do relatório.');
    return f;
  }

  async buscarCondominio(id) {
    const [c] = await this.db.query('SELECT id, nome, unidades, tipo, modulos FROM condominios WHERE id = ?', [id]);
    if (!c) throw new ErroValidacao('Condomínio não encontrado.');
    c.modulos = typeof c.modulos === 'string' ? JSON.parse(c.modulos) : (c.modulos || {});
    return c;
  }

  async agoraDoBanco() {
    const [r] = await this.db.query("SELECT DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') AS agora");
    return { texto: r.agora, dia: r.agora.slice(0, 10), ms: BaseRelatorio.paraMs(r.agora) };
  }

  static paraMs(texto) {  // "2026-10-14 13:05:00" -> milissegundos (sem confusão de fuso)
    const [d, h = '00:00:00'] = String(texto).split(' ');
    const [a, m, dd] = d.split('-').map(Number);
    const [hh, mi, ss] = h.split(':').map(Number);
    return Date.UTC(a, m - 1, dd, hh, mi, ss || 0);
  }

  static dias(de, ate) { return Math.floor((BaseRelatorio.paraMs(ate) - BaseRelatorio.paraMs(de)) / 86400000); }
  static horas(de, ate) { return Math.floor((BaseRelatorio.paraMs(ate) - BaseRelatorio.paraMs(de)) / 3600000); }
  static dinheiro(v) { return Math.round(Number(v) * 100) / 100; }
  static pct(parte, todo) { return todo ? Math.round((parte / todo) * 1000) / 10 : 0; } // 1 casa, ex.: 12.5
}

module.exports = BaseRelatorio;
