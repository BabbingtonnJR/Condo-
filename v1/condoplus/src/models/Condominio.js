const Entidade = require('./Entidade');
const { Conv } = require('./conversores');
const { ErroValidacao } = require('../erros');

/**
 * Condomínio (cliente da administradora). Tabela: condominios
 * Atributos: id, nome, endereco, unidades, sindico_nome, tipo, modulos, criado_em
 *
 * `tipo` + `modulos` são a base da VARIABILIDADE (Parte III).
 */
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

  alterarModulo(modulo, ativo) {
    if (!Condominio.MODULOS.includes(modulo)) throw new ErroValidacao(`Módulo desconhecido: ${modulo}`);
    this.modulos = { ...this.modulos, [modulo]: !!ativo };
    return this;
  }

  /** Tipo e módulos NÃO mudam pela edição comum:
   *  o tipo é definido na criação (pela fábrica) e os módulos têm tela própria. */
  atualizarCom(dados = {}) {
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
