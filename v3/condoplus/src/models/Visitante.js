// Marcel — visitante da portaria. o horário de entrada o banco preenche sozinho
const { Entidade } = require('condoplus-core');
const { Conv } = require('condoplus-core');

class Visitante extends Entidade {
  static campos = ['nome', 'documento', 'unidade', 'condominio_id'];
  static somenteLeitura = ['horario'];
  static conversores = {
    nome: Conv.texto, documento: Conv.textoOuNulo, unidade: Conv.texto, condominio_id: Conv.idOuNulo,
  };

  validar() {
    const erros = [];
    if (!this.nome) erros.push('Informe o nome do visitante.');
    if (!this.unidade) erros.push('Informe a unidade visitada.');
    return erros;
  }

  descricao() {
    return `${this.nome} → unidade ${this.unidade}`;
  }
}

module.exports = Visitante;
