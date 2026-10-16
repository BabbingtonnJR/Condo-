// Gabriel — Factory Method das consultas: pede pelo nome e vem a classe certa
// uso: ConsultaFactory.criar('morador-unidade').executar({ unidade: '302', condominio_id: 1 })
const { log } = require('condoplus-core');

const REGISTRO = {
  'morador-unidade': require('./ConsultaMoradorUnidade'), // CE01 (Babbingtonn)
  solicitacoes: require('./ConsultaSolicitacoes'),        // CE02 (Babbingtonn)
  boletos: require('./ConsultaBoletos'),                  // CE03 (André)
  reservas: require('./ConsultaReservas'),                // CE04 (André)
  chamados: require('./ConsultaChamados'),                // CE05 (Marcel)
  comunicados: require('./ConsultaComunicados'),          // CE06 (Marcel)
  condominios: require('./ConsultaCondominios'),          // CE07 (Gabriel)
  usuarios: require('./ConsultaUsuarios'),                // CE08 (Gabriel)
};

class ConsultaFactory {
  static criar(nome) {
    const Classe = REGISTRO[nome];
    if (!Classe) {
      const erro = new Error(`Consulta desconhecida: "${nome}".`);
      erro.status = 404;
      throw erro;
    }
    log.registrar('FABRICA', `ConsultaFactory.criar('${nome}') -> ${Classe.name}  (Factory Method)`);
    return new Classe();
  }

  static disponiveis() {
    return Object.entries(REGISTRO).map(([nome, C]) => ({ nome, codigo: C.codigo, titulo: C.titulo, entradas: C.entradas }));
  }
}

module.exports = ConsultaFactory;
