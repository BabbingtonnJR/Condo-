// Babbingtonn — testes rápidos do pacote (não precisam de banco)
const test = require('node:test');
const assert = require('node:assert');
const core = require('..');

class Livro extends core.Entidade {
  static campos = ['titulo', 'paginas'];
  static conversores = { titulo: core.Conv.texto, paginas: core.Conv.inteiro };
  validar() { return this.titulo ? [] : ['Informe o título.']; }
}

test('exporta as peças principais', () => {
  for (const nome of ['Database', 'BaseRepository', 'BaseController', 'CrudController', 'Entidade', 'ErroValidacao', 'Conv', 'log']) {
    assert.ok(core[nome], `faltou ${nome}`);
  }
});

test('Entidade converte e valida', () => {
  const l = new Livro({ titulo: '  Dom Casmurro ', paginas: '256' });
  assert.strictEqual(l.titulo, 'Dom Casmurro');
  assert.strictEqual(l.paginas, 256);
  assert.deepStrictEqual(l.toDB(), { titulo: 'Dom Casmurro', paginas: 256 });
  assert.throws(() => new Livro({}).garantirValida(), core.ErroValidacao);
});

test('classes abstratas não deixam dar new direto', () => {
  assert.throws(() => new core.Entidade({}));
  assert.throws(() => new core.BaseController());
});

test('Database exige configurar() antes e é Singleton', async () => {
  await assert.rejects(() => core.Database.getInstance().query('SELECT 1'), /configurar/);
  core.Database.configurar({ host: 'localhost', user: 'x', password: '', database: 'y' });
  assert.strictEqual(core.Database.getInstance(), core.Database.getInstance());
  return core.Database.getInstance().fechar();
});

test('ErroValidacao já vem com status 400', () => {
  assert.strictEqual(new core.ErroValidacao('x').status, 400);
});
