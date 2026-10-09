const Entidade = require('./Entidade');
const { Conv, ehEmail } = require('./conversores');

/**
 * Morador / colaborador / sócio (o rótulo muda conforme o tipo de condomínio).
 * Tabela: moradores
 * Atributos: id, nome, unidade, email, status, condominio_id, criado_em
 */
class Morador extends Entidade {
  static campos = ['nome', 'unidade', 'email', 'status', 'condominio_id'];
  static somenteLeitura = ['criado_em'];
  static padroes = { status: 'ativo' };
  static conversores = {
    nome: Conv.texto, unidade: Conv.texto, email: (v) => Conv.texto(v).toLowerCase(),
    status: Conv.texto, condominio_id: Conv.idOuNulo,
  };

  validar() {
    const erros = [];
    if (!this.nome) erros.push('Informe o nome.');
    if (!this.unidade) erros.push('Informe a unidade.');
    if (!ehEmail(this.email)) erros.push('Informe um e-mail válido.');
    if (!['ativo', 'inativo'].includes(this.status)) erros.push('Status inválido.');
    return erros;
  }

  ehAtivo() { return this.status === 'ativo'; }

  alternarStatus() {
    this.status = this.ehAtivo() ? 'inativo' : 'ativo';
    return this;
  }
}

module.exports = Morador;
