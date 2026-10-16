# Changelog

## 1.0.0 — 2026-10-15

- Primeira versão empacotada, extraída do Condo+ v5.
- `Database` (Singleton) agora recebe a configuração por `Database.configurar()`, sem depender do `.env` do projeto.
- `log` vem desligado por padrão e é ligado por `log.configurar({ ligado: true })`.
- Inclui `BaseRepository`, `BaseController`, `CrudController`, `Entidade`, conversores e erros HTTP.
