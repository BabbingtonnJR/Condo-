/** Ponto único de importação das 13 classes de domínio. */
module.exports = {
  Entidade: require('./Entidade'),
  Usuario: require('./Usuario'),
  Condominio: require('./Condominio'),
  Morador: require('./Morador'),
  Comunicado: require('./Comunicado'),
  Solicitacao: require('./Solicitacao'),
  Documento: require('./Documento'),
  Lancamento: require('./Lancamento'),
  Reserva: require('./Reserva'),
  Encomenda: require('./Encomenda'),
  Visitante: require('./Visitante'),
  Chamado: require('./Chamado'),
  Vaga: require('./Vaga'),
  Convidado: require('./Convidado'),
};
