import { Ativo, NovaOrdem, PerfilCliente, ResultadoValidacao, StatusValidacao } from './types'

/**
 * Motor de Validação de Suitability de Carteira
 * Implementa a lógica de validação conforme Resolução CVM nº 30
 */

/**
 * Calcula o risco atual da carteira usando média ponderada
 * Fórmula: RC = Σ(Risco_i × ValorInvestido_i) / Σ(ValorInvestido_i)
 * 
 * @param carteira - Array de ativos da carteira atual
 * @returns Risco médio ponderado da carteira
 */
export function calcularRiscoCarteira(carteira: Ativo[]): number {
  if (!carteira || carteira.length === 0) {
    return 0
  }

  const somaRiscoPonderado = carteira.reduce(
    (soma, ativo) => soma + (ativo.risco * ativo.valor_investido),
    0
  )

  const somaValores = carteira.reduce(
    (soma, ativo) => soma + ativo.valor_investido,
    0
  )

  if (somaValores === 0) {
    return 0
  }

  return somaRiscoPonderado / somaValores
}

/**
 * Calcula o valor total investido na carteira
 * 
 * @param carteira - Array de ativos da carteira
 * @returns Valor total investido
 */
export function calcularValorTotal(carteira: Ativo[]): number {
  return carteira.reduce((soma, ativo) => soma + ativo.valor_investido, 0)
}

/**
 * Projeta o risco da carteira após a execução de uma nova ordem
 * 
 * @param carteiraAtual - Carteira atual do cliente
 * @param novaOrdem - Nova ordem de compra a ser executada
 * @returns Risco projetado da carteira após a compra
 */
export function calcularRiscoProjetado(
  carteiraAtual: Ativo[],
  novaOrdem: NovaOrdem
): number {
  // Cria uma nova carteira incluindo a nova ordem
  const carteiraProjetada: Ativo[] = [
    ...carteiraAtual,
    {
      ativo: novaOrdem.ativo,
      risco: novaOrdem.risco,
      valor_investido: novaOrdem.valor_ordem
    }
  ]

  return calcularRiscoCarteira(carteiraProjetada)
}

/**
 * Calcula o limite de alerta (110% do score máximo)
 * 
 * @param scoreMaxRisco - Score máximo de risco do perfil do cliente
 * @returns Limite de alerta (score máximo × 1.1)
 */
export function calcularLimiteAlerta(scoreMaxRisco: number): number {
  return scoreMaxRisco * 1.1
}

/**
 * Determina o status da validação baseado no risco projetado
 * 
 * @param riscoProjetado - Risco projetado da carteira
 * @param scoreMaxRisco - Score máximo permitido pelo perfil
 * @param limiteAlerta - Limite de alerta (110% do score máximo)
 * @returns Status da validação: Aprovado, Alerta ou Rejeitado
 */
export function determinarStatus(
  riscoProjetado: number,
  scoreMaxRisco: number,
  limiteAlerta: number
): StatusValidacao {
  if (riscoProjetado <= scoreMaxRisco) {
    return 'Aprovado'
  } else if (riscoProjetado <= limiteAlerta) {
    return 'Alerta'
  } else {
    return 'Rejeitado'
  }
}

/**
 * Gera a mensagem apropriada baseada no status da validação
 * 
 * @param status - Status da validação
 * @param riscoProjetado - Risco projetado
 * @param limiteAlerta - Limite de alerta
 * @returns Mensagem descritiva do resultado
 */
export function gerarMensagem(
  status: StatusValidacao,
  riscoProjetado: number,
  limiteAlerta: number
): string {
  switch (status) {
    case 'Aprovado':
      return 'Ordem executada. Carteira em conformidade.'
    case 'Alerta':
      return `Atenção: O risco da carteira ultrapassará o limite de ${limiteAlerta.toFixed(2)}. É necessário termo de ciência.`
    case 'Rejeitado':
      return 'Risco excessivo. A operação viola a política de Suitability.'
    default:
      return 'Status desconhecido.'
  }
}

/**
 * Valida a conformidade da nova ordem com o perfil do cliente
 * Motor principal de validação de suitability
 * 
 * @param perfilCliente - Perfil e score máximo de risco do cliente
 * @param carteiraAtual - Carteira atual de investimentos
 * @param novaOrdem - Nova ordem de compra a ser validada
 * @returns Resultado completo da validação
 */
export function validarSuitability(
  perfilCliente: PerfilCliente,
  carteiraAtual: Ativo[],
  novaOrdem: NovaOrdem
): ResultadoValidacao {
  // A. Calcular risco atual da carteira
  const riscoAtual = calcularRiscoCarteira(carteiraAtual)
  const valorTotalAtual = calcularValorTotal(carteiraAtual)

  // B. Projetar risco pós-compra
  const riscoProjetado = calcularRiscoProjetado(carteiraAtual, novaOrdem)
  const valorTotalProjetado = valorTotalAtual + novaOrdem.valor_ordem

  // C. Validar desenquadramento
  const scoreMaxPermitido = perfilCliente.score_max_risco
  const limiteAlerta = calcularLimiteAlerta(scoreMaxPermitido)
  const status = determinarStatus(riscoProjetado, scoreMaxPermitido, limiteAlerta)
  const mensagem = gerarMensagem(status, riscoProjetado, limiteAlerta)

  // Calcular percentual de aumento de risco
  const percentualAumentoRisco = riscoAtual === 0
    ? 0
    : ((riscoProjetado - riscoAtual) / riscoAtual) * 100

  // Determinar se requer termo de ciência
  const requerTermoCiencia = status === 'Alerta'

  return {
    status,
    risco_atual: riscoAtual,
    risco_projetado: riscoProjetado,
    score_max_permitido: scoreMaxPermitido,
    limite_alerta: limiteAlerta,
    mensagem,
    detalhes: {
      carteira_atual: {
        valor_total: valorTotalAtual,
        risco_medio: riscoAtual
      },
      carteira_projetada: {
        valor_total: valorTotalProjetado,
        risco_medio: riscoProjetado
      },
      percentual_aumento_risco: percentualAumentoRisco
    },
    requer_termo_ciencia: requerTermoCiencia
  }
}

/**
 * Monitora desenquadramento passivo da carteira
 * (quando o risco aumenta devido à volatilidade do mercado)
 * 
 * @param carteiraAtual - Carteira atual com valores atualizados
 * @param scoreMaxRisco - Score máximo permitido pelo perfil
 * @returns Informações sobre desenquadramento passivo
 */
export function monitorarDesenquadramentoPassivo(
  carteiraAtual: Ativo[],
  scoreMaxRisco: number
): {
  desenquadrado: boolean
  riscoAtual: number
  scoreMaxPermitido: number
  percentualExcesso: number
  nivelGravidade: 'Baixo' | 'Médio' | 'Alto' | 'Crítico'
} {
  const riscoAtual = calcularRiscoCarteira(carteiraAtual)
  const limiteAlerta = calcularLimiteAlerta(scoreMaxRisco)
  
  const desenquadrado = riscoAtual > scoreMaxRisco
  const percentualExcesso = desenquadrado
    ? ((riscoAtual - scoreMaxRisco) / scoreMaxRisco) * 100
    : 0

  let nivelGravidade: 'Baixo' | 'Médio' | 'Alto' | 'Crítico' = 'Baixo'
  
  if (desenquadrado) {
    if (riscoAtual > limiteAlerta * 1.2) {
      nivelGravidade = 'Crítico'
    } else if (riscoAtual > limiteAlerta) {
      nivelGravidade = 'Alto'
    } else if (riscoAtual > scoreMaxRisco * 1.05) {
      nivelGravidade = 'Médio'
    } else {
      nivelGravidade = 'Baixo'
    }
  }

  return {
    desenquadrado,
    riscoAtual,
    scoreMaxPermitido: scoreMaxRisco,
    percentualExcesso,
    nivelGravidade
  }
}
