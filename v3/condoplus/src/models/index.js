// André — junta todas as classes pra importar de um lugar só
module.exports = {
  Entidade: require('condoplus-core').Entidade, // veio do pacote (v6)
  Usuario: require('./Usuario'), // Gabriel
  Condominio: require('./Condominio'), // Gabriel
  Morador: require('./Morador'), // Babbingtonn
  Comunicado: require('./Comunicado'), // Babbingtonn
  Solicitacao: require('./Solicitacao'), // Babbingtonn
  Documento: require('./Documento'), // André
  Lancamento: require('./Lancamento'), // André
  Reserva: require('./Reserva'), // André
  Encomenda: require('./Encomenda'), // Marcel
  Visitante: require('./Visitante'), // Marcel
  Chamado: require('./Chamado'), // Marcel
  Vaga: require('./Vaga'), // Gabriel
  Convidado: require('./Convidado'), // Gabriel
};
