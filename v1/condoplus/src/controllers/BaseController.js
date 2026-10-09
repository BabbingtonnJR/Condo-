/**
 * ============================================================
 * PADRÃO TEMPLATE METHOD — exemplo 2: BaseController
 * ============================================================
 * Toda requisição HTTP da API segue o MESMO roteiro, definido no
 * método-modelo manipular():
 *
 *   1. executar a operação pedida      (parte variável)
 *   2. formatar(resultado)             (gancho — subclasse pode mudar)
 *   3. responder com o status certo    (fixo)
 *   4. se der erro -> tratarErro()     (fixo: 400/401/404/500 num só lugar)
 *
 * Antes, cada rota tinha (ou esquecia de ter) o seu próprio try/catch.
 * Agora o tratamento de erro e o formato da resposta são escritos uma vez.
 */
class BaseController {
  constructor() {
    if (new.target === BaseController) throw new Error('BaseController é abstrato.');
  }

  /** MÉTODO-MODELO: devolve um handler do Express com o roteiro fixo. */
  manipular(operacao, statusSucesso = 200) {
    return async (req, res) => {
      try {
        const resultado = await operacao(req);        // passo 1
        const corpo = this.formatar(resultado, req);   // passo 2 (gancho)
        res.status(statusSucesso).json(corpo);        // passo 3
      } catch (erro) {
        this.tratarErro(erro, res);                   // passo 4
      }
    };
  }

  /** Gancho: por padrão devolve o resultado como veio. */
  formatar(resultado) {
    return resultado;
  }

  tratarErro(erro, res) {
    const status = erro.status || 500;
    if (status === 500) console.error('[ERRO]', erro);
    res.status(status).json({ erro: erro.message || 'Erro interno.', detalhes: erro.detalhes });
  }
}

module.exports = BaseController;
