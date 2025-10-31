// Utilitários para o projeto

/**
 * Formata um telefone para o padrão brasileiro
 * @param telefone - Telefone sem formatação
 * @returns Telefone formatado: (XX) XXXXX-XXXX
 */
export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, '')
  
  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
  } else if (numeros.length === 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`
  }
  
  return telefone
}

/**
 * Valida formato de email
 * @param email - Email a ser validado
 * @returns true se válido, false caso contrário
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Valida formato de telefone brasileiro
 * @param telefone - Telefone a ser validado
 * @returns true se válido, false caso contrário
 */
export function validarTelefone(telefone: string): boolean {
  const numeros = telefone.replace(/\D/g, '')
  return numeros.length === 10 || numeros.length === 11
}

/**
 * Sanitiza string removendo caracteres especiais
 * @param str - String a ser sanitizada
 * @returns String sanitizada
 */
export function sanitizarString(str: string): string {
  return str.trim().replace(/[<>]/g, '')
}

/**
 * Gera ID único
 * @returns ID único alfanumérico
 */
export function gerarId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

/**
 * Formata data para pt-BR
 * @param date - Data a ser formatada
 * @returns Data formatada: DD/MM/YYYY HH:MM:SS
 */
export function formatarData(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

/**
 * Delay para simular processamento assíncrono
 * @param ms - Milissegundos para aguardar
 * @returns Promise que resolve após o delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Valida CPF (apenas formato)
 * @param cpf - CPF a ser validado
 * @returns true se o formato é válido
 */
export function validarFormatoCPF(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, '')
  return numeros.length === 11
}

/**
 * Formata CPF
 * @param cpf - CPF sem formatação
 * @returns CPF formatado: XXX.XXX.XXX-XX
 */
export function formatarCPF(cpf: string): string {
  const numeros = cpf.replace(/\D/g, '')
  
  if (numeros.length === 11) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`
  }
  
  return cpf
}

/**
 * Formata valor monetário para Real Brasileiro
 * @param valor - Valor numérico
 * @returns Valor formatado em R$
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

/**
 * Formata percentual
 * @param valor - Valor numérico (0-1 ou 0-100)
 * @param casasDecimais - Número de casas decimais
 * @returns Percentual formatado
 */
export function formatarPercentual(valor: number, casasDecimais: number = 2): string {
  return `${valor.toFixed(casasDecimais)}%`
}
