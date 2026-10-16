-- banco do projeto de exemplo (não tem nada a ver com o Condo+)
DROP DATABASE IF EXISTS exemplo_reuso;
CREATE DATABASE exemplo_reuso CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE exemplo_reuso;
CREATE TABLE livros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  autor VARCHAR(120) NOT NULL,
  ano INT NULL
);
INSERT INTO livros (titulo, autor, ano) VALUES ('Dom Casmurro', 'Machado de Assis', 1899), ('Vidas Secas', 'Graciliano Ramos', 1938);
