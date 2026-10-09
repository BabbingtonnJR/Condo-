-- Condo+ — Schema do banco de dados (MySQL 8+ / MariaDB 10.6+)
-- Execute este arquivo antes do seed.sql
-- ATENÇÃO: o DROP abaixo apaga o banco anterior para recriá-lo do zero.

DROP DATABASE IF EXISTS condoplus;
CREATE DATABASE condoplus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE condoplus;

-- ------------------------------------------------------------
-- Condomínios (Administradora) — RF05
-- `tipo` e `modulos` são a base da VARIABILIDADE (Parte III):
-- o mesmo software atende clientes diferentes; o que muda é a
-- configuração de cada linha desta tabela.
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Usuários / autenticação e perfis (RF01, RF02, RF03)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Moradores / colaboradores / sócios — CRUD (RF04)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Comunicados (RF06, RF07)
-- ------------------------------------------------------------
CREATE TABLE comunicados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  corpo TEXT,
  publicado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  condominio_id INT NULL,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Solicitações / ocorrências (RF09, RF10, RF11)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Documentos (RF15, RF16)
-- ------------------------------------------------------------
CREATE TABLE documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'PDF',
  publicado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  condominio_id INT NULL,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Financeiro (RF13, RF14)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Reservas de área comum (RF18)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Encomendas (RF26, RF27)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Visitantes (RF28)
-- ------------------------------------------------------------
CREATE TABLE visitantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  documento VARCHAR(30) NULL,
  unidade VARCHAR(20) NOT NULL,
  horario DATETIME DEFAULT CURRENT_TIMESTAMP,
  condominio_id INT NULL,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Chamados de suporte técnico (RF24, RF25)
-- ------------------------------------------------------------
CREATE TABLE chamados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(120) NOT NULL,
  assunto VARCHAR(200) NOT NULL,
  status ENUM('aberto','progresso','concluido') NOT NULL DEFAULT 'aberto',
  escalado BOOLEAN NOT NULL DEFAULT FALSE,
  aberto_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PARTE III — ALTA VARIABILIDADE
-- Tabelas de módulos exclusivos de um tipo de cliente.
-- ============================================================

-- Estacionamento rotativo — EXCLUSIVO de condomínios comerciais
CREATE TABLE vagas_estacionamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  condominio_id INT NOT NULL,
  codigo VARCHAR(10) NOT NULL,          -- ex: "G-01"
  data_reserva DATE NOT NULL,
  reservado_por VARCHAR(120) NULL,      -- NULL = vaga livre
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE
);

-- Controle de convidados por evento — EXCLUSIVO de clubes
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
