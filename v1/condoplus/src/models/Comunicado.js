const Entidade = require('./Entidade');
const { Conv } = require('./conversores');

/**
 * Comunicado publicado pelo síndico. Tabela: comunicados
 * Atributos: id, titulo, corpo, condominio_id, publicado_em
 */
class Comunicado extends Entidade {
  static campos = ['titulo', 'corpo', 'condominio_id'];
  static somenteLeitura = ['publicado_em'];
  static conversores = { titulo: Conv.texto, corpo: Conv.texto, condominio_id: Conv.idOuNulo };

  validar() {
    const erros = [];
    if (!this.titulo) erros.push('Dê um título ao comunicado.');
    if (this.titulo.length > 150) erros.push('Título muito longo (máx. 150 caracteres).');
    if (!this.condominio_id) erros.push('Comunicado precisa de um condomínio.');
    return erros;
  }

  resumo(limite = 80) {
    return this.corpo.length > limite ? this.corpo.slice(0, limite - 1) + '…' : this.corpo;
  }
}

module.exports = Comunicado;
