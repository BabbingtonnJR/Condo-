const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

/* ============ AUTENTICAÇÃO (RF02, RF03) ============ */
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nome, u.email, u.perfil, u.unidade, u.status,
              u.condominio_id, c.nome AS condominio_nome, c.tipo AS condominio_tipo, c.modulos AS condominio_modulos
       FROM usuarios u
       LEFT JOIN condominios c ON c.id = u.condominio_id
       WHERE u.email = ? AND u.senha = ?`,
      [email, senha]
    );
    if (rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }
    if (rows[0].status === 'inativo') {
      return res.status(403).json({ erro: 'Usuário desativado.' });
    }
    res.json({ usuario: rows[0] });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

/* ============ MORADORES — CRUD completo (RF04) ============ */
router.get('/moradores', async (req, res) => {
  let sql = 'SELECT * FROM moradores';
  const params = [];
  if (req.query.condominio_id) { sql += ' WHERE condominio_id = ?'; params.push(req.query.condominio_id); }
  sql += ' ORDER BY nome';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/moradores', async (req, res) => {
  const { nome, unidade, email, condominio_id } = req.body;
  if (!nome || !unidade || !email) return res.status(400).json({ erro: 'Preencha nome, unidade e e-mail.' });
  const [result] = await pool.query(
    'INSERT INTO moradores (nome, unidade, email, status, condominio_id) VALUES (?, ?, ?, "ativo", ?)',
    [nome, unidade, email, condominio_id || 1]
  );
  res.status(201).json({ id: result.insertId });
});

router.put('/moradores/:id', async (req, res) => {
  const { nome, unidade, email } = req.body;
  await pool.query(
    'UPDATE moradores SET nome = ?, unidade = ?, email = ? WHERE id = ?',
    [nome, unidade, email, req.params.id]
  );
  res.json({ ok: true });
});

router.patch('/moradores/:id/status', async (req, res) => {
  const [[atual]] = await pool.query('SELECT status FROM moradores WHERE id = ?', [req.params.id]);
  if (!atual) return res.status(404).json({ erro: 'Morador não encontrado.' });
  const novoStatus = atual.status === 'ativo' ? 'inativo' : 'ativo';
  await pool.query('UPDATE moradores SET status = ? WHERE id = ?', [novoStatus, req.params.id]);
  res.json({ status: novoStatus });
});

/* ============ COMUNICADOS (RF06, RF07) ============ */
router.get('/comunicados', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM comunicados ORDER BY publicado_em DESC');
  res.json(rows);
});

router.post('/comunicados', async (req, res) => {
  const { titulo, corpo } = req.body;
  if (!titulo) return res.status(400).json({ erro: 'Informe um título.' });
  const [result] = await pool.query(
    'INSERT INTO comunicados (titulo, corpo, condominio_id) VALUES (?, ?, 1)',
    [titulo, corpo || '']
  );
  res.status(201).json({ id: result.insertId });
});

/* ============ SOLICITAÇÕES (RF09, RF10, RF11) ============ */
router.get('/solicitacoes', async (req, res) => {
  let sql = 'SELECT * FROM solicitacoes';
  const params = [];
  const filtros = [];
  if (req.query.unidade) { filtros.push('unidade = ?'); params.push(req.query.unidade); }
  if (req.query.prestador) { filtros.push('prestador_nome = ?'); params.push(req.query.prestador); }
  if (filtros.length) sql += ' WHERE ' + filtros.join(' AND ');
  sql += ' ORDER BY criado_em DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/solicitacoes', async (req, res) => {
  const { unidade, titulo, categoria } = req.body;
  if (!unidade || !titulo) return res.status(400).json({ erro: 'Informe unidade e título.' });
  const [result] = await pool.query(
    'INSERT INTO solicitacoes (unidade, titulo, categoria, status, condominio_id) VALUES (?, ?, ?, "aberto", 1)',
    [unidade, titulo, categoria || 'Outro']
  );
  res.status(201).json({ id: result.insertId });
});

router.put('/solicitacoes/:id', async (req, res) => {
  const { status } = req.body;
  await pool.query('UPDATE solicitacoes SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ ok: true });
});

/* ============ DOCUMENTOS (RF15, RF16) ============ */
router.get('/documentos', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM documentos ORDER BY publicado_em DESC');
  res.json(rows);
});

/* ============ FINANCEIRO (RF13, RF14) ============ */
router.get('/financeiro', async (req, res) => {
  const unidade = req.query.unidade || '302';
  const [rows] = await pool.query(
    'SELECT * FROM financeiro WHERE unidade = ? ORDER BY vencimento DESC', [unidade]
  );
  res.json(rows);
});

/* ============ RESERVAS (RF18) ============ */
router.get('/reservas', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM reservas ORDER BY data_reserva');
  res.json(rows);
});

router.post('/reservas', async (req, res) => {
  const { area, data_reserva, hora, morador } = req.body;
  if (!area || !data_reserva) return res.status(400).json({ erro: 'Informe área e data.' });
  const [result] = await pool.query(
    'INSERT INTO reservas (area, data_reserva, hora, morador, status) VALUES (?, ?, ?, ?, "pendente")',
    [area, data_reserva, hora || '', morador || '']
  );
  res.status(201).json({ id: result.insertId });
});

router.put('/reservas/:id', async (req, res) => {
  const { status } = req.body;
  await pool.query('UPDATE reservas SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ ok: true });
});

/* ============ ENCOMENDAS (RF26, RF27) ============ */
router.get('/encomendas', async (req, res) => {
  let sql = 'SELECT * FROM encomendas';
  const params = [];
  if (req.query.unidade) { sql += ' WHERE unidade = ?'; params.push(req.query.unidade); }
  sql += ' ORDER BY recebido_em DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/encomendas', async (req, res) => {
  const { morador, unidade } = req.body;
  if (!morador || !unidade) return res.status(400).json({ erro: 'Informe morador e unidade.' });
  const [result] = await pool.query(
    'INSERT INTO encomendas (morador, unidade, retirado) VALUES (?, ?, FALSE)',
    [morador, unidade]
  );
  res.status(201).json({ id: result.insertId });
});

router.patch('/encomendas/:id/retirar', async (req, res) => {
  await pool.query('UPDATE encomendas SET retirado = TRUE WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

/* ============ VISITANTES (RF28) ============ */
router.get('/visitantes', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM visitantes ORDER BY horario DESC');
  res.json(rows);
});

router.post('/visitantes', async (req, res) => {
  const { nome, unidade } = req.body;
  if (!nome || !unidade) return res.status(400).json({ erro: 'Informe nome e unidade.' });
  const [result] = await pool.query('INSERT INTO visitantes (nome, unidade) VALUES (?, ?)', [nome, unidade]);
  res.status(201).json({ id: result.insertId });
});

/* ============ CHAMADOS DE SUPORTE (RF24, RF25) ============ */
router.get('/chamados', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM chamados ORDER BY aberto_em DESC');
  res.json(rows);
});

router.patch('/chamados/:id/resolver', async (req, res) => {
  await pool.query('UPDATE chamados SET status = "concluido" WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

router.patch('/chamados/:id/escalar', async (req, res) => {
  await pool.query('UPDATE chamados SET escalado = TRUE WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

/* ============ CONDOMÍNIOS (RF05, Administradora) ============ */
router.get('/condominios', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM condominios ORDER BY nome');
  res.json(rows);
});

router.post('/condominios', async (req, res) => {
  const { nome, endereco, unidades, sindico_nome, tipo } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Informe o nome do condomínio.' });
  const tipoFinal = tipo || 'residencial';
  const modulosPadrao = {
    residencial: { reservas_area_comum: true, estacionamento_rotativo: false, controle_convidados_evento: false },
    comercial:   { reservas_area_comum: false, estacionamento_rotativo: true, controle_convidados_evento: false },
    clube:       { reservas_area_comum: true, estacionamento_rotativo: false, controle_convidados_evento: true },
  }[tipoFinal];
  const [result] = await pool.query(
    'INSERT INTO condominios (nome, endereco, unidades, sindico_nome, tipo, modulos) VALUES (?, ?, ?, ?, ?, ?)',
    [nome, endereco || '', unidades || 0, sindico_nome || '', tipoFinal, JSON.stringify(modulosPadrao)]
  );
  res.status(201).json({ id: result.insertId });
});

/* Ativar/desativar um módulo específico de um condomínio — é AQUI que
   a alta variabilidade (Parte III) fica visível: o mesmo software, com
   uma configuração por linha da tabela, liga/desliga funções por cliente. */
router.patch('/condominios/:id/modulos', async (req, res) => {
  const { modulo, ativo } = req.body;
  const [[atual]] = await pool.query('SELECT modulos FROM condominios WHERE id = ?', [req.params.id]);
  if (!atual) return res.status(404).json({ erro: 'Condomínio não encontrado.' });
  const modulos = typeof atual.modulos === 'string' ? JSON.parse(atual.modulos) : atual.modulos;
  modulos[modulo] = !!ativo;
  await pool.query('UPDATE condominios SET modulos = ? WHERE id = ?', [JSON.stringify(modulos), req.params.id]);
  res.json({ modulos });
});

/* ============ ESTACIONAMENTO ROTATIVO — módulo exclusivo COMERCIAL ============ */
router.get('/vagas', async (req, res) => {
  const condominio_id = req.query.condominio_id;
  const data = req.query.data || new Date().toISOString().slice(0, 10);
  const [rows] = await pool.query(
    'SELECT * FROM vagas_estacionamento WHERE condominio_id = ? AND data_reserva = ? ORDER BY codigo',
    [condominio_id, data]
  );
  res.json(rows);
});

router.post('/vagas', async (req, res) => {
  const { condominio_id, codigo, data_reserva } = req.body;
  if (!condominio_id || !codigo) return res.status(400).json({ erro: 'Informe condomínio e código da vaga.' });
  const [result] = await pool.query(
    'INSERT INTO vagas_estacionamento (condominio_id, codigo, data_reserva) VALUES (?, ?, ?)',
    [condominio_id, codigo, data_reserva || new Date().toISOString().slice(0, 10)]
  );
  res.status(201).json({ id: result.insertId });
});

router.patch('/vagas/:id/reservar', async (req, res) => {
  const { reservado_por } = req.body;
  await pool.query('UPDATE vagas_estacionamento SET reservado_por = ? WHERE id = ?', [reservado_por || null, req.params.id]);
  res.json({ ok: true });
});

/* ============ CONVIDADOS DE EVENTO — módulo exclusivo CLUBE ============ */
router.get('/convidados', async (req, res) => {
  const condominio_id = req.query.condominio_id;
  const [rows] = await pool.query(
    'SELECT * FROM convidados_evento WHERE condominio_id = ? ORDER BY criado_em DESC', [condominio_id]
  );
  res.json(rows);
});

router.post('/convidados', async (req, res) => {
  const { condominio_id, evento, convidado, responsavel } = req.body;
  if (!condominio_id || !evento || !convidado) return res.status(400).json({ erro: 'Preencha evento e convidado.' });
  const [result] = await pool.query(
    'INSERT INTO convidados_evento (condominio_id, evento, convidado, responsavel, status) VALUES (?, ?, ?, ?, "convidado")',
    [condominio_id, evento, convidado, responsavel || '']
  );
  res.status(201).json({ id: result.insertId });
});

router.patch('/convidados/:id/status', async (req, res) => {
  const { status } = req.body;
  await pool.query('UPDATE convidados_evento SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
