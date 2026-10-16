// Gabriel — Factory Method #1 (o principal, é ele que segura a variabilidade)
// cada tipo de cliente tem seu Creator. tipo novo (tipo um coworking) = só criar outro Creator
// uso: CondominioCreator.paraTipo('comercial').novoCondominio({ nome: '...' })
const Condominio = require('../models/Condominio');
const { ErroValidacao } = require('condoplus-core');

class ConfiguracaoCondominio {  // o "produto" que sai da fábrica
  constructor({ tipo, descricao, modulos, rotulos }) {
    this.tipo = tipo;
    this.descricao = descricao;
    this.modulos = modulos;
    this.rotulos = rotulos; // Moradores / Colaboradores / Sócios...
    Object.freeze(this);
  }

  modulosAtivos() {
    return Object.keys(this.modulos).filter((m) => this.modulos[m]);
  }
}

class CondominioCreator {  // criador abstrato (as filhas tão lá embaixo)
  constructor() {
    if (new.target === CondominioCreator) throw new Error('CondominioCreator é abstrato.');
  }

  criarConfiguracao() {  // o factory method, cada filha faz o seu
    throw new Error(`${this.constructor.name} precisa implementar criarConfiguracao().`);
  }

  novoCondominio(dados = {}) {  // não sabe qual filha é, só chama a fábrica
    const config = this.criarConfiguracao();
    return new Condominio({ ...dados, tipo: config.tipo, modulos: { ...config.modulos } });
  }

  rotulos() {
    return this.criarConfiguracao().rotulos;
  }

  static paraTipo(tipo) {  // acha o criador certo pelo tipo
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

// tipo novo? só adicionar aqui
const CRIADORES = { residencial: ResidencialCreator, comercial: ComercialCreator, clube: ClubeCreator };

module.exports = { ConfiguracaoCondominio, CondominioCreator, ResidencialCreator, ComercialCreator, ClubeCreator };
