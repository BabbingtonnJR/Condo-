-- Babbingtonn — banco do Condo+. roda esse antes do seed.sql
-- cuidado: o DROP lá embaixo apaga o banco antigo e cria tudo de novo
-- toda tabela tem condominio_id, assim um condomínio não vê o do outro

DROP DATABASE IF EXISTS condoplus;
CREATE DATABASE condoplus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE condoplus;

-- condominios (Gabriel) — tipo + modulos = variabilidade
CREATE TABLE condominios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  endereco VARCHAR(200),
  unidades INT NOT NULL DEFAULT 0,
  sindico_nome VARCHAR(120),
  tipo ENUM('residencial','comercial','clube') NOT NULL DEFAULT 'residencial',
  modulos JSON NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- usuarios (Gabriel)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  perfil ENUM('morador','sindico','administradora','porteiro','prestador','suporte') NOT NULL,
  unidade VARCHAR(20) NULL,
  condominio_id INT NULL,
  status ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- moradores (Babbingtonn)
CREATE TABLE moradores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  unidade VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL,
  status ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
  condominio_id INT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- comunicados (Babbingtonn)
CREATE TABLE comunicados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  corpo TEXT,
  publicado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  condominio_id INT NULL,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- solicitacoes (Babbingtonn)
CREATE TABLE solicitacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unidade VARCHAR(20) NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  categoria ENUM('Manutenção','Ocorrência','Outro') NOT NULL DEFAULT 'Outro',
  status ENUM('aberto','progresso','concluido') NOT NULL DEFAULT 'aberto',
  prestador_nome VARCHAR(120) NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  condominio_id INT NULL,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- documentos (André)
CREATE TABLE documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'PDF',
  publicado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  condominio_id INT NULL,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- financeiro (André)
CREATE TABLE financeiro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unidade VARCHAR(20) NOT NULL,
  referencia VARCHAR(20) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  status ENUM('pendente','pago') NOT NULL DEFAULT 'pendente',
  condominio_id INT NULL,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- reservas (André)
CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  area VARCHAR(100) NOT NULL,
  data_reserva DATE NOT NULL,
  hora VARCHAR(40) NOT NULL DEFAULT '',
  morador VARCHAR(120) NOT NULL,
  status ENUM('pendente','confirmada','cancelada') NOT NULL DEFAULT 'pendente',
  condominio_id INT NULL,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- encomendas (Marcel)
CREATE TABLE encomendas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  morador VARCHAR(120) NOT NULL,
  unidade VARCHAR(20) NOT NULL,
  descricao VARCHAR(150) NOT NULL DEFAULT '',
  recebido_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  retirado BOOLEAN NOT NULL DEFAULT FALSE,
  condominio_id INT NULL,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- visitantes (Marcel)
CREATE TABLE visitantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  documento VARCHAR(30) NULL,
  unidade VARCHAR(20) NOT NULL,
  horario DATETIME DEFAULT CURRENT_TIMESTAMP,
  condominio_id INT NULL,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- chamados (Marcel)
CREATE TABLE chamados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(120) NOT NULL,
  assunto VARCHAR(200) NOT NULL,
  status ENUM('aberto','progresso','concluido') NOT NULL DEFAULT 'aberto',
  escalado BOOLEAN NOT NULL DEFAULT FALSE,
  aberto_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  condominio_id INT NULL, -- v4: o painel da administradora (SE06) conta chamados por condomínio
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- vagas_estacionamento (Gabriel) — só no comercial
CREATE TABLE vagas_estacionamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  condominio_id INT NOT NULL,
  codigo VARCHAR(10) NOT NULL,          -- tipo "G-01"
  data_reserva DATE NOT NULL,
  reservado_por VARCHAR(120) NULL,      -- NULL = tá livre
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE
);

-- convidados_evento (Gabriel) — só no clube
CREATE TABLE convidados_evento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  condominio_id INT NOT NULL,
  evento VARCHAR(150) NOT NULL,
  convidado VARCHAR(120) NOT NULL,
  responsavel VARCHAR(120) NOT NULL DEFAULT '',
  status ENUM('convidado','confirmado','presente') NOT NULL DEFAULT 'convidado',
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE
);
