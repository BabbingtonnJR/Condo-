# exemplo-reuso

Um projeto que **não é o Condo+** (uma API de biblioteca) usando o pacote `condoplus-core`. Serve pra mostrar que o componente empacotado é reutilizável em outro sistema sem copiar código.

```bash
mysql -u root -p < db.sql        # no XAMPP: source db.sql
npm install                      # instala o condoplus-core a partir do .tgz
npm start                        # http://localhost:4000/api/livros
```

O CRUD inteiro de livros (listar, buscar, cadastrar, editar, excluir, com validação) saiu de `index.js`, que tem uns 40 linhas.
