# Quem fez o quê

Todo arquivo começa com um comentário com o nome de quem fez, tipo `// Gabriel — ...`.
Para achar as partes de alguém, busque no VS Code (Ctrl+Shift+F) por `// Gabriel —` (ou o nome que quiser).

## Babbingtonn — Singleton, servidor e banco

| Parte | Arquivos |
|---|---|
| **Singleton** (2 exemplos) | `src/config/AppConfig.js`, `condoplus-core/lib/Database.js` |
| Servidor e erros | `server.js`, `condoplus-core/lib/erros.js` |
| Banco | `db/schema.sql`, `db/seed.sql` |
| Classes | `Morador`, `Comunicado`, `Solicitacao` (`src/models/`) |
| **CRUDs** | Moradores (`sindico-moradores.html`), Comunicados (`sindico-comunicados.html`) |
| Outras telas | `morador-comunicados`, `morador-solicitacoes`, `sindico-solicitacoes`, `prestador-solicitacoes` |
| Demonstração | `demo-padroes.js` |

## André — Template Method no back-end

| Parte | Arquivos |
|---|---|
| **Template Method** 1 e 2 | `condoplus-core/lib/BaseRepository.js`, `condoplus-core/lib/BaseController.js` |
| Filhas do Template Method | `src/repositories/Repositorios.js` (13 repositórios), `condoplus-core/lib/CrudController.js` |
| Base das classes e rotas | `condoplus-core/lib/Entidade.js`, `condoplus-core/lib/conversores.js`, `src/models/index.js`, `src/routes/api.js` |
| Classes | `Documento`, `Lancamento`, `Reserva` |
| **CRUDs** | Documentos (`sindico-documentos.html`), Financeiro (`sindico-financeiro.html`) |
| Outras telas | `morador-documentos`, `morador-financeiro`, `sindico-reservas`, `morador-reservas` |

## Marcel — Template Method no front-end

| Parte | Arquivos |
|---|---|
| **Template Method** 3 | `public/assets/BasePage.js` (`BasePage` e `CrudPage`) |
| Base do front | `public/assets/common.js`, `public/assets/style.css`, `login.html`, `recuperar-senha.html`, `index.html` |
| Classes | `Encomenda`, `Visitante`, `Chamado` |
| **CRUDs** | Encomendas (`porteiro-encomendas.html`), Visitantes (`porteiro-visitantes.html`) |
| Outras telas | `morador-encomendas`, `morador-inicio`, `suporte-chamados` |

## Gabriel — Factory Method e variabilidade

| Parte | Arquivos |
|---|---|
| **Factory Method** (3 exemplos) | `src/factories/CondominioFactory.js`, `src/repositories/RepositoryFactory.js`, `public/assets/componentes.js` (`CampoFactory`) |
| Controllers | `src/controllers/CondominioController.js`, `src/controllers/AuthController.js` |
| Classes | `Usuario`, `Condominio`, `Vaga`, `Convidado` |
| **CRUDs** | Condomínios (`administradora-condominios.html`), Usuários (`administradora-usuarios.html`) |
| Variabilidade | `administradora-modulos`, `sindico-estacionamento` (comercial), `sindico-convidados` (clube), `sindico-painel` |
| Outras telas | `administradora-painel` |

## v4 — Relatórios (Saídas Externas da contagem de PF)

| SE | Tela | Back-end | Quem |
|---|---|---|---|
| — | base das telas: `public/assets/RelatorioPage.js` | base: `src/relatorios/BaseRelatorio.js` (Template Method #4) + `src/controllers/RelatorioController.js` | Babbingtonn |
| — | — | `src/relatorios/RelatorioFactory.js` (Factory Method #4) | Gabriel |
| SE01 | `sindico-inadimplencia.html` | `RelatorioInadimplencia.js` | André |
| SE02 | `sindico-demonstrativo.html` + resumo em `morador-financeiro.html` | `RelatorioDemonstrativo.js` | André |
| SE03 | `sindico-indicadores.html` | `RelatorioSolicitacoes.js` | Babbingtonn |
| SE04 | `sindico-ocupacao.html` (só com módulo de reservas) | `RelatorioOcupacao.js` | Gabriel |
| SE05 | `suporte-prazos.html` | `RelatorioPrazoChamados.js` | Marcel |
| SE06 | `administradora-painel.html` (substituiu o painel antigo) | `RelatorioPainelAdministradora.js` | Gabriel |

Também mudou na v4: `chamados.condominio_id` (schema, model `Chamado`, select na `suporte-chamados.html`), seção "Relatórios" no menu (`common.js`), `fmt.pct` (`componentes.js`) e o seed com datas relativas ao dia de hoje.

## v5 — Consultas (CEs, 2 por integrante)

| CE | Tela | Back-end | Quem |
|---|---|---|---|
| — | base: `public/assets/ConsultaPage.js` | base: `src/consultas/BaseConsulta.js` (Template Method #5) + `src/controllers/ConsultaController.js` | Babbingtonn |
| — | — | `src/consultas/ConsultaFactory.js` (Factory Method #5) | Gabriel |
| CE01 | `consulta-moradores.html` | `ConsultaMoradorUnidade.js` | Babbingtonn |
| CE02 | `consulta-solicitacoes.html` | `ConsultaSolicitacoes.js` | Babbingtonn |
| CE03 | `consulta-boletos.html` | `ConsultaBoletos.js` | André |
| CE04 | `consulta-reservas.html` (só com módulo de reservas) | `ConsultaReservas.js` | André |
| CE05 | `consulta-chamados.html` | `ConsultaChamados.js` | Marcel |
| CE06 | `consulta-comunicados.html` | `ConsultaComunicados.js` | Marcel |
| CE07 | `consulta-condominios.html` | `ConsultaCondominios.js` | Gabriel |
| CE08 | `consulta-usuarios.html` | `ConsultaUsuarios.js` | Gabriel |

## v6 — Empacotamento

| Parte | Arquivos | Quem |
|---|---|---|
| Pacote `condoplus-core` (package.json, index.js, README, CHANGELOG, LICENSE, testes) | `../condoplus-core/` | Babbingtonn |
| Classes que foram pro pacote | `Database`, `log`, `erros` (Babbingtonn); `BaseRepository`, `BaseController`, `CrudController`, `Entidade`, `conversores` (André) | — |
| Projeto de exemplo reusando o pacote | `../exemplo-reuso/` | Babbingtonn |

## Como as partes se ligam

```
tela (CRUD de cada um)
  └─ CrudPage / BasePage ............ Marcel   (Template Method 3)
       └─ CampoFactory .............. Gabriel  (Factory Method 3)
            │  fetch('/api/...')
            ▼
routes/api.js ....................... André
  └─ RepositoryFactory .............. Gabriel  (Factory Method 2)
  └─ CrudController / BaseController  André    (Template Method 2)
       └─ CondominioController ...... Gabriel  (usa o Factory Method 1)
            ▼
BaseRepository + 13 repositórios .... André    (Template Method 1)
  └─ classes (Morador, Vaga...) ..... cada um as suas
       ▼
Database / AppConfig ................ Babbingtonn (Singleton)
```

Todos precisam saber explicar **os três padrões**, não só o próprio. Abram o arquivo do colega
e leiam o cabeçalho: ele diz em poucas linhas o que a parte faz e como usar.
