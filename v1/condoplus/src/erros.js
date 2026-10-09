/**
 * Erros da aplicação. Cada um já carrega o status HTTP que deve ser
 * devolvido — assim o BaseController trata todos num lugar só.
 */
class ErroAplicacao extends Error {
  constructor(mensagem, status = 500, detalhes = undefined) {
    super(mensagem);
    this.name = this.constructor.name;
    this.status = status;
    this.detalhes = detalhes;
  }
}

class ErroValidacao extends ErroAplicacao {
  constructor(erros) {
    const lista = Array.isArray(erros) ? erros : [erros];
    super(lista.join(' '), 400, lista);
  }
}

class ErroNaoEncontrado extends ErroAplicacao {
  constructor(oQue = 'Registro') {
    super(`Registro de ${oQue.toLowerCase()} não encontrado.`, 404);
  }
}

class ErroAutenticacao extends ErroAplicacao {
  constructor(mensagem = 'Não autorizado.') {
    super(mensagem, 401);
  }
}

module.exports = { ErroAplicacao, ErroValidacao, ErroNaoEncontrado, ErroAutenticacao };
