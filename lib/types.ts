// Tipos TypeScript para o projeto

// Tipos de Suitability
export type TipoPerfil = 'Conservador' | 'Moderado' | 'Arrojado'

export type StatusValidacao = 'Aprovado' | 'Alerta' | 'Rejeitado'

export interface PerfilCliente {
  nome: string
  email: string
  perfil: TipoPerfil
  score_max_risco: number
}

export interface Ativo {
  ativo: string
  risco: number
  valor_investido: number
}

export interface NovaOrdem {
  ativo: string
  risco: number
  valor_ordem: number
}

export interface CarteiraAtual {
  ativos: Ativo[]
}

export interface ResultadoValidacao {
  status: StatusValidacao
  risco_atual: number
  risco_projetado: number
  score_max_permitido: number
  limite_alerta: number
  mensagem: string
  detalhes: {
    carteira_atual: {
      valor_total: number
      risco_medio: number
    }
    carteira_projetada: {
      valor_total: number
      risco_medio: number
    }
    percentual_aumento_risco: number
  }
  requer_termo_ciencia: boolean
}

export interface SuitabilityRequest {
  perfil_cliente: PerfilCliente
  carteira_atual: Ativo[]
  nova_ordem: NovaOrdem
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface RelatorioSuitability {
  id: string
  timestamp: string
  cliente: PerfilCliente
  validacao: ResultadoValidacao
  termo_ciencia_aceito?: boolean
  termo_ciencia_timestamp?: string
}

export interface FormData {
  nome: string
  email: string
  telefone: string
  mensagem: string
}

export interface ProcessedData {
  id: string
  timestamp: string
  processado: boolean
  dados: FormData & {
    status: 'aprovado' | 'pendente' | 'rejeitado'
  }
}

export interface ValidationError {
  field: string
  message: string
}

export interface ExternalApiRequest {
  servico: string
  parametros: Record<string, any>
}

export interface ExternalApiResponse {
  success: boolean
  servico: string
  resultado: any
}

export interface ServiceInfo {
  servicos: string[]
  status: string
  versao: string
}
