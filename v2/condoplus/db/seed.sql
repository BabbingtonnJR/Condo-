-- Babbingtonn — dados de exemplo pra nenhuma tela ficar vazia. roda depois do schema.sql
USE condoplus;

INSERT INTO condominios (nome, endereco, unidades, sindico_nome, tipo, modulos) VALUES
('Residencial Jardim das Acácias', 'Rua das Acácias, 120', 48, 'Marcos Andrade', 'residencial',
  JSON_OBJECT('reservas_area_comum', true, 'estacionamento_rotativo', false, 'controle_convidados_evento', false)),
('Edifício Bosque Verde — Escritórios', 'Av. dos Pinheirais, 900', 32, 'Ana Beatriz Rocha', 'comercial',
  JSON_OBJECT('reservas_area_comum', false, 'estacionamento_rotativo', true, 'controle_convidados_evento', false)),
('Clube Recreativo Vila Nova', 'Estrada do Lago, 45', 0, 'Renato Farias', 'clube',
  JSON_OBJECT('reservas_area_comum', true, 'estacionamento_rotativo', false, 'controle_convidados_evento', true));

-- senha em texto puro só pq é trabalho (de verdade seria bcrypt)
INSERT INTO usuarios (nome, email, senha, perfil, unidade, condominio_id) VALUES
('Renata Souza',      'renata@condoplus.com',   'renata123',   'morador',        '302', 1),
('Marcos Andrade',    'marcos@condoplus.com',   'marcos123',   'sindico',        NULL,  1),
('Patrícia Lima',     'patricia@condoplus.com', 'patricia123', 'administradora', NULL,  NULL),
('Jonas Ferreira',    'jonas@condoplus.com',    'jonas123',    'porteiro',       NULL,  1),
('Carlos Eduardo',    'carlos@condoplus.com',   'carlos123',   'prestador',      NULL,  NULL),
('Bianca Ramos',      'bianca@condoplus.com',   'bianca123',   'suporte',        NULL,  NULL),
('Ana Beatriz Rocha', 'ana@condoplus.com',      'ana123',      'sindico',        NULL,  2),
('Renato Farias',     'renato@condoplus.com',   'renato123',   'sindico',        NULL,  3);

INSERT INTO moradores (nome, unidade, email, status, condominio_id) VALUES
('Renata Souza',     '302',        'renata.souza@email.com',   'ativo',   1),
('João Pereira',     '105',        'joao.pereira@email.com',   'ativo',   1),
('Marina Alves',     '701',        'marina.alves@email.com',   'ativo',   1),
('Eduardo Kimura',   '204',        'e.kimura@email.com',       'inativo', 1),
('Lívia Rocha',      'Sala 801',   'livia@rochalima.com.br',   'ativo',   2),
('Paulo Bastos',     'Sala 1203',  'paulo@estudiobosque.com',  'ativo',   2),
('Sérgio Nakamura',  'Título 018', 'sergio.n@email.com',       'ativo',   3),
('Cláudia Ventura',  'Título 112', 'claudia.v@email.com',      'ativo',   3);

INSERT INTO comunicados (titulo, corpo, condominio_id) VALUES
('Manutenção do elevador social', 'O elevador social ficará indisponível das 9h às 12h para manutenção preventiva.', 1),
('Assembleia geral ordinária', 'Convocação para assembleia no dia 20/09 às 19h, no salão de festas.', 1),
('Dedetização das áreas comuns', 'Dedetização programada para o próximo sábado, das 8h às 10h.', 1),
('Novo controle de acesso à garagem', 'A partir de segunda, o acesso à garagem será feito pelo crachá da empresa.', 2),
('Festa junina do clube', 'Inscrições de convidados abertas até sexta-feira na secretaria.', 3);

INSERT INTO solicitacoes (unidade, titulo, categoria, status, prestador_nome, condominio_id) VALUES
('302', 'Vazamento no teto da garagem',   'Manutenção', 'progresso', 'Carlos Eduardo', 1),
('105', 'Lâmpada queimada no corredor',   'Manutenção', 'aberto',    NULL,             1),
('701', 'Barulho excessivo apto vizinho', 'Ocorrência', 'concluido', NULL,             1),
('701', 'Troca de fechadura do hall',     'Manutenção', 'aberto',    'Carlos Eduardo', 1),
('Sala 801', 'Ar-condicionado do hall sem funcionar', 'Manutenção', 'aberto', NULL,   2);

INSERT INTO documentos (nome, tipo, condominio_id) VALUES
('Ata da Assembleia - Julho 2026', 'PDF', 1),
('Regimento Interno', 'PDF', 1),
('Prestação de Contas - Agosto', 'XLSX', 1),
('Regulamento da garagem', 'PDF', 2),
('Estatuto do clube', 'PDF', 3);

INSERT INTO financeiro (unidade, referencia, valor, vencimento, status, condominio_id) VALUES
('302', 'Setembro/2026', 620.00, '2026-10-10', 'pendente', 1),
('302', 'Agosto/2026',   620.00, '2026-09-10', 'pendente', 1),
('302', 'Julho/2026',    610.00, '2026-08-10', 'pago',     1),
('302', 'Junho/2026',    610.00, '2026-07-10', 'pago',     1),
('105', 'Setembro/2026', 540.00, '2026-10-10', 'pendente', 1),
('105', 'Agosto/2026',   540.00, '2026-09-10', 'pago',     1),
('701', 'Setembro/2026', 890.00, '2026-10-10', 'pendente', 1);

INSERT INTO reservas (area, data_reserva, hora, morador, status, condominio_id) VALUES
('Salão de festas', '2026-10-17', '19h–23h', 'Renata Souza (302)', 'confirmada', 1),
('Churrasqueira',   '2026-10-25', '12h–16h', 'João Pereira (105)', 'pendente',   1),
('Quadra de tênis', '2026-10-18', '8h–10h',  'Sérgio Nakamura (Título 018)', 'pendente', 3);

INSERT INTO encomendas (morador, unidade, descricao, retirado, condominio_id) VALUES
('Renata Souza', '302', 'Caixa média — Correios', FALSE, 1),
('Marina Alves', '701', 'Envelope',               TRUE,  1);

INSERT INTO visitantes (nome, documento, unidade, condominio_id) VALUES
('Carlos Mendes', 'RG 12.345.678-9', '204', 1);

INSERT INTO chamados (usuario, assunto, status, escalado) VALUES
('João Pereira',             'Não consigo redefinir a senha',      'aberto',    FALSE),
('Marcos Andrade (síndico)', 'Erro ao publicar comunicado',        'progresso', FALSE),
('Renata Souza',             'Dúvida sobre reserva de área comum', 'concluido', FALSE);

-- vagas: só o comercial (id 2)
INSERT INTO vagas_estacionamento (condominio_id, codigo, data_reserva, reservado_por) VALUES
(2, 'G-01', CURDATE(), 'Contabilidade Rocha & Lima'),
(2, 'G-02', CURDATE(), NULL),
(2, 'G-03', CURDATE(), 'Estúdio Criativo Bosque'),
(2, 'G-04', CURDATE(), NULL);

-- convidados: só o clube (id 3)
INSERT INTO convidados_evento (condominio_id, evento, convidado, responsavel, status) VALUES
(3, 'Festa junina do clube', 'Fernanda Melo', 'Renato Farias', 'confirmado'),
(3, 'Festa junina do clube', 'Diego Santos',  'Renato Farias', 'convidado'),
(3, 'Torneio de tênis',      'Lucas Prado',   'Renato Farias', 'presente');
