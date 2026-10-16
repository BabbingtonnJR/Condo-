# Condo+ — Node/Express + MySQL, com padrões de projeto e variabilidade

Sistema de gestão de condomínios com **back-end Node.js + Express** e banco **MySQL/MariaDB**.
Todas as telas leem e gravam dados reais; nada é mockado no front-end.

| Questão do trabalho | Onde está | Documento |
|---|---|---|
| 1 — 10+ classes e padrões (Opção 01) | `src/` e `public/assets/` | [docs/PADROES.md](docs/PADROES.md) |
| 2 — CRUDs, tabelas e variabilidade | seções abaixo | este README |
| 3 — Repositório e compactação de código | Git + vídeo | [docs/COMPACTACAO-E-VIDEO.md](docs/COMPACTACAO-E-VIDEO.md) |
| Quem fez o quê | todo o código | [AUTORES.md](AUTORES.md) |

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
| Babbingtonn | Moradores — `sindico-moradores.html` (tabela `moradores`) | Comunicados — `sindico-comunicados.html` (tabela `comunicados`) | marcos |
| André | Documentos — `sindico-documentos.html` (tabela `documentos`) | Financeiro — `sindico-financeiro.html` (tabela `financeiro`) | marcos |
| Marcel | Encomendas — `porteiro-encomendas.html` (tabela `encomendas`) | Visitantes — `porteiro-visitantes.html` (tabela `visitantes`) | jonas |
| Gabriel | Condomínios — `administradora-condominios.html` (tabela `condominios`) | Usuários — `administradora-usuarios.html` (tabela `usuarios`) | patricia |

> Além dessas 8, também têm CRUD: solicitações (Babbingtonn), reservas (André), chamados de
> suporte (Marcel), vagas do estacionamento e convidados de evento (Gabriel).
> A divisão completa, arquivo por arquivo, está em [AUTORES.md](AUTORES.md).

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

## v4 — Relatórios (SE01 a SE06)

As 6 Saídas Externas da planilha de pontos de função viraram telas de verdade. Todo número marcado com `*` é **dado derivado**: o servidor calcula na hora, nada disso fica gravado no banco.

| SE | Onde ver no site | Login | Rota |
|---|---|---|---|
| SE01 Inadimplência | Síndico → Relatórios → Inadimplência | marcos@condoplus.com / marcos123 | `GET /api/relatorios/inadimplencia?condominio_id=1` |
| SE02 Demonstrativo | Síndico → Relatórios → Demonstrativo mensal (e resumo em Morador → Financeiro) | marcos / renata | `GET /api/relatorios/demonstrativo?condominio_id=1&competencia=Agosto/2026` |
| SE03 Indicadores | Síndico → Relatórios → Indicadores de solicitações | marcos | `GET /api/relatorios/solicitacoes?condominio_id=1` |
| SE04 Ocupação | Síndico → Relatórios → Ocupação das áreas (só se reservas estiver ligado) | marcos | `GET /api/relatorios/ocupacao?condominio_id=1&mes=2026-10` |
| SE05 Prazos | Suporte → Relatórios → Prazo dos chamados | bianca@condoplus.com / bianca123 | `GET /api/relatorios/prazo-chamados?prazoHoras=48` |
| SE06 Painel | Administradora → Painel consolidado | patricia@condoplus.com / patricia123 | `GET /api/relatorios/painel-administradora` |

Padrões reaproveitados: `BaseRelatorio.gerar()` é um Template Method (filtros → buscar → calcular → montar) e o `RelatorioFactory` é um Factory Method que escolhe a classe do relatório pelo nome da URL. O terminal mostra as linhas `FABRICA` e `RELAT` quando uma tela de relatório abre.

> O seed usa datas relativas ao dia em que você roda (`CURDATE()`), então os boletos vencidos, as reservas do mês e as horas dos chamados sempre fazem sentido. Para "atualizar" os dados, rode `schema.sql` e `seed.sql` de novo (no XAMPP: `source db/schema.sql` e depois `source db/seed.sql`).

## v5 — Consultas (CE01 a CE08)

Cada tela de consulta tem **Entrada** (os filtros, com `*` nos obrigatórios) e **Saída** (tabela só com o que está gravado no banco, sem conta nenhuma — é isso que diferencia CE de SE).

| CE | Onde ver no site | Login | Exemplo de entrada |
|---|---|---|---|
| CE01 Morador por unidade | Síndico → Consultas | marcos | Unidade 302 |
| CE02 Solicitações | Síndico → Consultas | marcos | Categoria Manutenção |
| CE03 Boletos da unidade | Síndico → Consultas | marcos | Unidade 204, Pendente |
| CE04 Reservas do dia | Síndico → Consultas (só com reservas) | marcos | Data de hoje |
| CE05 Chamados por status | Suporte → Consultas | bianca | Status Aberto |
| CE06 Buscar comunicados | Morador ou Síndico → Consultas | renata / marcos | Palavra "água" |
| CE07 Condomínios por tipo | Administradora → Consultas | patricia | Tipo Residencial |
| CE08 Usuários por perfil | Administradora → Consultas | patricia | Perfil Síndico |

Rota: `GET /api/consultas/<nome>?<entrada>` (ex.: `/api/consultas/boletos?condominio_id=1&unidade=204`). No terminal aparecem as linhas `FABRICA` (ConsultaFactory) e `CONSUL` (BaseConsulta.executar).

## v6 — Empacotamento (questão 3)

A parte genérica do back-end saiu de `src/` e virou o pacote **`condoplus-core`** (pasta `../condoplus-core`): `Database` (Singleton 2), `BaseRepository` e `BaseController` (Template Method 1 e 2), `CrudController`, `Entidade`, conversores, erros e o log. O Condo+ agora instala esse pacote pelo npm, igual instala o Express:

```json
"condoplus-core": "file:../pacotes/condoplus-core-1.0.0.tgz"
```

O `npm install` daqui já instala o pacote a partir do arquivo `.tgz` em `../pacotes`. No código, quem usava `require('../db/Database')` agora usa `require('condoplus-core')`. O `server.js` passa a configuração do banco pro pacote com `Database.configurar(config.banco)`.

Pra gerar uma versão nova do pacote: mude o código em `../condoplus-core`, suba a versão no `package.json` e no `CHANGELOG.md`, rode `npm test` e `npm pack --pack-destination ../pacotes`, e atualize a versão aqui no `package.json` do Condo+.

## Estrutura do projeto

```
condoplus/
├─ server.js                     # sobe o Express (usa os dois Singletons)
├─ db/
│  ├─ schema.sql                 # 13 tabelas
│  └─ seed.sql                   # dados de exemplo dos 3 tipos de condomínio
├─ src/
│  ├─ config/AppConfig.js        # SINGLETON 1
│  ├─ models/                    # Entidade + 13 classes de domínio
│  ├─ repositories/
│  │  ├─ Repositorios.js         # 13 repositórios concretos
│  │  └─ RepositoryFactory.js    # FACTORY METHOD 2
│  ├─ factories/
│  │  └─ CondominioFactory.js    # FACTORY METHOD 1 (variabilidade)
│  ├─ controllers/
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
