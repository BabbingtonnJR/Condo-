// André — atas, regimento, prestação de contas
const { Entidade } = require('condoplus-core');
const { Conv } = require('condoplus-core');

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
