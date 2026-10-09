// André — Template Method #1
// salvar / listar / excluir têm a ordem fixa aqui. as filhas só preenchem os ganchos (antesDeSalvar etc.)
const Database = require('../db/Database');

class BaseRepository {
  constructor(tabela, ClasseEntidade, { ordem = 'id DESC', filtros = [] } = {}) {
    if (new.target === BaseRepository) {
      throw new Error('BaseRepository é abstrata: crie uma subclasse.');
    }
    this.tabela = tabela;
    this.Entidade = ClasseEntidade;
    this.ordem = ordem;
    this.filtrosPermitidos = filtros; // só essas colunas entram no WHERE, nada de SQL injection
    this.db = Database.getInstance(); // singleton do Babbingtonn
  }

  // os templates (ordem fixa)

  async listar(filtros = {}) {
    const { where, params } = this.montarFiltros(filtros);
    const linhas = await this.db.query(`SELECT * FROM ${this.tabela}${where} ORDER BY ${this.ordem}`, params);
    return linhas.map((linha) => this.paraEntidade(linha));
  }

  async buscarPorId(id) {
    const [linha] = await this.db.query(`SELECT * FROM ${this.tabela} WHERE id = ?`, [id]);
    return linha ? this.paraEntidade(linha) : null;
  }

  async salvar(entidade) {
    entidade.garantirValida(); // 1. valida
    await this.antesDeSalvar(entidade); // 2. gancho
    const dados = entidade.toDB(); // 3. vira colunas
    if (entidade.ehNova()) {
      entidade.id = await this.inserir(dados); // 4. novo? INSERT
    } else {
      await this.atualizar(entidade.id, dados); // já existe? UPDATE
    }
    await this.depoisDeSalvar(entidade); // 5. gancho
    return this.buscarPorId(entidade.id);
  }

  async excluir(id) {
    await this.antesDeExcluir(id); // gancho
    const r = await this.db.query(`DELETE FROM ${this.tabela} WHERE id = ?`, [id]);
    return r.affectedRows > 0;
  }

  novaEntidade(dados = {}) {
    const { id, ...resto } = dados; // se vier id do form, ignora
    return new this.Entidade(resto);
  }

  // ganchos: vazios aqui, a filha preenche se quiser

  async antesDeSalvar(entidade) {}
  async depoisDeSalvar(entidade) {}
  async antesDeExcluir(id) {}

  montarFiltros(filtros = {}) {
    const condicoes = [];
    const params = [];
    for (const campo of this.filtrosPermitidos) {
      const valor = filtros[campo];
      if (valor !== undefined && valor !== '') {
        condicoes.push(`${campo} = ?`);
        params.push(valor);
      }
    }
    return { where: condicoes.length ? ' WHERE ' + condicoes.join(' AND ') : '', params };
  }

  paraEntidade(linha) {
    return new this.Entidade(linha);
  }

  // SQL básico

  async inserir(dados) {
    const colunas = Object.keys(dados);
    const sql = `INSERT INTO ${this.tabela} (${colunas.join(', ')}) VALUES (${colunas.map(() => '?').join(', ')})`;
    const r = await this.db.query(sql, Object.values(dados));
    return r.insertId;
  }

  async atualizar(id, dados) {
    const colunas = Object.keys(dados);
    const sql = `UPDATE ${this.tabela} SET ${colunas.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`;
    await this.db.query(sql, [...Object.values(dados), id]);
  }

  async existeOutro(condicoes, params, idAtual) {  // ajuda dos ganchos: "já tem OUTRO igual?"
    const sql = `SELECT id FROM ${this.tabela} WHERE ${condicoes} AND id <> ? LIMIT 1`;
    const linhas = await this.db.query(sql, [...params, idAtual || 0]);
    return linhas.length > 0;
  }
}

module.exports = BaseRepository;
