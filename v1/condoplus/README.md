# Condo+ — Node/Express + MySQL, com padrões de projeto e variabilidade

Sistema de gestão de condomínios com **back-end Node.js + Express** e banco **MySQL/MariaDB**.
Todas as telas leem e gravam dados reais; nada é mockado no front-end.

| Questão do trabalho | Onde está | Documento |
|---|---|---|
| 1 — 10+ classes e padrões (Opção 01) | `src/` e `public/assets/` | [docs/PADROES.md](docs/PADROES.md) |
| 2 — CRUDs, tabelas e variabilidade | seções abaixo | este README |
| 3 — Repositório e compactação de código | Git + vídeo | [docs/COMPACTACAO-E-VIDEO.md](docs/COMPACTACAO-E-VIDEO.md) |

## Como rodar

Pré-requisitos: Node.js 18+ e MySQL 8+ (ou MariaDB 10.6+).

### 1. Criar o banco

```bash
mysql -u root -p --default-character-set=utf8mb4 < db/schema.sql
mysql -u root -p --default-character-set=utf8mb4 < db/seed.sql
```

> O `schema.sql` começa com `DROP DATABASE IF EXISTS condoplus`, porque várias tabelas ganharam
> colunas novas. Ele apaga o banco antigo e recria do zero. Use sempre
> `--default-character-set=utf8mb4`, senão os acentos ficam errados.

Usuário de banco dedicado (opcional, recomendado):

```sql
CREATE USER 'condoplus_app'@'localhost' IDENTIFIED BY 'condoplus_pass';
GRANT ALL PRIVILEGES ON condoplus.* TO 'condoplus_app'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Configurar e iniciar

```bash
cp .env.example .env      # no Windows: copy .env.example .env  (ajuste usuário/senha do MySQL)
npm install
npm start
```

Acesse **http://localhost:3000**. O terminal mostra `Conexão com o banco: OK` quando está tudo certo.

### Usuários de teste

| E-mail | Senha | Perfil |
|---|---|---|
| renata@condoplus.com | renata123 | Morador (residencial, unidade 302) |
| marcos@condoplus.com | marcos123 | Síndico — residencial |
| ana@condoplus.com | ana123 | Síndico — comercial (vê "Colaboradores" e "Estacionamento rotativo") |
| renato@condoplus.com | renato123 | Síndico — clube (vê "Sócios" e "Convidados de evento") |
| patricia@condoplus.com | patricia123 | Administradora |
| jonas@condoplus.com | jonas123 | Porteiro |
| carlos@condoplus.com | carlos123 | Prestador de serviço |
| bianca@condoplus.com | bianca123 | Suporte |

---

## Questão 2 — CRUDs por integrante (2 por pessoa, 8 no total)

Cada CRUD cadastra, consulta, edita e exclui, gravando no MySQL.

| Integrante | Tela 1 | Tela 2 | Login para testar |
|---|---|---|---|
| Integrante 1 | Moradores — `sindico-moradores.html` (tabela `moradores`) | Comunicados — `sindico-comunicados.html` (tabela `comunicados`) | marcos |
| Integrante 2 | Documentos — `sindico-documentos.html` (tabela `documentos`) | Financeiro — `sindico-financeiro.html` (tabela `financeiro`) | marcos |
| Integrante 3 | Encomendas — `porteiro-encomendas.html` (tabela `encomendas`) | Visitantes — `porteiro-visitantes.html` (tabela `visitantes`) | jonas |
| Integrante 4 | Condomínios — `administradora-condominios.html` (tabela `condominios`) | Usuários — `administradora-usuarios.html` (tabela `usuarios`) | patricia |

> Substituam "Integrante 1…4" pelos nomes de vocês. Além dessas 8, também têm CRUD: solicitações
> (morador), reservas, chamados de suporte, vagas do estacionamento e convidados de evento.

Regras de negócio que cada um deve saber mostrar:
- **Moradores:** e-mail único por condomínio; desativar/reativar (`Morador.alternarStatus`).
- **Comunicados:** título obrigatório e com até 150 caracteres.
- **Documentos:** tipo limitado a PDF, DOCX, XLSX, Imagem ou Outro; aparece para os moradores.
- **Financeiro:** não aceita dois boletos da mesma referência para a mesma unidade; "Marcar como pago"; boleto vencido aparece em vermelho.
- **Encomendas:** "Registrar retirada" só uma vez (`Encomenda.registrarRetirada`).
- **Visitantes:** horário de entrada gravado automaticamente pelo banco.
- **Condomínios:** o tipo escolhido define os módulos iniciais (Factory Method); não deixa excluir condomínio com pessoas vinculadas.
- **Usuários:** e-mail único; senha em branco na edição mantém a atual; a senha nunca é enviada ao navegador.

## Questão 2 — Tabelas no banco

São 13 tabelas (`db/schema.sql`): `condominios`, `usuarios`, `moradores`, `comunicados`,
`solicitacoes`, `documentos`, `financeiro`, `reservas`, `encomendas`, `visitantes`, `chamados`,
`vagas_estacionamento` e `convidados_evento`. Todas as tabelas de dados têm `condominio_id`,
então cada condomínio só vê os próprios registros (**multi-tenancy por coluna**).

## Questão 2 — Variabilidade planejada

O eixo de variação é o **tipo de cliente** atendido pela administradora: `residencial`,
`comercial` ou `clube`. O mesmo código atende os três; o que muda é a configuração gravada na
tabela `condominios` (colunas `tipo` e `modulos`).

**Pontos de variação:**

| O que varia | Residencial | Comercial | Clube | Onde é decidido |
|---|---|---|---|---|
| Nome das pessoas | Moradores | Colaboradores | Sócios | `CondominioFactory.js` (rótulos) |
| Nome da unidade | Unidade | Sala/Andar | Título | `CondominioFactory.js` (rótulos) |
| Reservas de área comum | ligado | desligado | ligado | coluna `modulos` |
| Estacionamento rotativo | desligado | **ligado (exclusivo)** | desligado | coluna `modulos` |
| Convidados de evento | desligado | desligado | **ligado (exclusivo)** | coluna `modulos` |
| Indicador de destaque do painel | reservas pendentes | vagas livres | convidados aguardados | `sindico-painel.html` |

**Como funciona, de ponta a ponta:**

1. **Na criação** (tempo de configuração): a administradora escolhe o tipo e o `CondominioCreator`
   correspondente (Factory Method) monta o condomínio com os módulos padrão daquele tipo.
2. **No ajuste fino** (tempo de execução): em *Módulos por condomínio*, a administradora liga ou
   desliga qualquer módulo para um cliente específico, sem alterar código.
3. **No uso**: a cada tela, a `BasePage` recarrega a sessão (`GET /api/sessao/:id`) com tipo,
   módulos e rótulos. O menu (`screensForRole` em `common.js`) mostra só o que está ligado, os
   textos mudam conforme o tipo, e uma tela de módulo desligado redireciona para o início mesmo
   se o endereço for digitado direto.

**Demonstração rápida (1 minuto):** entre como `patricia`, desligue "Reservas de área comum" do
Residencial Jardim das Acácias. Em outra aba, logado como `marcos`, recarregue: o item "Reservas"
some do menu. Depois compare os menus de `marcos`, `ana` e `renato`.

**Como estender:** um tipo novo (ex.: coworking) exige só uma classe `CoworkingCreator` e uma
opção no `ENUM` da coluna `tipo`. Um módulo novo exige a flag no JSON, a tela dele e uma linha
em `screensForRole`.

---

## Estrutura do projeto

```
condoplus/
├─ server.js                     # sobe o Express (usa os dois Singletons)
├─ db/
│  ├─ schema.sql                 # 13 tabelas
│  └─ seed.sql                   # dados de exemplo dos 3 tipos de condomínio
├─ src/
│  ├─ config/AppConfig.js        # SINGLETON 1
│  ├─ db/Database.js             # SINGLETON 2
│  ├─ erros.js                   # erros com status HTTP
│  ├─ models/                    # Entidade + 13 classes de domínio
│  ├─ repositories/
│  │  ├─ BaseRepository.js       # TEMPLATE METHOD 1
│  │  ├─ Repositorios.js         # 13 repositórios concretos
│  │  └─ RepositoryFactory.js    # FACTORY METHOD 2
│  ├─ factories/
│  │  └─ CondominioFactory.js    # FACTORY METHOD 1 (variabilidade)
│  ├─ controllers/
│  │  ├─ BaseController.js       # TEMPLATE METHOD 2
│  │  ├─ CrudController.js       # CRUD genérico (5 endpoints por recurso)
│  │  ├─ CondominioController.js
│  │  └─ AuthController.js
│  └─ routes/api.js              # uma linha por recurso
├─ public/
│  ├─ assets/
│  │  ├─ common.js               # sessão, API, menu sensível a módulos
│  │  ├─ componentes.js          # FACTORY METHOD 3 (CampoFactory), tags, formatação
│  │  ├─ BasePage.js             # TEMPLATE METHOD 3 (BasePage) + CrudPage
│  │  └─ style.css
│  └─ *.html                     # 24 telas + login e recuperação de senha
└─ docs/
   ├─ PADROES.md                 # guia de estudo dos padrões
   └─ COMPACTACAO-E-VIDEO.md     # roteiro da questão 3
```

## Observações para o relatório

- **Senhas:** ficam em texto puro por ser protótipo acadêmico. Em produção seria preciso hash
  (bcrypt) e sessão por token (JWT ou cookie assinado) em vez do `localStorage`.
- **Segurança das consultas:** todo SQL usa parâmetros `?`, e só colunas de uma lista permitida
  entram no `WHERE` (`filtrosPermitidos` no `BaseRepository`), o que evita SQL injection.
- **Textos na tela:** tudo que vem do banco passa por `esc()` antes de ir para o HTML.
