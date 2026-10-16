// Gabriel — condomínio. tipo + modulos é a nossa variabilidade
// quem cria um novo é a minha fábrica (factories/CondominioFactory.js)
const { Entidade } = require('condoplus-core');
const { Conv } = require('condoplus-core');
const { ErroValidacao } = require('condoplus-core');

class Condominio extends Entidade {
  static TIPOS = ['residencial', 'comercial', 'clube'];
  static MODULOS = ['reservas_area_comum', 'estacionamento_rotativo', 'controle_convidados_evento'];
  static campos = ['nome', 'endereco', 'unidades', 'sindico_nome', 'tipo', 'modulos'];
  static somenteLeitura = ['criado_em'];
  static padroes = { tipo: 'residencial', unidades: 0, modulos: {} };
  static conversores = {
    nome: Conv.texto, endereco: Conv.texto, unidades: Conv.inteiro,
    sindico_nome: Conv.texto, tipo: Conv.texto, modulos: Conv.json,
  };

  validar() {
    const erros = [];
    if (!this.nome) erros.push('Informe o nome do condomínio.');
    if (!Condominio.TIPOS.includes(this.tipo)) erros.push('Tipo de condomínio inválido.');
    if (this.unidades < 0) erros.push('Número de unidades não pode ser negativo.');
    return erros;
  }

  temModulo(modulo) { return !!this.modulos[modulo]; }

  modulosAtivos() { return Object.keys(this.modulos).filter((m) => this.modulos[m]); }

  alterarModulo(modulo, ativo) {  // é o que a tela de módulos chama
    if (!Condominio.MODULOS.includes(modulo)) throw new ErroValidacao(`Módulo desconhecido: ${modulo}`);
    this.modulos = { ...this.modulos, [modulo]: !!ativo };
    return this;
  }

  atualizarCom(dados = {}) {  // no editar normal, tipo e módulos ficam como estão
    const { tipo, modulos, ...resto } = dados;
    return super.atualizarCom(resto);
  }

  toDB() {
    const linha = super.toDB();
    linha.modulos = JSON.stringify(this.modulos || {});
    return linha;
  }
}

module.exports = Condominio;
