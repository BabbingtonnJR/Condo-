# Condo+ v6 — empacotamento para reuso

| Pasta | O que é |
| --- | --- |
| `condoplus-core/` | Código-fonte do pacote reutilizável (Singleton `Database`, Template Methods `BaseRepository` e `BaseController`, `CrudController`, `Entidade`…), com `package.json`, README, CHANGELOG, LICENSE e testes |
| `pacotes/` | O artefato gerado pelo `npm pack`: `condoplus-core-1.0.0.tgz` |
| `condoplus/` | O sistema Condo+, que agora instala o `condoplus-core` como dependência |
| `exemplo-reuso/` | Outro projeto (uma API de biblioteca) usando o mesmo pacote, sem copiar código |

## Passo a passo do empacotamento

```bash
cd condoplus-core
npm install                                  # instala o mysql2 (dependência do pacote)
npm test                                     # 5 testes, sem precisar de banco
npm pack --pack-destination ../pacotes       # gera pacotes/condoplus-core-1.0.0.tgz

cd ../condoplus
npm install                                  # instala o pacote a partir do .tgz
npm start                                    # http://localhost:3000

cd ../exemplo-reuso
npm install
npm start                                    # http://localhost:4000/api/livros
```
