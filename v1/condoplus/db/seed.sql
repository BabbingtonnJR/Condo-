-- Condo+ — Dados de exemplo (seed)
-- Execute depois do schema.sql
USE condoplus;

INSERT INTO condominios (nome, endereco, unidades, sindico_nome, tipo, modulos) VALUES
('Residencial Jardim das Acácias', 'Rua das Acácias, 120', 48, 'Marcos Andrade', 'residencial',
  JSON_OBJECT('reservas_area_comum', true, 'estacionamento_rotativo', false, 'controle_convidados_evento', false)),
('Edifício Bosque Verde — Escritórios', 'Av. dos Pinheirais, 900', 32, 'Ana Beatriz Rocha', 'comercial',
  JSON_OBJECT('reservas_area_comum', false, 'estacionamento_rotativo', true, 'controle_convidados_evento', false)),
('Clube Recreativo Vila Nova', 'Estrada do Lago, 45', 0, 'Renato Farias', 'clube',
  JSON_OBJECT('reservas_area_comum', true, 'estacionamento_rotativo', false, 'controle_convidados_evento', true));

-- Senhas em texto puro só para fins de demonstração acadêmica.
-- Em produção, usar hash (bcrypt) — ver observação no README.
INSERT INTO usuarios (nome, email, senha, perfil, unidade, condominio_id) VALUES
('Renata Souza',   'renata@condoplus.com',   'renata123',   'morador',        '302', 1),
('Marcos Andrade', 'marcos@condoplus.com',   'marcos123',   'sindico',        NULL,  1),
('Patrícia Lima',  'patricia@condoplus.com', 'patricia123', 'administradora', NULL,  NULL),
('Jonas Ferreira', 'jonas@condoplus.com',    'jonas123',    'porteiro',       NULL,  1),
('Carlos Eduardo', 'carlos@condoplus.com',   'carlos123',   'prestador',      NULL,  NULL),
('Bianca Ramos',   'bianca@condoplus.com',   'bianca123',   'suporte',        NULL,  NULL),
('Ana Beatriz Rocha', 'ana@condoplus.com',   'ana123',      'sindico',        NULL,  2),
('Renato Farias',  'renato@condoplus.com',   'renato123',   'sindico',        NULL,  3);

INSERT INTO moradores (nome, unidade, email, status, condominio_id) VALUES
('Renata Souza',   '302', 'renata.souza@email.com', 'ativo',   1),
('João Pereira',   '105', 'joao.pereira@email.com', 'ativo',   1),
('Marina Alves',   '701', 'marina.alves@email.com', 'ativo',   1),
('Eduardo Kimura', '204', 'e.kimura@email.com',     'inativo', 1);

INSERT INTO comunicados (titulo, corpo, condominio_id) VALUES
('Manutenção do elevador social', 'O elevador social ficará indisponível das 9h às 12h para manutenção preventiva.', 1),
('Assembleia geral ordinária', 'Convocação para assembleia no dia 20/09 às 19h, no salão de festas.', 1),
('Dedetização das áreas comuns', 'Dedetização programada para o próximo sábado, das 8h às 10h.', 1);

INSERT INTO solicitacoes (unidade, titulo, categoria, status, prestador_nome, condominio_id) VALUES
('302', 'Vazamento no teto da garagem',    'Manutenção', 'progresso', 'Carlos Eduardo', 1),
('105', 'Lâmpada queimada no corredor',    'Manutenção', 'aberto',    NULL,             1),
('701', 'Barulho excessivo apto vizinho',  'Ocorrência', 'concluido', NULL,             1),
('701', 'Troca de fechadura do hall',      'Manutenção', 'aberto',    'Carlos Eduardo', 1);

INSERT INTO documentos (nome, tipo, condominio_id) VALUES
('Ata da Assembleia - Julho 2026', 'PDF', 1),
('Regimento Interno', 'PDF', 1),
('Prestação de Contas - Agosto', 'PDF', 1);

INSERT INTO financeiro (unidade, referencia, valor, vencimento, status) VALUES
('302', 'Agosto/2026', 620.00, '2026-09-10', 'pendente'),
('302', 'Julho/2026',  610.00, '2026-08-10', 'pago'),
('302', 'Junho/2026',  610.00, '2026-07-10', 'pago');

INSERT INTO reservas (area, data_reserva, hora, morador, status) VALUES
('Salão de festas', '2026-09-14', '19h–23h', 'Renata Souza (302)', 'confirmada'),
('Churrasqueira',   '2026-09-20', '12h–16h', 'João Pereira (105)', 'pendente');

INSERT INTO encomendas (morador, unidade, retirado) VALUES
('Renata Souza', '302', FALSE),
('Marina Alves', '701', TRUE);

INSERT INTO visitantes (nome, unidade) VALUES
('Carlos Mendes', '204');

INSERT INTO chamados (usuario, assunto, status, escalado) VALUES
('João Pereira',              'Não consigo redefinir a senha',        'aberto',    FALSE),
('Marcos Andrade (síndico)',  'Erro ao publicar comunicado',          'progresso', FALSE),
('Renata Souza',              'Dúvida sobre reserva de área comum',   'concluido', FALSE);

-- ============================================================
-- PARTE III — dados de exemplo dos módulos exclusivos
-- ============================================================

-- Estacionamento rotativo (exclusivo do condomínio comercial, id 2)
INSERT INTO vagas_estacionamento (condominio_id, codigo, data_reserva, reservado_por) VALUES
(2, 'G-01', CURDATE(), 'Contabilidade Rocha & Lima'),
(2, 'G-02', CURDATE(), NULL),
(2, 'G-03', CURDATE(), 'Estúdio Criativo Bosque'),
(2, 'G-04', CURDATE(), NULL);

-- Controle de convidados por evento (exclusivo do clube, id 3)
INSERT INTO convidados_evento (condominio_id, evento, convidado, responsavel, status) VALUES
(3, 'Festa junina do clube', 'Fernanda Melo', 'Renato Farias', 'confirmado'),
(3, 'Festa junina do clube', 'Diego Santos', 'Renato Farias', 'convidado'),
(3, 'Torneio de tênis', 'Lucas Prado', 'Renato Farias', 'presente');
