-- Babbingtonn — dados de exemplo pra nenhuma tela ficar vazia. roda depois do schema.sql
USE condoplus;

INSERT INTO condominios (nome, endereco, unidades, sindico_nome, tipo, modulos) VALUES
('Residencial Jardim das Acácias', 'Rua das Acácias, 120', 48, 'Marcos Andrade', 'residencial',
  JSON_OBJECT('reservas_area_comum', true, 'estacionamento_rotativo', false, 'controle_convidados_evento', false)),
('Edifício Bosque Verde — Escritórios', 'Av. dos Pinheirais, 900', 32, 'Ana Beatriz Rocha', 'comercial',
  JSON_OBJECT('reservas_area_comum', false, 'estacionamento_rotativo', true, 'controle_convidados_evento', false)),
('Clube Recreativo Vila Nova', 'Estrada do Lago, 45', 0, 'Renato Farias', 'clube',
  JSON_OBJECT('reservas_area_comum', true, 'estacionamento_rotativo', false, 'controle_convidados_evento', true));

-- v4: datas relativas ao dia de hoje, pra inadimplência/prazos/ocupação sempre terem dado
SET @v0 = DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-10'), INTERVAL 1 MONTH); -- vence mês que vem (competência atual)
SET @v1 = DATE_FORMAT(CURDATE(), '%Y-%m-10');                             -- venceu dia 10 deste mês
SET @v2 = DATE_SUB(@v1, INTERVAL 1 MONTH);
SET @v3 = DATE_SUB(@v1, INTERVAL 2 MONTH);
SET @meses = 'Janeiro,Fevereiro,Março,Abril,Maio,Junho,Julho,Agosto,Setembro,Outubro,Novembro,Dezembro';
SET @r0 = CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(@meses, ',', MONTH(DATE_SUB(@v0, INTERVAL 1 MONTH))), ',', -1), '/', YEAR(DATE_SUB(@v0, INTERVAL 1 MONTH)));
SET @r1 = CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(@meses, ',', MONTH(DATE_SUB(@v1, INTERVAL 1 MONTH))), ',', -1), '/', YEAR(DATE_SUB(@v1, INTERVAL 1 MONTH)));
SET @r2 = CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(@meses, ',', MONTH(DATE_SUB(@v2, INTERVAL 1 MONTH))), ',', -1), '/', YEAR(DATE_SUB(@v2, INTERVAL 1 MONTH)));
SET @r3 = CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(@meses, ',', MONTH(DATE_SUB(@v3, INTERVAL 1 MONTH))), ',', -1), '/', YEAR(DATE_SUB(@v3, INTERVAL 1 MONTH)));
SET @mes = DATE_FORMAT(CURDATE(), '%Y-%m-');

-- senha em texto puro só pq é trabalho (de verdade seria bcrypt)
INSERT INTO usuarios (nome, email, senha, perfil, unidade, condominio_id) VALUES
('Renata Souza',      'renata@condoplus.com',   'renata123',   'morador',        '302', 1),
('Marcos Andrade',    'marcos@condoplus.com',   'marcos123',   'sindico',        NULL,  1),
('Patrícia Lima',     'patricia@condoplus.com', 'patricia123', 'administradora', NULL,  NULL),
('Jonas Ferreira',    'jonas@condoplus.com',    'jonas123',    'porteiro',       NULL,  1),
('Carlos Eduardo',    'carlos@condoplus.com',   'carlos123',   'prestador',      NULL,  NULL),
('Fábio Lima',        'fabio@condoplus.com',    'fabio123',    'prestador',      NULL,  NULL),
('Bianca Ramos',      'bianca@condoplus.com',   'bianca123',   'suporte',        NULL,  NULL),
('Ana Beatriz Rocha', 'ana@condoplus.com',      'ana123',      'sindico',        NULL,  2),
('Renato Farias',     'renato@condoplus.com',   'renato123',   'sindico',        NULL,  3);

INSERT INTO moradores (nome, unidade, email, status, condominio_id) VALUES
('Renata Souza',     '302',        'renata.souza@email.com',   'ativo',   1),
('João Pereira',     '105',        'joao.pereira@email.com',   'ativo',   1),
('Marina Alves',     '701',        'marina.alves@email.com',   'ativo',   1),
('Eduardo Kimura',   '204',        'e.kimura@email.com',       'inativo', 1),
('Paula Mendes',     '402',        'paula.mendes@email.com',   'ativo',   1),
('Ricardo Alves',    '503',        'ricardo.alves@email.com',  'ativo',   1),
('Lívia Rocha',      'Sala 801',   'livia@rochalima.com.br',   'ativo',   2),
('Paulo Bastos',     'Sala 1203',  'paulo@estudiobosque.com',  'ativo',   2),
('Sérgio Nakamura',  'Título 018', 'sergio.n@email.com',       'ativo',   3),
('Cláudia Ventura',  'Título 112', 'claudia.v@email.com',      'ativo',   3);

INSERT INTO comunicados (titulo, corpo, condominio_id, publicado_em) VALUES -- v5: datas espalhadas pra busca por período (CE06) fazer sentido
('Manutenção do elevador social', 'O elevador social ficará indisponível das 9h às 12h para manutenção preventiva.', 1, NOW() - INTERVAL 2 DAY),
('Assembleia geral ordinária', 'Convocação para assembleia no dia 20/09 às 19h, no salão de festas.', 1, NOW() - INTERVAL 35 DAY),
('Dedetização das áreas comuns', 'Dedetização programada para o próximo sábado, das 8h às 10h.', 1, NOW() - INTERVAL 9 DAY),
('Limpeza da caixa d''água', 'A água será interrompida das 8h às 14h para limpeza da caixa d''água.', 1, NOW() - INTERVAL 60 DAY),
('Novo controle de acesso à garagem', 'A partir de segunda, o acesso à garagem será feito pelo crachá da empresa.', 2, NOW() - INTERVAL 4 DAY),
('Festa junina do clube', 'Inscrições de convidados abertas até sexta-feira na secretaria.', 3, NOW() - INTERVAL 15 DAY);

INSERT INTO solicitacoes (unidade, titulo, categoria, status, prestador_nome, condominio_id, criado_em) VALUES
('302', 'Vazamento no teto da garagem',   'Manutenção', 'progresso', 'Carlos Eduardo', 1, NOW() - INTERVAL 12 DAY),
('105', 'Lâmpada queimada no corredor',   'Manutenção', 'aberto',    NULL,             1, NOW() - INTERVAL 3 DAY),
('701', 'Barulho excessivo apto vizinho', 'Ocorrência', 'concluido', NULL,             1, NOW() - INTERVAL 20 DAY),
('701', 'Troca de fechadura do hall',     'Manutenção', 'aberto',    'Carlos Eduardo', 1, NOW() - INTERVAL 6 DAY),
('402', 'Portão da garagem travando',     'Manutenção', 'concluido', 'Fábio Lima',     1, NOW() - INTERVAL 25 DAY),
('503', 'Infiltração na parede da sala',  'Manutenção', 'progresso', 'Fábio Lima',     1, NOW() - INTERVAL 9 DAY),
('204', 'Cachorro solto na área comum',   'Ocorrência', 'aberto',    NULL,             1, NOW() - INTERVAL 2 DAY),
('105', 'Interfone sem som',              'Manutenção', 'concluido', 'Carlos Eduardo', 1, NOW() - INTERVAL 30 DAY),
('302', 'Sugestão de bicicletário',       'Outro',      'aberto',    NULL,             1, NOW() - INTERVAL 15 DAY),
('Sala 801', 'Ar-condicionado do hall sem funcionar', 'Manutenção', 'aberto', NULL,   2, NOW() - INTERVAL 4 DAY),
('Título 018', 'Rede da quadra rasgada',  'Manutenção', 'concluido', 'Fábio Lima',     3, NOW() - INTERVAL 10 DAY);

INSERT INTO documentos (nome, tipo, condominio_id) VALUES
('Ata da Assembleia - Julho 2026', 'PDF', 1),
('Regimento Interno', 'PDF', 1),
('Prestação de Contas - Agosto', 'XLSX', 1),
('Regulamento da garagem', 'PDF', 2),
('Estatuto do clube', 'PDF', 3);

INSERT INTO financeiro (unidade, referencia, valor, vencimento, status, condominio_id) VALUES
-- residencial (id 1): 3 meses fechados + a competência atual (ainda vai vencer)
('105', @r3, 540.00, @v3, 'pago', 1), ('204', @r3, 580.00, @v3, 'pago', 1), ('302', @r3, 610.00, @v3, 'pago', 1),
('402', @r3, 650.00, @v3, 'pago', 1), ('503', @r3, 650.00, @v3, 'pago', 1), ('701', @r3, 890.00, @v3, 'pago', 1),
('105', @r2, 540.00, @v2, 'pago', 1), ('204', @r2, 580.00, @v2, 'pendente', 1), ('302', @r2, 620.00, @v2, 'pendente', 1),
('402', @r2, 650.00, @v2, 'pago', 1), ('503', @r2, 650.00, @v2, 'pago', 1), ('701', @r2, 890.00, @v2, 'pago', 1),
('105', @r1, 540.00, @v1, 'pago', 1), ('204', @r1, 580.00, @v1, 'pendente', 1), ('302', @r1, 620.00, @v1, 'pendente', 1),
('402', @r1, 650.00, @v1, 'pago', 1), ('503', @r1, 650.00, @v1, 'pago', 1), ('701', @r1, 890.00, @v1, 'pendente', 1),
('105', @r0, 540.00, @v0, 'pendente', 1), ('204', @r0, 580.00, @v0, 'pendente', 1), ('302', @r0, 620.00, @v0, 'pendente', 1),
('402', @r0, 650.00, @v0, 'pendente', 1), ('503', @r0, 650.00, @v0, 'pendente', 1), ('701', @r0, 890.00, @v0, 'pendente', 1),
-- comercial (id 2)
('Sala 801', @r2, 1200.00, @v2, 'pago', 2), ('Sala 1203', @r2, 950.00, @v2, 'pago', 2),
('Sala 801', @r1, 1200.00, @v1, 'pago', 2), ('Sala 1203', @r1, 950.00, @v1, 'pendente', 2),
('Sala 801', @r0, 1200.00, @v0, 'pendente', 2), ('Sala 1203', @r0, 950.00, @v0, 'pendente', 2),
-- clube (id 3)
('Título 018', @r1, 300.00, @v1, 'pago', 3), ('Título 112', @r1, 300.00, @v1, 'pendente', 3),
('Título 018', @r0, 300.00, @v0, 'pendente', 3), ('Título 112', @r0, 300.00, @v0, 'pendente', 3);

INSERT INTO reservas (area, data_reserva, hora, morador, status, condominio_id) VALUES
('Salão de festas', '2026-10-17', '19h–23h', 'Renata Souza (302)', 'confirmada', 1),
('Quadra poliesportiva', CURDATE(), '18h–20h', 'Ricardo Alves (503)', 'confirmada', 1), -- v5: reservas de hoje pra consulta CE04
('Churrasqueira', CURDATE(), '12h–16h', 'João Pereira (105)', 'pendente', 1),
('Salão de festas', CONCAT(@mes, '03'), '19h–23h', 'Paula Mendes (402)', 'confirmada', 1),
('Salão de festas', CONCAT(@mes, '09'), '20h–23h', 'João Pereira (105)', 'cancelada',  1),
('Salão de festas', CONCAT(@mes, '24'), '19h–23h', 'Marina Alves (701)', 'pendente',   1),
('Churrasqueira',   CONCAT(@mes, '04'), '12h–16h', 'Ricardo Alves (503)', 'confirmada', 1),
('Churrasqueira',   CONCAT(@mes, '11'), '12h–16h', 'Renata Souza (302)', 'confirmada', 1),
('Churrasqueira',   CONCAT(@mes, '18'), '13h–17h', 'Paula Mendes (402)', 'confirmada', 1),
('Churrasqueira',   CONCAT(@mes, '25'), '12h–16h', 'João Pereira (105)', 'pendente',   1),
('Quadra poliesportiva', CONCAT(@mes, '06'), '18h–20h', 'Marina Alves (701)', 'confirmada', 1),
('Quadra poliesportiva', CONCAT(@mes, '13'), '18h–20h', 'Ricardo Alves (503)', 'cancelada',  1),
('Quadra de tênis', CONCAT(@mes, '05'), '8h–10h',  'Sérgio Nakamura (Título 018)', 'confirmada', 3),
('Quadra de tênis', CONCAT(@mes, '12'), '8h–10h',  'Cláudia Ventura (Título 112)', 'confirmada', 3),
('Quadra de tênis', '2026-10-18', '8h–10h',  'Sérgio Nakamura (Título 018)', 'pendente', 3);

INSERT INTO encomendas (morador, unidade, descricao, retirado, condominio_id) VALUES
('Renata Souza', '302', 'Caixa média — Correios', FALSE, 1),
('Marina Alves', '701', 'Envelope',               TRUE,  1);

INSERT INTO visitantes (nome, documento, unidade, condominio_id) VALUES
('Carlos Mendes', 'RG 12.345.678-9', '204', 1);

INSERT INTO chamados (usuario, assunto, status, escalado, condominio_id, aberto_em) VALUES
('João Pereira',             'Não consigo redefinir a senha',      'aberto',    FALSE, 1, NOW() - INTERVAL 52 HOUR),
('Marcos Andrade (síndico)', 'Erro ao publicar comunicado',        'progresso', FALSE, 1, NOW() - INTERVAL 19 HOUR),
('Renata Souza',             'Dúvida sobre reserva de área comum', 'concluido', FALSE, 1, NOW() - INTERVAL 5 DAY),
('Ana Beatriz Rocha',        'Falha na notificação de encomenda',  'progresso', TRUE,  2, NOW() - INTERVAL 100 HOUR),
('Lívia Rocha',              'Boleto não aparece no app',          'aberto',    FALSE, 2, NOW() - INTERVAL 6 HOUR),
('Renato Farias',            'Lista de convidados não salva',      'aberto',    FALSE, 3, NOW() - INTERVAL 30 HOUR);

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
