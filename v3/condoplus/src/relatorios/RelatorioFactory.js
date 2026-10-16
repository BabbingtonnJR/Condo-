// Gabriel — mais um Factory Method: pede o relatório pelo nome e a fábrica entrega a classe certa
// uso: RelatorioFactory.criar('inadimplencia').gerar({ condominio_id: 1 })
const { log } = require('condoplus-core');

const REGISTRO = {
  inadimplencia: require('./RelatorioInadimplencia'),               // SE01 (André)
  demonstrativo: require('./RelatorioDemonstrativo'),               // SE02 (André)
  solicitacoes: require('./RelatorioSolicitacoes'),                 // SE03 (Babbingtonn)
  ocupacao: require('./RelatorioOcupacao'),                         // SE04 (Gabriel)
  'prazo-chamados': require('./RelatorioPrazoChamados'),            // SE05 (Marcel)
  'painel-administradora': require('./RelatorioPainelAdministradora'), // SE06 (Gabriel)
};

class RelatorioFactory {
  static criar(nome) {  // a fábrica em si
    const Classe = REGISTRO[nome];
    if (!Classe) {
      const erro = new Error(`Relatório desconhecido: "${nome}".`);
      erro.status = 404;
      throw erro;
    }
    log.registrar('FABRICA', `RelatorioFactory.criar('${nome}') -> ${Classe.name}  (Factory Method)`);
    return new Classe();
  }

  static disponiveis() {
    return Object.entries(REGISTRO).map(([nome, C]) => ({ nome, codigo: C.codigo, titulo: C.titulo }));
  }
}

module.exports = RelatorioFactory;
