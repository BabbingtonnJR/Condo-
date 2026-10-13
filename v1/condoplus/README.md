# Condo+ — Protótipo com backend Node/Express + MySQL

Este é o protótipo do Condo+ rodando com um back-end de verdade: **Node.js + Express**
na API e **MySQL (ou MariaDB)** como banco de dados. As 16 telas do sistema (+ login e
recuperação de senha) buscam e gravam dados reais — nada é mockado no front-end.

## Pré-requisitos

- Node.js 18 ou superior
- MySQL 8+ ou MariaDB 10.6+ instalado e rodando

## 1. Criar o banco de dados

```bash
mysql -u root -p --default-character-set=utf8mb4 < db/schema.sql
mysql -u root -p --default-character-set=utf8mb4 < db/seed.sql
```

> **Importante:** use sempre `--default-character-set=utf8mb4` ao rodar os `.sql` pelo
> terminal, senão os acentos (João, á, ç...) podem ser gravados errados no banco.

Isso cria o banco `condoplus` com 11 tabelas (moradores, comunicados, solicitações,
documentos, financeiro, reservas, encomendas, visitantes, chamados, condomínios e
usuários) e já popula tudo com dados de exemplo — nenhuma tela fica em branco.

Opcional — criar um usuário de banco dedicado à aplicação (recomendado em vez de usar `root`):

```sql
CREATE USER 'condoplus_app'@'localhost' IDENTIFIED BY 'condoplus_pass';
GRANT ALL PRIVILEGES ON condoplus.* TO 'condoplus_app'@'localhost';
FLUSH PRIVILEGES;
```

## 2. Configurar a conexão

```bash
cp .env.example .env
```

Edite o `.env` com o usuário/senha do seu MySQL:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=condoplus_app
DB_PASSWORD=condoplus_pass
DB_NAME=condoplus
PORT=3000
```

## 3. Instalar dependências e rodar

```bash
npm install
npm start
```

Acesse **http://localhost:3000** no navegador (redireciona para a tela de login).

## Usuários de teste (já cadastrados no seed)

| E-mail | Senha | Perfil |
|---|---|---|
| renata@condoplus.com | renata123 | Morador (unidade 302) |
| marcos@condoplus.com | marcos123 | Síndico |
| patricia@condoplus.com | patricia123 | Administradora |
| jonas@condoplus.com | jonas123 | Porteiro |
| carlos@condoplus.com | carlos123 | Prestador de Serviço |
| bianca@condoplus.com | bianca123 | Suporte |

## Onde está o CRUD (RF04)

Login como **síndico** → menu **Moradores** (`sindico-moradores.html`).
Cadastrar, editar e desativar/reativar gravam de verdade na tabela `moradores` via:
- `GET /api/moradores`
- `POST /api/moradores`
- `PUT /api/moradores/:id`
- `PATCH /api/moradores/:id/status`

Outras ações que também persistem no banco (não só o CRUD "oficial"):
publicar comunicado, abrir/mudar status de solicitação, cadastrar condomínio,
solicitar reserva, registrar encomenda/visitante, resolver/escalar chamado.

## Parte III — Alta variabilidade

O eixo de variabilidade escolhido é o **tipo de condomínio** que a administradora atende.
A tabela `condominios` tem uma coluna `tipo` (`residencial` | `comercial` | `clube`) e uma
coluna `modulos` (JSON com flags de personalização). Login como **administradora**
(`patricia@condoplus.com` / `patricia123`) → menu **Módulos por condomínio** para ligar/desligar
cada módulo por cliente, sem tocar em código.

| Tipo de cliente | Login de teste | Módulo exclusivo |
|---|---|---|
| Residencial | marcos@condoplus.com / marcos123 | Reservas de área comum |
| **Comercial** | **ana@condoplus.com / ana123** | **Estacionamento rotativo** (a função "fora da caixa" pedida no enunciado) |
| Clube | renato@condoplus.com / renato123 | Controle de convidados por evento |

O front-end lê `condominio_tipo` e `condominio_modulos` retornados pelo `/api/login` e:
- só mostra no menu lateral os itens cujo módulo está habilitado (`assets/common.js`, função `screensForRole`);
- troca rótulos conforme o cliente (ex.: "Moradores" vira "Colaboradores", "Unidade" vira "Sala/Andar" em condomínio comercial);
- adapta o KPI de destaque do painel do síndico conforme o módulo habilitado (vagas livres, convidados aguardados, ou reservas pendentes).

Nada disso exige duplicar telas ou instanciar um projeto novo por cliente — é a mesma base de
código, mesma tabela `usuarios`/`condominios`, e a variação vem 100% de configuração salva no
banco. É a aplicação prática do ativo reutilizável #3 (RBAC) e do RNF10 (Escalabilidade) do
documento do projeto.

### Arquitetura de personalização e reuso (pesquisa)

- **Linguagem/runtime:** Node.js + Express — leve, mesma linguagem no front e no back
  (JavaScript), ecossistema maduro para APIs REST multi-tenant.
- **Banco de dados:** MySQL/MariaDB, com **multi-tenancy por coluna** (`condominio_id` em
  cada tabela) em vez de um banco por cliente — mais simples de manter e migrar em escala,
  adequado ao porte pequeno/médio dos condomínios do público-alvo. Colunas `JSON` (como
  `modulos`) permitem guardar configuração variável por cliente sem alterar o schema a cada
  novo módulo.
- **Padrão de personalização:** **feature flags por tenant**, guardadas no próprio registro do
  cliente (`condominios.modulos`) — o mesmo padrão usado por produtos SaaS reais (ex.:
  planos/add-ons no Slack, módulos habilitáveis no Notion) para vender o mesmo produto de
  formas diferentes sem branches de código por cliente.
- **Front-end:** HTML/CSS/JS consumindo uma API REST única — a mesma arquitetura escalaria
  para um front-end em React/Vue sem mudar o back-end, bastando manter o contrato da API.
- **Componentes reaproveitáveis:** botões, tags de status, modais e tabelas em `style.css` já
  são compartilhados entre todas as telas — a "biblioteca de componentes de front-end" citada
  como ativo reutilizável #6 do documento do projeto.

## Estrutura do projeto

```
condoplus-mysql/
├─ server.js              # servidor Express
├─ package.json
├─ .env.example
├─ db/
│  ├─ schema.sql           # estrutura das tabelas
│  ├─ seed.sql             # dados de exemplo
│  └─ pool.js              # conexão com o MySQL (mysql2)
├─ routes/
│  └─ api.js               # todas as rotas REST
└─ public/                 # front-end (HTML/CSS/JS puro, sem framework)
   ├─ login.html
   ├─ recuperar-senha.html
   ├─ morador-*.html (7 telas)
   ├─ sindico-*.html (4 telas)
   ├─ administradora-*.html (2 telas)
   ├─ porteiro-portaria.html
   ├─ prestador-solicitacoes.html
   ├─ suporte-chamados.html
   └─ assets/
      ├─ style.css
      └─ common.js         # sessão, navegação, modais, wrapper de fetch (`api.*`)
```

## Observações para o relatório do projeto

- **Autenticação (RF02, RF03):** login real contra a tabela `usuarios`, com perfis
  distintos controlando o menu lateral exibido (base do RBAC do projeto). Por ser um
  protótipo acadêmico, as senhas ficam em texto puro no banco — em produção seria
  necessário hash (ex.: bcrypt) e um mecanismo de sessão/token (ex.: JWT ou cookies
  assinados) em vez de apenas guardar o usuário logado no `localStorage`.
- Cada tabela do `schema.sql` tem, em comentário, a que Requisito Funcional do
  documento do projeto ela atende.
- O front-end é HTML/CSS/JS puro (sem build step) propositalmente, para deixar claro
  no protótipo a separação entre front-end estático e a API REST — mas a arquitetura
  já é a mesma que se usaria com um front-end em framework (React/Vue) consumindo a
  mesma API.
