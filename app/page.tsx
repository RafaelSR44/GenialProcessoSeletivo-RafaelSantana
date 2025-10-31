'use client'

import { useState } from 'react'
import styles from './page.module.css'
import { PerfilCliente, Ativo, NovaOrdem, RelatorioSuitability, TipoPerfil } from '@/lib/types'
import { ProtectedPage } from './protected-page'

export default function Home() {
  return (
    <ProtectedPage>
      <HomeContent />
    </ProtectedPage>
  )
}

function HomeContent() {
  // Estado do perfil do cliente
  const [perfilCliente, setPerfilCliente] = useState<PerfilCliente>({
    nome: '',
    email: '',
    perfil: 'Moderado',
    score_max_risco: 2.5
  })

  // Estado da carteira atual
  const [carteiraAtual, setCarteiraAtual] = useState<Ativo[]>([])
  const [novoAtivo, setNovoAtivo] = useState<Ativo>({
    ativo: '',
    risco: 1.0,
    valor_investido: 0
  })

  // Estado da nova ordem
  const [novaOrdem, setNovaOrdem] = useState<NovaOrdem>({
    ativo: '',
    risco: 1.0,
    valor_ordem: 0
  })

  // Estados de controle
  const [loading, setLoading] = useState(false)
  const [relatorio, setRelatorio] = useState<RelatorioSuitability | null>(null)
  const [showTermoCiencia, setShowTermoCiencia] = useState(false)
  const [aceitouTermo, setAceitouTermo] = useState(false)

  // Handlers para perfil do cliente
  const handlePerfilChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPerfilCliente(prev => ({
      ...prev,
      [name]: name === 'score_max_risco' ? parseFloat(value) || 0 : value
    }))
  }

  // Handlers para adicionar ativo à carteira
  const handleNovoAtivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNovoAtivo(prev => ({
      ...prev,
      [name]: name === 'ativo' ? value : parseFloat(value) || 0
    }))
  }

  const adicionarAtivo = () => {
    if (novoAtivo.ativo && novoAtivo.risco > 0 && novoAtivo.valor_investido > 0) {
      setCarteiraAtual(prev => [...prev, { ...novoAtivo }])
      setNovoAtivo({ ativo: '', risco: 1.0, valor_investido: 0 })
    }
  }

  const removerAtivo = (index: number) => {
    setCarteiraAtual(prev => prev.filter((_, i) => i !== index))
  }

  // Handlers para nova ordem
  const handleNovaOrdemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNovaOrdem(prev => ({
      ...prev,
      [name]: name === 'ativo' ? value : parseFloat(value) || 0
    }))
  }

  // Validar suitability
  const validarSuitability = async () => {
    setLoading(true)
    setRelatorio(null)
    setShowTermoCiencia(false)
    setAceitouTermo(false)

    try {
      const res = await fetch('/api/suitability/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perfil_cliente: perfilCliente,
          carteira_atual: carteiraAtual,
          nova_ordem: novaOrdem
        })
      })

      const data = await res.json()
      
      if (data.success && data.data) {
        setRelatorio(data.data)
        if (data.data.validacao.status === 'Alerta') {
          setShowTermoCiencia(true)
        }
      } else {
        alert(data.message || 'Erro ao validar suitability')
      }
    } catch (error) {
      alert('Erro ao processar validação')
    } finally {
      setLoading(false)
    }
  }

  // Aceitar termo de ciência
  const aceitarTermoCiencia = async () => {
    if (!relatorio) return

    try {
      const res = await fetch('/api/suitability/termo-ciencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relatorio_id: relatorio.id,
          cliente_nome: perfilCliente.nome,
          cliente_email: perfilCliente.email,
          aceite: true
        })
      })

      const data = await res.json()
      
      if (data.success) {
        setAceitouTermo(true)
        alert(`Termo aceito! Protocolo: ${data.data.protocolo}`)
      }
    } catch (error) {
      alert('Erro ao registrar termo de ciência')
    }
  }

  // Baixar relatório
  const baixarRelatorio = async () => {
    if (!relatorio) return

    try {
      const res = await fetch('/api/suitability/relatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relatorio })
      })

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-suitability-${relatorio.id}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Erro ao baixar relatório')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return '#10b981'
      case 'Alerta': return '#f59e0b'
      case 'Rejeitado': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Motor de Validação de Suitability</h1>
        <p className={styles.subtitle}>Sistema de Conformidade CVM nº 30 - Genial Investimentos</p>

        {/* Perfil do Cliente */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Perfil do Cliente</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Nome Completo</label>
              <input
                type="text"
                name="nome"
                value={perfilCliente.nome}
                onChange={handlePerfilChange}
                placeholder="Nome do cliente"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>E-mail</label>
              <input
                type="email"
                name="email"
                value={perfilCliente.email}
                onChange={handlePerfilChange}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Perfil de Investidor</label>
              <select
                name="perfil"
                value={perfilCliente.perfil}
                onChange={handlePerfilChange}
              >
                <option value="Conservador">Conservador</option>
                <option value="Moderado">Moderado</option>
                <option value="Arrojado">Arrojado</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Score Máximo de Risco</label>
              <input
                type="number"
                name="score_max_risco"
                value={perfilCliente.score_max_risco}
                onChange={handlePerfilChange}
                step="0.1"
                min="0"
                max="5"
                placeholder="Ex: 2.5"
              />
            </div>
          </div>
        </section>

        {/* Carteira Atual */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Carteira Atual</h2>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Nome do Ativo</label>
              <input
                type="text"
                name="ativo"
                value={novoAtivo.ativo}
                onChange={handleNovoAtivoChange}
                placeholder="Ex: CDB XPTO"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Risco (0-5)</label>
              <input
                type="number"
                name="risco"
                value={novoAtivo.risco}
                onChange={handleNovoAtivoChange}
                step="0.1"
                min="0"
                max="5"
                placeholder="Ex: 1.2"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Valor Investido (R$)</label>
              <input
                type="number"
                name="valor_investido"
                value={novoAtivo.valor_investido || ''}
                onChange={handleNovoAtivoChange}
                step="0.01"
                min="0"
                placeholder="Ex: 50000"
              />
            </div>
            <div className={styles.formGroup}>
              <button type="button" onClick={adicionarAtivo} className={styles.buttonAdd}>
                + Adicionar Ativo
              </button>
            </div>
          </div>

          {carteiraAtual.length > 0 && (
            <div className={styles.ativosList}>
              <h3>Ativos na Carteira:</h3>
              {carteiraAtual.map((ativo, index) => (
                <div key={index} className={styles.ativoItem}>
                  <span><strong>{ativo.ativo}</strong></span>
                  <span>Risco: {ativo.risco}</span>
                  <span>R$ {ativo.valor_investido.toLocaleString('pt-BR')}</span>
                  <button onClick={() => removerAtivo(index)} className={styles.buttonRemove}>
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Nova Ordem */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Nova Ordem de Compra</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Nome do Ativo</label>
              <input
                type="text"
                name="ativo"
                value={novaOrdem.ativo}
                onChange={handleNovaOrdemChange}
                placeholder="Ex: FII YYY"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Risco (0-5)</label>
              <input
                type="number"
                name="risco"
                value={novaOrdem.risco}
                onChange={handleNovaOrdemChange}
                step="0.1"
                min="0"
                max="5"
                placeholder="Ex: 3.5"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Valor da Ordem (R$)</label>
              <input
                type="number"
                name="valor_ordem"
                value={novaOrdem.valor_ordem || ''}
                onChange={handleNovaOrdemChange}
                step="0.01"
                min="0"
                placeholder="Ex: 5000"
              />
            </div>
          </div>
        </section>

        {/* Botão Validar */}
        <button
          onClick={validarSuitability}
          className={styles.buttonValidar}
          disabled={loading || !perfilCliente.nome || !novaOrdem.ativo}
        >
          {loading ? 'Validando...' : 'Validar Suitability'}
        </button>

        {/* Resultado */}
        {relatorio && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Resultado da Validação</h2>
            
            <div 
              className={styles.statusBadge}
              style={{ backgroundColor: getStatusColor(relatorio.validacao.status) }}
            >
              STATUS: {relatorio.validacao.status}
            </div>

            <div className={styles.resultGrid}>
              <div className={styles.resultCard}>
                <h3>Risco Atual</h3>
                <p className={styles.resultValue}>{relatorio.validacao.risco_atual.toFixed(4)}</p>
              </div>
              <div className={styles.resultCard}>
                <h3>Risco Projetado</h3>
                <p className={styles.resultValue}>{relatorio.validacao.risco_projetado.toFixed(4)}</p>
              </div>
              <div className={styles.resultCard}>
                <h3>Score Máximo</h3>
                <p className={styles.resultValue}>{relatorio.validacao.score_max_permitido.toFixed(2)}</p>
              </div>
              <div className={styles.resultCard}>
                <h3>Limite Alerta</h3>
                <p className={styles.resultValue}>{relatorio.validacao.limite_alerta.toFixed(2)}</p>
              </div>
            </div>

            <div className={styles.mensagem}>
              <p>{relatorio.validacao.mensagem}</p>
            </div>

            {/* Termo de Ciência */}
            {showTermoCiencia && !aceitouTermo && (
              <div className={styles.termoCiencia}>
                <h3>Termo de Ciência Requerido</h3>
                <p>
                  Esta operação resultará em um risco superior ao recomendado para seu perfil.
                  Você declara estar ciente dos riscos envolvidos?
                </p>
                <button onClick={aceitarTermoCiencia} className={styles.buttonAceitar}>
                  Aceito os Riscos e Desejo Prosseguir
                </button>
              </div>
            )}

            {aceitouTermo && (
              <div className={styles.termoAceito}>
                Termo de ciência aceito e registrado
              </div>
            )}

            <button onClick={baixarRelatorio} className={styles.buttonDownload}>
              Baixar Relatório Completo
            </button>
          </section>
        )}
      </div>
    </main>
  )
}
