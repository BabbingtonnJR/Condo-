# Questão 3 — Repositório e compactação de código focada em reuso

## A técnica usada

**Extração de componentes genéricos reaproveitáveis** (refatoração para eliminar código duplicado),
aplicada em três camadas:

| Camada | Antes (duplicado) | Depois (componente reaproveitável) |
|---|---|---|
| Rotas da API | Um bloco de SQL à mão para cada tabela em `routes/api.js` (289 linhas, ~30 endpoints, quase nenhum com tratamento de erro) | `BaseRepository` + `CrudController`: **uma linha por recurso** em `src/routes/api.js` (36 linhas, 77 endpoints, todos com tratamento de erro) |
| Telas | Cada HTML repetia o esqueleto da página, o `DOMContentLoaded`, o modal, o formulário e as funções de tag (8 cópias de `tagStatus`) | `BasePage`, `CrudPage`, `CampoFactory` e `tag()`: uma tela de CRUD vira só a **descrição** de colunas e campos |
| Entidades | (não existiam) | `Entidade` base: construtor, atualização e conversão para SQL escritos uma vez para as 13 classes |

### Números para mostrar no vídeo

| Medida | Antes | Depois |
|---|---|---|
| Linhas do arquivo de rotas | 289 | 36 |
| Endpoints da API | ~30 | 77 |
| Telas com CRUD completo (criar, consultar, editar, excluir) | 1 | 12 |
| Linhas da tela de moradores | 103 | 48 (e ganhou "Excluir") |
| Arquivos com função de tag duplicada | 8 | 0 |

Comandos para medir ao vivo (rodar na pasta do projeto):

```bash
git show v1:routes/api.js | wc -l        # antes
wc -l src/routes/api.js                  # depois
git diff --stat v1 v2                    # resumo das mudanças
```

---

## Passo a passo do repositório (fazer ANTES de gravar)

A ideia é ter no Git a versão **antes** e a versão **depois**, para o vídeo mostrar a diferença.

1. Criem um repositório vazio no GitHub (ex.: `condoplus`).
2. Na pasta do projeto **antigo** (a que vocês já tinham):

   ```bash
   git init
   git add .
   git commit -m "v1: versão original, antes da compactação"
   git tag v1
   git branch -M main
   git remote add origin https://github.com/USUARIO/condoplus.git
   git push -u origin main --tags
   ```

   Confiram se o `.gitignore` tem `node_modules/` e `.env` antes do primeiro commit.
3. Apaguem as pastas `routes/`, `db/` e `public/` antigas e o `server.js`, e copiem por cima
   todo o conteúdo desta versão nova (`src/`, `db/`, `public/`, `docs/`, `server.js`,
   `package.json`, `.gitignore`, `.env.example`, `README.md`).
4. Façam commits **em etapas**, que viram os capítulos do vídeo:

   ```bash
   git add src/models src/erros.js
   git commit -m "Classes de domínio com a base Entidade"

   git add src/config src/db
   git commit -m "Singletons: AppConfig e Database"

   git add src/repositories src/controllers src/factories src/routes server.js package.json
   git commit -m "Template Method e Factory Method no back-end; rotas compactadas"

   git add public db docs README.md .gitignore .env.example
   git add -A
   git commit -m "BasePage, CrudPage e CampoFactory; telas compactadas"
   git tag v2
   git push --tags
   ```

---

## Roteiro do vídeo (sugestão: 6 a 8 minutos, uma pessoa por parte)

1. **Abertura (Babbingtonn, ~30 s)**: nome do projeto, equipe e a técnica: extrair componentes
   genéricos para eliminar repetição.
2. **O problema (Babbingtonn, ~1 min)**: no GitHub, abrir a tag `v1`. Mostrar `routes/api.js`
   com o mesmo padrão de SQL repetido para cada tabela, e dois HTMLs lado a lado mostrando o
   mesmo bloco copiado (esqueleto, `DOMContentLoaded`, `tagStatus`).
3. **Passo 1: a base das entidades (André, ~1 min)**: `Entidade.js` e uma subclasse curta
   como `Documento.js`. A subclasse só declara os campos.
4. **Passo 2: repositório genérico (André, ~1,5 min)**: `BaseRepository.salvar()` (Template
   Method), um gancho sobrescrito em `ReservaRepository`.
5. **Passo 3: controller genérico e rotas (Gabriel, ~1,5 min)**: `CrudController.registrar()`, a `RepositoryFactory`
   e o novo `src/routes/api.js` com uma linha por recurso. Rodar `wc -l` antes/depois.
6. **Passo 4: front-end (Marcel, ~1,5 min)**: `BasePage`, `CrudPage` e `CampoFactory`.
   Comparar `sindico-moradores.html` v1 (103 linhas) × v2 (48 linhas).
7. **Prova de que funciona (Gabriel, ~1 min)**: rodar o sistema, cadastrar, editar e excluir um
   registro, e ligar/desligar um módulo como administradora mostrando o menu do síndico mudar.
8. **Fechamento (~20 s)**: `git diff --stat v1 v2` e o ganho: uma correção no componente vale
   para todas as telas de uma vez.

No YouTube, escolham a visibilidade **"Não listado"** ao publicar.
