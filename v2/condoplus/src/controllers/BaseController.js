// André — Template Method #2
// toda requisição passa pelo manipular(): executa, formata, responde e, se der erro, trata
class BaseController {
  constructor() {
    if (new.target === BaseController) throw new Error('BaseController é abstrato.');
  }

  manipular(operacao, statusSucesso = 200) {  // o template: devolve a função que o Express chama
    return async (req, res) => {
      try {
        const resultado = await operacao(req);
        const corpo = this.formatar(resultado, req);
        res.status(statusSucesso).json(corpo);
      } catch (erro) {
        this.tratarErro(erro, res);
      }
    };
  }

  formatar(resultado) {  // gancho, por padrão não mexe em nada
    return resultado;
  }

  tratarErro(erro, res) {  // o status vem dos erros do Babbingtonn
    const status = erro.status || 500;
    if (status === 500) console.error('[ERRO]', erro);
    res.status(status).json({ erro: erro.message || 'Erro interno.', detalhes: erro.detalhes });
  }
}

module.exports = BaseController;
