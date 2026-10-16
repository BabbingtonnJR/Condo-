// André — os 13 repositórios. cada um só fala qual é a tabela; quem tem regra extra preenche um gancho
const { BaseRepository } = require('condoplus-core');
const M = require('../models');
const { ErroValidacao } = require('condoplus-core');

class UsuarioRepository extends BaseRepository {
  constructor() { super('usuarios', M.Usuario, { ordem: 'nome', filtros: ['perfil', 'condominio_id', 'status'] }); }

  async antesDeSalvar(u) {  // gancho: email repetido não passa
    if (await this.existeOutro('email = ?', [u.email], u.id)) {
      throw new ErroValidacao('Já existe um usuário com este e-mail.');
    }
  }

  async buscarPorEmail(email) {
    const [linha] = await this.db.query('SELECT * FROM usuarios WHERE email = ?', [String(email || '').trim().toLowerCase()]);
    return linha ? this.paraEntidade(linha) : null;
  }
}

class CondominioRepository extends BaseRepository {
  constructor() { super('condominios', M.Condominio, { ordem: 'nome', filtros: ['tipo'] }); }

  async antesDeExcluir(id) {  // gancho: tem gente vinculada? não deixa excluir
    const [{ total }] = await this.db.query(
      `SELECT (SELECT COUNT(*) FROM usuarios WHERE condominio_id = ?) +
              (SELECT COUNT(*) FROM moradores WHERE condominio_id = ?) AS total`, [id, id]);
    if (Number(total) > 0) {
      throw new ErroValidacao('Este condomínio tem usuários/moradores vinculados. Remova-os antes de excluir.');
    }
  }
}

class MoradorRepository extends BaseRepository {
  constructor() { super('moradores', M.Morador, { ordem: 'nome', filtros: ['condominio_id', 'status', 'unidade'] }); }

  async antesDeSalvar(m) {  // gancho: email não repete no mesmo condomínio
    if (await this.existeOutro('email = ? AND condominio_id <=> ?', [m.email, m.condominio_id], m.id)) {
      throw new ErroValidacao('Já existe um cadastro com este e-mail neste condomínio.');
    }
  }
}

class ComunicadoRepository extends BaseRepository {
  constructor() { super('comunicados', M.Comunicado, { ordem: 'publicado_em DESC, id DESC', filtros: ['condominio_id'] }); }
}

class SolicitacaoRepository extends BaseRepository {
  constructor() {
    super('solicitacoes', M.Solicitacao, {
      ordem: 'criado_em DESC, id DESC', filtros: ['condominio_id', 'unidade', 'prestador_nome', 'status'],
    });
  }
}

class DocumentoRepository extends BaseRepository {
  constructor() { super('documentos', M.Documento, { ordem: 'publicado_em DESC, id DESC', filtros: ['condominio_id', 'tipo'] }); }
}

class LancamentoRepository extends BaseRepository {
  constructor() { super('financeiro', M.Lancamento, { ordem: 'vencimento DESC, unidade', filtros: ['condominio_id', 'unidade', 'status'] }); }

  async antesDeSalvar(l) {  // gancho: um boleto por mês pra cada unidade
    if (await this.existeOutro('unidade = ? AND referencia = ? AND condominio_id <=> ?', [l.unidade, l.referencia, l.condominio_id], l.id)) {
      throw new ErroValidacao(`Já existe lançamento de ${l.referencia} para a unidade ${l.unidade}.`);
    }
  }
}

class ReservaRepository extends BaseRepository {
  constructor() { super('reservas', M.Reserva, { ordem: 'data_reserva, id', filtros: ['condominio_id', 'status'] }); }

  async antesDeSalvar(r) {  // gancho: área já reservada no dia? barra aqui
    if (!r.estaAtiva()) return;
    const conflito = await this.existeOutro(
      "area = ? AND data_reserva = ? AND condominio_id <=> ? AND status <> 'cancelada'",
      [r.area, r.data_reserva, r.condominio_id], r.id);
    if (conflito) throw new ErroValidacao(`${r.area} já está reservado(a) nesta data.`);
  }
}

class EncomendaRepository extends BaseRepository {
  constructor() { super('encomendas', M.Encomenda, { ordem: 'recebido_em DESC, id DESC', filtros: ['condominio_id', 'unidade', 'retirado'] }); }
}

class VisitanteRepository extends BaseRepository {
  constructor() { super('visitantes', M.Visitante, { ordem: 'horario DESC, id DESC', filtros: ['condominio_id', 'unidade'] }); }
}

class ChamadoRepository extends BaseRepository {
  constructor() { super('chamados', M.Chamado, { ordem: 'aberto_em DESC, id DESC', filtros: ['status', 'condominio_id'] }); }
}

class VagaRepository extends BaseRepository {
  constructor() { super('vagas_estacionamento', M.Vaga, { ordem: 'codigo', filtros: ['condominio_id', 'data_reserva'] }); }

  async antesDeSalvar(v) {  // gancho: mesma vaga duas vezes no dia não rola
    if (await this.existeOutro('codigo = ? AND data_reserva = ? AND condominio_id = ?', [v.codigo, v.data_reserva, v.condominio_id], v.id)) {
      throw new ErroValidacao(`A vaga ${v.codigo} já está cadastrada para esta data.`);
    }
  }
}

class ConvidadoRepository extends BaseRepository {
  constructor() { super('convidados_evento', M.Convidado, { ordem: 'evento, convidado', filtros: ['condominio_id', 'evento', 'status'] }); }
}

module.exports = {
  UsuarioRepository, CondominioRepository, MoradorRepository, ComunicadoRepository,
  SolicitacaoRepository, DocumentoRepository, LancamentoRepository, ReservaRepository,
  EncomendaRepository, VisitanteRepository, ChamadoRepository, VagaRepository, ConvidadoRepository,
};
