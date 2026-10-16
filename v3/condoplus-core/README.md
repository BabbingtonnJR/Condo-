# condoplus-core

Núcleo reutilizável do **Condo+**. Tudo que o sistema tinha de genérico (conexão com o banco, repositório, controller e CRUD REST) foi tirado de dentro do projeto e virou este pacote, que qualquer projeto Node + Express + MySQL pode instalar.

## O que vem no pacote

| Exporta | Padrão | Pra que serve |
| --- | --- | --- |
| `Database` | Singleton | Um pool de conexões só para a aplicação inteira |
| `BaseRepository` | Template Method | `listar`, `buscarPorId`, `salvar`, `excluir` prontos; a filha só preenche os ganchos |
| `BaseController` | Template Method | `manipular()`: executa, responde em JSON e trata erro |
| `CrudController` | — | Cria GET, GET/:id, POST, PUT e DELETE de um recurso numa linha |
| `Entidade` | — | Classe mãe das entidades: campos, conversão, validação, `toDB()` |
| `Conv`, `ehEmail`, `ehDataISO`, `hojeISO` | — | Conversores e validações comuns |
| `ErroValidacao`, `ErroNaoEncontrado`, … | — | Erros que já sabem o status HTTP |
| `log` | — | Log no terminal de quem chamou quem em cada requisição |

## Instalação

A partir do arquivo empacotado (`npm pack`):

```bash
npm install ../pacotes/condoplus-core-1.0.0.tgz
```

## Uso (CRUD completo em poucas linhas)

```js
const express = require('express');
const { Database, Entidade, BaseRepository, CrudController, Conv } = require('condoplus-core');

Database.configurar({ host: 'localhost', user: 'root', password: '', database: 'minha_base' });

class Livro extends Entidade {
  static campos = ['titulo', 'autor'];
  static conversores = { titulo: Conv.texto, autor: Conv.texto };
  validar() { return this.titulo ? [] : ['Informe o título.']; }
}
class LivroRepository extends BaseRepository {
  constructor() { super('livros', Livro); }
}

const router = express.Router();
new CrudController(new LivroRepository(), 'Livro').registrar(router, '/livros');

const app = express();
app.use(express.json());
app.use('/api', router);
app.listen(3000);
```

Pronto: `GET/POST /api/livros` e `GET/PUT/DELETE /api/livros/:id` funcionando, com validação e tratamento de erro.

## Ganchos do BaseRepository

`antesDeSalvar(entidade)`, `depoisDeSalvar(entidade)` e `antesDeExcluir(id)`. Exemplo: impedir reserva duplicada no mesmo dia sobrescrevendo `antesDeSalvar`.

## Testes

```bash
npm test
```

## Versionamento

Segue versionamento semântico (MAJOR.MINOR.PATCH). Veja o `CHANGELOG.md`.
