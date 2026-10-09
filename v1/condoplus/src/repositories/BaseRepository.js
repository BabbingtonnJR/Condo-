const Database = require('../db/Database');

/**
 * ============================================================
 * PADRÃO TEMPLATE METHOD — exemplo 1: BaseRepository
 * ============================================================
 * Define o ESQUELETO de acesso ao banco que TODAS as tabelas seguem.
 *
 * Os métodos-modelo (template methods) são:
 *   - salvar(entidade)  -> validar → antesDeSalvar → inserir/atualizar → depoisDeSalvar
 *   - listar(filtros)   -> montarFiltros → SELECT → paraEntidade
 *   - excluir(id)       -> antesDeExcluir → DELETE
 *
 * A ORDEM dos passos é fixa e fica aqui. As subclasses NÃO reescrevem
 * salvar/listar/excluir — elas só sobrescrevem os "ganchos" (hooks):
 *   antesDeSalvar, depoisDeSalvar, antesDeExcluir, montarFiltros, paraEntidade.
 *
 * Resultado: o SQL de CRUD é escrito uma única vez e reaproveitado
 * pelas 13 tabelas do sistema.
 */
class BaseRepository {
  constructor(tabela, ClasseEntidade, { ordem = 'id DESC', filtros = [] } = {}) {
    if (new.target === BaseRepository) {
      throw new Error('BaseRepository é abstrata: crie uma subclasse.');
    }
    this.tabela = tabela;
    this.Entidade = ClasseEntidade;
    this.ordem = ordem;
    this.filtrosPermitidos = filtros; // só estas colunas podem ir no WHERE (evita SQL injection)
    this.db = Database.getInstance(); // usa o Singleton
  }

  /* ------------------- MÉTODOS-MODELO (fixos) ------------------- */

  async listar(filtros = {}) {
    const { where, params } = this.montarFiltros(filtros);          // passo 1 (gancho)
    const sql = `SELECT * FROM ${this.tabela}${where} ORDER BY ${this.ordem}`;
    const linhas = await this.db.query(sql, params);                 // passo 2 (fixo)
    return linhas.map((linha) => this.paraEntidade(linha));          // passo 3 (gancho)
  }

  async buscarPorId(id) {
    const [linha] = await this.db.query(`SELECT * FROM ${this.tabela} WHERE id = ?`, [id]);
    return linha ? this.paraEntidade(linha) : null;
  }

  async salvar(entidade) {
    entidade.garantirValida();                                       // passo 1 (fixo)
    await this.antesDeSalvar(entidade);                              // passo 2 (gancho)
    const dados = entidade.toDB();                                   // passo 3 (fixo)
    if (entidade.ehNova()) {
      entidade.id = await this.inserir(dados);                       // passo 4a (fixo)
    } else {
      await this.atualizar(entidade.id, dados);                      // passo 4b (fixo)
    }
    await this.depoisDeSalvar(entidade);                             // passo 5 (gancho)
    return this.buscarPorId(entidade.id);                            // devolve como ficou no banco
  }

  async excluir(id) {
    await this.antesDeExcluir(id);                                   // passo 1 (gancho)
    const r = await this.db.query(`DELETE FROM ${this.tabela} WHERE id = ?`, [id]); // passo 2
    return r.affectedRows > 0;
  }

  /** Cria uma entidade nova a partir dos dados do formulário (ignora id enviado). */
  novaEntidade(dados = {}) {
    const { id, ...resto } = dados;
    return new this.Entidade(resto);
  }

  /* ------------------- GANCHOS (padrão = não faz nada) ------------------- */

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

  /* ------------------- operações primitivas ------------------- */

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

  /** Helper para os ganchos: existe outro registro com estas condições? */
  async existeOutro(condicoes, params, idAtual) {
    const sql = `SELECT id FROM ${this.tabela} WHERE ${condicoes} AND id <> ? LIMIT 1`;
    const linhas = await this.db.query(sql, [...params, idAtual || 0]);
    return linhas.length > 0;
  }
}

module.exports = BaseRepository;
