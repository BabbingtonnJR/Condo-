# Questão 1 — Classes e padrões de projeto (Opção 01)

Este arquivo é o guia de estudo da equipe para a prova de autoria. Todo mundo precisa saber
explicar **todos** os padrões, então leiam inteiro, abram os arquivos citados e rodem o sistema.

---

## 1. As classes principais (mínimo pedido: 10 — temos mais de 30)

### Classes de domínio (`src/models/`) — 13 classes + a base

Todas herdam de `Entidade`. Os **atributos** de cada uma estão declarados em `static campos`
(e `static somenteLeitura` para datas que o banco preenche). Os **métodos** são as regras de negócio.

| Classe | Tabela | Atributos principais | Métodos de negócio |
|---|---|---|---|
| `Entidade` (abstrata) | — | `id` | `validar()`, `garantirValida()`, `ehNova()`, `atualizarCom()`, `toDB()` |
| `Usuario` | usuarios | nome, email, senha, perfil, unidade, condominio_id, status | `ehAtivo()`, `possuiPerfil()`, `conferirSenha()`, `toPublico()` |
| `Condominio` | condominios | nome, endereco, unidades, sindico_nome, tipo, modulos | `temModulo()`, `modulosAtivos()`, `alterarModulo()` |
| `Morador` | moradores | nome, unidade, email, status, condominio_id | `ehAtivo()`, `alternarStatus()` |
| `Comunicado` | comunicados | titulo, corpo, condominio_id, publicado_em | `resumo()` |
| `Solicitacao` | solicitacoes | unidade, titulo, categoria, status, prestador_nome | `estaConcluida()`, `atribuirPrestador()`, `alterarStatus()` |
| `Documento` | documentos | nome, tipo, condominio_id, publicado_em | `ehPDF()` |
| `Lancamento` | financeiro | unidade, referencia, valor, vencimento, status | `estaPago()`, `estaVencido()`, `marcarComoPago()` |
| `Reserva` | reservas | area, data_reserva, hora, morador, status | `estaAtiva()`, `confirmar()`, `cancelar()` |
| `Encomenda` | encomendas | morador, unidade, descricao, retirado | `estaPendente()`, `registrarRetirada()` |
| `Visitante` | visitantes | nome, documento, unidade, horario | `descricao()` |
| `Chamado` | chamados | usuario, assunto, status, escalado | `escalar()`, `resolver()` |
| `Vaga` | vagas_estacionamento | codigo, data_reserva, reservado_por | `estaLivre()`, `reservar()`, `liberar()` |
| `Convidado` | convidados_evento | evento, convidado, responsavel, status | `avancarStatus()` |

Exemplo de regra de negócio que mora **na classe**, não na rota:

```js
// src/models/Lancamento.js
marcarComoPago() {
  if (this.estaPago()) throw new ErroValidacao('Este lançamento já está pago.');
  this.status = 'pago';
  return this;
}
```

### Classes de infraestrutura

| Camada | Classes |
|---|---|
| Configuração / banco | `AppConfig`, `Database` |
| Repositórios | `BaseRepository` + 13 repositórios concretos, `RepositoryFactory` |
| Fábrica de clientes | `ConfiguracaoCondominio`, `CondominioCreator`, `ResidencialCreator`, `ComercialCreator`, `ClubeCreator` |
| Controllers | `BaseController`, `CrudController`, `CondominioController`, `AuthController` |
| Erros | `ErroAplicacao`, `ErroValidacao`, `ErroNaoEncontrado`, `ErroAutenticacao` |
| Front-end | `BasePage`, `CrudPage`, `Campo` + 7 tipos de campo |

---

## 2. Singleton — 2 exemplos

**O que é:** garante que uma classe tenha **uma única instância** e oferece um ponto global de acesso a ela.

**Como reconhecer no código:** atributo estático privado `#instancia`, método `getInstance()` e
construtor que lança erro se já existir instância.

### Exemplo 1 — `AppConfig` (`src/config/AppConfig.js`)
Lê o `.env` **uma vez** e todo o sistema usa a mesma configuração (porta, dados do banco).

### Exemplo 2 — `Database` (`condoplus-core/lib/Database.js`)
Mantém **um único pool** de conexões com o MySQL. Os 13 repositórios chamam
`Database.getInstance()` e compartilham o mesmo pool.

```js
static getInstance() {
  if (!Database.#instancia) Database.#instancia = new Database();
  return Database.#instancia;
}
```

**Por que é reuso?** A conexão é criada num lugar só e reaproveitada por todas as classes,
em vez de cada rota abrir a sua.

**Detalhe para comentar na prova:** o `Database` usa o outro Singleton (`AppConfig`) para saber
os dados de conexão. Um Singleton depende do outro.

---

## 3. Template Method — 3 exemplos

**O que é:** a classe-mãe define o **esqueleto de um algoritmo** (a ordem dos passos) num método,
e deixa alguns passos para as subclasses implementarem ou personalizarem (os "ganchos" / hooks).
A subclasse **não muda a ordem**, só o conteúdo de alguns passos.

### Exemplo 1 — `BaseRepository.salvar()` (`condoplus-core/lib/BaseRepository.js`)

```
salvar(entidade):
  1. entidade.garantirValida()      fixo
  2. antesDeSalvar(entidade)        GANCHO
  3. entidade.toDB()                fixo
  4. inserir() ou atualizar()       fixo
  5. depoisDeSalvar(entidade)       GANCHO
```

Quem sobrescreve os ganchos:
- `UsuarioRepository.antesDeSalvar` → impede e-mail repetido
- `ReservaRepository.antesDeSalvar` → impede duas reservas da mesma área no mesmo dia
- `LancamentoRepository.antesDeSalvar` → impede dois boletos da mesma referência para a mesma unidade
- `VagaRepository.antesDeSalvar` → impede vaga com código repetido no mesmo dia
- `CondominioRepository.antesDeExcluir` → impede excluir condomínio com pessoas vinculadas

`listar()` e `excluir()` também são métodos-modelo (ganchos `montarFiltros`, `paraEntidade`, `antesDeExcluir`).

### Exemplo 2 — `BaseController.manipular()` (`condoplus-core/lib/BaseController.js`)

```
manipular(operacao):
  1. executar a operação          parte variável
  2. formatar(resultado)          GANCHO
  3. responder com status         fixo
  4. tratarErro (400/401/404/500) fixo
```

`CondominioController` sobrescreve o gancho `formatar()` para acrescentar os rótulos do tipo de
condomínio em cada resposta. Antes, cada rota tinha seu próprio `try/catch` (ou nenhum, e o
servidor ficava sem responder quando o banco dava erro).

### Exemplo 3 — `BasePage.iniciar()` (`public/assets/BasePage.js`, front-end)

```
iniciar():
  1. conferir login                       fixo
  2. montar esqueleto da página           fixo
  3. atualizar sessão (módulos)           fixo
  4. verificar acesso à tela              fixo
  5. desenhar menu lateral                fixo
  6. carregarDados()                      ABSTRATO
  7. renderizarConteudo(dados)            ABSTRATO
  8. aoRenderizar()                       GANCHO
```

Exemplos de subclasses: `InicioMorador` (morador-inicio.html), `PainelSindico`
(sindico-painel.html), `ModulosAdministradora` (administradora-modulos.html) e a `CrudPage`,
que implementa os passos 6 e 7 de forma genérica para todas as telas de CRUD.

**Por que é reuso?** O fluxo comum é escrito uma vez. Uma tela nova só implementa o que é
dela (que dados buscar e como mostrar).

---

## 4. Factory Method — 3 exemplos (o "novo padrão" da Opção 01)

**O que é:** um método que **cria objetos** sem que quem pede precise saber a classe concreta.
Na forma clássica (GoF), uma classe abstrata declara o método de fábrica e cada subclasse decide
qual objeto criar. Há também a variante **parametrizada**, em que um parâmetro escolhe a classe.

### Exemplo 1 — `CondominioCreator` (`src/factories/CondominioFactory.js`) — forma clássica

| Papel no padrão | Classe |
|---|---|
| Produto | `ConfiguracaoCondominio` |
| Criador abstrato | `CondominioCreator` (declara `criarConfiguracao()`) |
| Criadores concretos | `ResidencialCreator`, `ComercialCreator`, `ClubeCreator` |

Cada criador concreto devolve uma configuração diferente: módulos ligados e rótulos da tela
("Moradores"/"Colaboradores"/"Sócios", "Unidade"/"Sala/Andar"/"Título").
O método `novoCondominio()` do criador abstrato usa o factory method sem saber qual subclasse
está rodando. É usado quando a administradora cadastra um condomínio e no login.

**Este é o exemplo que liga o padrão à variabilidade:** para atender um novo tipo de cliente
(ex.: coworking) basta criar `CoworkingCreator`. Nenhuma tela ou rota muda.

### Exemplo 2 — `RepositoryFactory.criar(nome)` (`src/repositories/RepositoryFactory.js`) — parametrizado

As rotas pedem `RepositoryFactory.criar('moradores')` e recebem um `MoradorRepository` sem
importar a classe. A fábrica também guarda as instâncias já criadas.

Bônus: `CrudController.criarEntidade()` é um factory method que o `CondominioController`
sobrescreve para delegar ao `CondominioCreator`.

### Exemplo 3 — `CampoFactory.criar(def)` (`public/assets/componentes.js`, front-end)

As telas descrevem campos só com dados:

```js
{ nome: 'email', rotulo: 'E-mail', tipo: 'email', obrigatorio: true }
```

e a fábrica devolve o objeto certo: `CampoTexto`, `CampoSenha`, `CampoNumero`, `CampoData`,
`CampoAreaTexto`, `CampoSelecao` ou `CampoBooleano`. Todos herdam de `Campo` e sabem se
desenhar (`renderizar`), ler o valor (`ler`) e se validar (`validar`).

---

## 5. Perguntas prováveis na prova (e como responder)

**"Qual a diferença entre Singleton e uma variável global?"**
O Singleton controla a criação (cria só quando precisa, na primeira chamada) e impede uma segunda
instância. Uma variável global pode ser sobrescrita por qualquer parte do código.

**"Mostre o Template Method. Onde está o 'template'?"**
É o método que fixa a ordem: `salvar()` no `BaseRepository`. Mostre os ganchos `antesDeSalvar`
vazios na base e preenchidos no `ReservaRepository`.

**"O que aconteceria sem o Template Method no repositório?"**
Cada uma das 13 tabelas teria seu próprio INSERT/UPDATE/DELETE escrito à mão (era assim no `api.js`
antigo, com 289 linhas). Uma correção teria que ser repetida em 13 lugares.

**"Por que o Factory Method ajuda na linha de produto?"**
Porque o ponto de variação (tipo de cliente) fica isolado em classes criadoras. Um tipo novo de
cliente é uma classe nova, sem mexer no código que já funciona (aberto para extensão, fechado
para modificação).

**"Qual a diferença entre Factory Method e Template Method?"**
Template Method define **uma sequência de passos** (comportamento). Factory Method define
**quem cria qual objeto** (criação). Um é padrão comportamental e o outro é criacional.

**"Mostre uma regra de negócio dentro de uma classe."**
`Vaga.reservar()` não deixa reservar vaga ocupada; `Chamado.escalar()` não deixa escalar chamado
concluído. A rota só chama o método: `crud('vagas').acao('reservar', (v, b) => v.reservar(...))`.
