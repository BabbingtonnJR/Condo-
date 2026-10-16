// Babbingtonn — erros que já sabem o status HTTP
// é só dar throw que o BaseController do André responde certinho
class ErroAplicacao extends Error {
  constructor(mensagem, status = 500, detalhes = undefined) {
    super(mensagem);
    this.name = this.constructor.name;
    this.status = status;
    this.detalhes = detalhes;
  }
}

class ErroValidacao extends ErroAplicacao {  // 400: dado errado (aceita lista de msgs)
  constructor(erros) {
    const lista = Array.isArray(erros) ? erros : [erros];
    super(lista.join(' '), 400, lista);
  }
}

class ErroNaoEncontrado extends ErroAplicacao {  // 404: não achou
  constructor(oQue = 'Registro') {
    super(`Registro de ${oQue.toLowerCase()} não encontrado.`, 404);
  }
}

class ErroAutenticacao extends ErroAplicacao {  // 401: login errado
  constructor(mensagem = 'Não autorizado.') {
    super(mensagem, 401);
  }
}

module.exports = { ErroAplicacao, ErroValidacao, ErroNaoEncontrado, ErroAutenticacao };
