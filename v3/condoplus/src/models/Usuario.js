// Gabriel — conta de login. a senha nunca vai pro navegador (olha o toPublico)
const { Entidade } = require('condoplus-core');
const { Conv, ehEmail } = require('condoplus-core');

class Usuario extends Entidade {
  static PERFIS = ['morador', 'sindico', 'administradora', 'porteiro', 'prestador', 'suporte'];
  static campos = ['nome', 'email', 'senha', 'perfil', 'unidade', 'condominio_id', 'status'];
  static somenteLeitura = ['criado_em'];
  static padroes = { perfil: 'morador', status: 'ativo' };
  static conversores = {
    nome: Conv.texto,
    email: (v) => Conv.texto(v).toLowerCase(),
    senha: Conv.texto,
    perfil: Conv.texto,
    unidade: Conv.textoOuNulo,
    condominio_id: Conv.idOuNulo,
    status: Conv.texto,
  };

  validar() {
    const erros = [];
    if (!this.nome) erros.push('Informe o nome.');
    if (!ehEmail(this.email)) erros.push('Informe um e-mail válido.');
    if (this.ehNova() && !this.senha) erros.push('Informe uma senha.');
    if (this.senha && this.senha.length < 4) erros.push('A senha precisa ter ao menos 4 caracteres.');
    if (!Usuario.PERFIS.includes(this.perfil)) erros.push('Perfil inválido.');
    if (this.perfil === 'morador' && !this.unidade) erros.push('Morador precisa ter uma unidade.');
    if (['morador', 'sindico', 'porteiro'].includes(this.perfil) && !this.condominio_id) {
      erros.push('Este perfil precisa estar vinculado a um condomínio.');
    }
    if (!['ativo', 'inativo'].includes(this.status)) erros.push('Status inválido.');
    return erros;
  }

  ehAtivo() { return this.status === 'ativo'; }
  possuiPerfil(...perfis) { return perfis.includes(this.perfil); }
  conferirSenha(senha) { return this.senha === senha; }

  atualizarCom(dados = {}) {  // senha em branco no editar = mantém a antiga
    const { senha, ...resto } = dados;
    super.atualizarCom(resto);
    if (senha) this.senha = Conv.texto(senha);
    return this;
  }

  toPublico() {
    const { senha, ...resto } = this;
    return resto;
  }

  toJSON() { return this.toPublico(); }
}

module.exports = Usuario;
