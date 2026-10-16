// Babbingtonn — prova do reuso: outro sistema (uma biblioteca) usando o pacote condoplus-core
// nenhum arquivo do Condo+ foi copiado pra cá, só instalamos o pacote: npm install
const express = require('express');
const { Database, Entidade, BaseRepository, CrudController, Conv, log, versao } = require('condoplus-core');

Database.configurar({  // Singleton do pacote: só falta dizer qual banco usar
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '', // XAMPP: root sem senha. se o seu tem senha: set DB_PASSWORD=...
  database: 'exemplo_reuso',
});
log.configurar({ ligado: true });

class Livro extends Entidade {  // a classe só diz os campos e a validação
  static campos = ['titulo', 'autor', 'ano'];
  static conversores = { titulo: Conv.texto, autor: Conv.texto, ano: Conv.inteiro };
  validar() {
    const erros = [];
    if (!this.titulo) erros.push('Informe o título.');
    if (!this.autor) erros.push('Informe o autor.');
    return erros;
  }
}

class LivroRepository extends BaseRepository {  // Template Method: herda salvar/listar/excluir
  constructor() { super('livros', Livro, { ordem: 'titulo', filtros: ['autor'] }); }
}

const router = express.Router();
new CrudController(new LivroRepository(), 'Livro').registrar(router, '/livros'); // CRUD inteiro numa linha

const app = express();
app.use(express.json());
app.use('/api', log.iniciar, router);
app.listen(4000, () => console.log(`Biblioteca rodando em http://localhost:4000/api/livros (condoplus-core v${versao})`));
