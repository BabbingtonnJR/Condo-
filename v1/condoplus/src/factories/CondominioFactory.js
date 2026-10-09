const Condominio = require('../models/Condominio');
const { ErroValidacao } = require('../erros');

/**
 * ============================================================
 * PADRÃO FACTORY METHOD — exemplo 1 (forma clássica do GoF)
 * ============================================================
 * Participantes:
 *   - Produto ........... ConfiguracaoCondominio
 *   - Criador abstrato .. CondominioCreator      (declara o factory method)
 *   - Criadores concretos ResidencialCreator, ComercialCreator, ClubeCreator
 *
 * O factory method é criarConfiguracao(). Cada subclasse decide QUAL
 * configuração criar (quais módulos vêm ligados e quais rótulos a tela usa).
 * O método novoCondominio() do criador abstrato usa o factory method sem
 * saber qual subclasse está rodando.
 *
 * É AQUI que a VARIABILIDADE da linha de produto nasce: para atender um
 * novo tipo de cliente (ex.: "coworking") basta criar CoworkingCreator,
 * sem alterar nenhuma tela nem rota existente.
 */

/** Produto: a configuração de um tipo de condomínio. */
class ConfiguracaoCondominio {
  constructor({ tipo, descricao, modulos, rotulos }) {
    this.tipo = tipo;
    this.descricao = descricao;
    this.modulos = modulos;
    this.rotulos = rotulos; // textos que mudam na interface conforme o cliente
    Object.freeze(this);
  }

  modulosAtivos() {
    return Object.keys(this.modulos).filter((m) => this.modulos[m]);
  }
}

/** Criador abstrato. */
class CondominioCreator {
  constructor() {
    if (new.target === CondominioCreator) throw new Error('CondominioCreator é abstrato.');
  }

  /** FACTORY METHOD — as subclasses sobrescrevem. */
  criarConfiguracao() {
    throw new Error(`${this.constructor.name} precisa implementar criarConfiguracao().`);
  }

  /** Operação que USA o factory method (não sabe qual subclasse está ativa). */
  novoCondominio(dados = {}) {
    const config = this.criarConfiguracao();
    return new Condominio({ ...dados, tipo: config.tipo, modulos: { ...config.modulos } });
  }

  rotulos() {
    return this.criarConfiguracao().rotulos;
  }

  /** Escolhe o criador concreto pelo tipo informado. */
  static paraTipo(tipo) {
    const Criador = CRIADORES[tipo];
    if (!Criador) throw new ErroValidacao(`Tipo de condomínio inválido: "${tipo}".`);
    return new Criador();
  }
}

class ResidencialCreator extends CondominioCreator {
  criarConfiguracao() {
    return new ConfiguracaoCondominio({
      tipo: 'residencial',
      descricao: 'Prédio ou condomínio de casas',
      modulos: { reservas_area_comum: true, estacionamento_rotativo: false, controle_convidados_evento: false },
      rotulos: { pessoas: 'Moradores', pessoa: 'morador', unidade: 'Unidade' },
    });
  }
}

class ComercialCreator extends CondominioCreator {
  criarConfiguracao() {
    return new ConfiguracaoCondominio({
      tipo: 'comercial',
      descricao: 'Prédio de escritórios / salas comerciais',
      modulos: { reservas_area_comum: false, estacionamento_rotativo: true, controle_convidados_evento: false },
      rotulos: { pessoas: 'Colaboradores', pessoa: 'colaborador', unidade: 'Sala/Andar' },
    });
  }
}

class ClubeCreator extends CondominioCreator {
  criarConfiguracao() {
    return new ConfiguracaoCondominio({
      tipo: 'clube',
      descricao: 'Clube recreativo com sócios',
      modulos: { reservas_area_comum: true, estacionamento_rotativo: false, controle_convidados_evento: true },
      rotulos: { pessoas: 'Sócios', pessoa: 'sócio', unidade: 'Título' },
    });
  }
}

const CRIADORES = { residencial: ResidencialCreator, comercial: ComercialCreator, clube: ClubeCreator };

module.exports = { ConfiguracaoCondominio, CondominioCreator, ResidencialCreator, ComercialCreator, ClubeCreator };
