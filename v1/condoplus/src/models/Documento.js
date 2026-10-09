const Entidade = require('./Entidade');
const { Conv } = require('./conversores');

/**
 * Documento do condomínio (ata, regimento, prestação de contas). Tabela: documentos
 * Atributos: id, nome, tipo, condominio_id, publicado_em
 */
class Documento extends Entidade {
  static TIPOS = ['PDF', 'DOCX', 'XLSX', 'Imagem', 'Outro'];
  static campos = ['nome', 'tipo', 'condominio_id'];
  static somenteLeitura = ['publicado_em'];
  static padroes = { tipo: 'PDF' };
  static conversores = { nome: Conv.texto, tipo: Conv.texto, condominio_id: Conv.idOuNulo };

  validar() {
    const erros = [];
    if (!this.nome) erros.push('Informe o nome do documento.');
    if (!Documento.TIPOS.includes(this.tipo)) erros.push('Tipo de documento inválido.');
    if (!this.condominio_id) erros.push('Documento precisa de um condomínio.');
    return erros;
  }

  ehPDF() { return this.tipo === 'PDF'; }
}

module.exports = Documento;
