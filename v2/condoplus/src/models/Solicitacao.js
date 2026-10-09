// Babbingtonn — pedido de manutenção que o morador abre
const Entidade = require('./Entidade');
const { Conv } = require('./conversores');
const { ErroValidacao } = require('../erros');

class Solicitacao extends Entidade {
  static CATEGORIAS = ['Manutenção', 'Ocorrência', 'Outro'];
  static STATUS = ['aberto', 'progresso', 'concluido'];
  static campos = ['unidade', 'titulo', 'categoria', 'status', 'prestador_nome', 'condominio_id'];
  static somenteLeitura = ['criado_em'];
  static padroes = { categoria: 'Outro', status: 'aberto' };
  static conversores = {
    unidade: Conv.texto, titulo: Conv.texto, categoria: Conv.texto, status: Conv.texto,
    prestador_nome: Conv.textoOuNulo, condominio_id: Conv.idOuNulo,
  };

  validar() {
    const erros = [];
    if (!this.unidade) erros.push('Informe a unidade.');
    if (!this.titulo) erros.push('Descreva a solicitação.');
    if (!Solicitacao.CATEGORIAS.includes(this.categoria)) erros.push('Categoria inválida.');
    if (!Solicitacao.STATUS.includes(this.status)) erros.push('Status inválido.');
    return erros;
  }

  estaConcluida() { return this.status === 'concluido'; }

  atribuirPrestador(nome) {
    this.prestador_nome = Conv.textoOuNulo(nome);
    return this;
  }

  alterarStatus(novo) {
    if (!Solicitacao.STATUS.includes(novo)) throw new ErroValidacao('Status inválido.');
    this.status = novo;
    return this;
  }
}

module.exports = Solicitacao;
