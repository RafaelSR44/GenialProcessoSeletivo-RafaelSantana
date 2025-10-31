'use client'

import { useState, useEffect } from 'react'
import { ProtectedPage } from '../protected-page'
import styles from './clientes.module.css'

interface Cliente {
  id: string
  nome: string
  email: string
  perfil: string
  score_max_risco: number
  createdAt: string
}

interface Ativo {
  id?: string
  ativo: string
  risco: number
  valor_investido: number
}

interface Carteira {
  id: string
  clienteId: string
  ativos: Ativo[]
  risco_atual: number
  valor_total: number
  createdAt: string
  updatedAt: string
}

export default function ClientesPage() {
  return (
    <ProtectedPage>
      <ClientesContent />
    </ProtectedPage>
  )
}

function ClientesContent() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [carteira, setCarteira] = useState<Carteira | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    perfil: 'Moderado',
    score_max_risco: 2.5
  })

  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [ativosOriginais, setAtivosOriginais] = useState<Ativo[]>([])
  const [novoAtivo, setNovoAtivo] = useState<Ativo>({
    ativo: '',
    risco: 1.0,
    valor_investido: 0
  })

  // Estados para suitability e termo
  const [showTermoModal, setShowTermoModal] = useState(false)
  const [termoAceito, setTermoAceito] = useState(false)
  const [validacaoSuitability, setValidacaoSuitability] = useState<any>(null)

  useEffect(() => {
    carregarClientes()
  }, [])

  const carregarClientes = async () => {
    try {
      const res = await fetch('/api/clientes')
      if (res.ok) {
        const data = await res.json()
        setClientes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (mode: 'create' | 'edit' | 'view', cliente?: Cliente) => {
    setModalMode(mode)
    setSelectedCliente(cliente || null)
    
    if (mode === 'create') {
      setFormData({
        nome: '',
        email: '',
        perfil: 'Moderado',
        score_max_risco: 2.5
      })
      setAtivos([])
    } else if (cliente) {
      setFormData({
        nome: cliente.nome,
        email: cliente.email,
        perfil: cliente.perfil,
        score_max_risco: cliente.score_max_risco
      })
      carregarCarteira(cliente.id)
    }
    
    setShowModal(true)
  }

  const carregarCarteira = async (clienteId: string) => {
    try {
      const res = await fetch(`/api/clientes/${clienteId}/carteira`)
      if (res.ok) {
        const data = await res.json()
        setCarteira(data)
        setAtivos(data.ativos || [])
        setAtivosOriginais(data.ativos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar carteira:', error)
      setAtivos([])
      setAtivosOriginais([])
    }
  }

  const calcularRiscoAtual = () => {
    if (ativos.length === 0) return 0
    const valorTotal = ativos.reduce((sum, a) => sum + a.valor_investido, 0)
    if (valorTotal === 0) return 0
    return ativos.reduce((sum, a) => sum + (a.risco * a.valor_investido / valorTotal), 0)
  }

  const adicionarAtivo = () => {
    if (!novoAtivo.ativo || novoAtivo.valor_investido <= 0) return
    setAtivos([...ativos, { ...novoAtivo }])
    setNovoAtivo({ ativo: '', risco: 1.0, valor_investido: 0 })
  }

  const removerAtivo = (index: number) => {
    setAtivos(ativos.filter((_, i) => i !== index))
  }

  const verificarNovaOrdem = () => {
    // Verifica se há novos ativos (não apenas remoção)
    if (modalMode === 'edit') {
      const ativosNovos = ativos.filter(
        a => !ativosOriginais.find(
          orig => orig.ativo === a.ativo && orig.valor_investido === a.valor_investido
        )
      )
      return ativosNovos.length > 0
    }
    return false
  }

  const validarSuitability = async () => {
    const riscoProjetado = calcularRiscoAtual()
    
    try {
      const res = await fetch('/api/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perfil_cliente: {
            nome: formData.nome,
            email: formData.email,
            perfil: formData.perfil,
            score_max_risco: formData.score_max_risco
          },
          carteira_atual: ativosOriginais.map(a => ({
            ativo: a.ativo,
            risco: a.risco,
            valor_investido: a.valor_investido
          })),
          nova_ordem: ativos
            .filter(a => !ativosOriginais.find(
              orig => orig.ativo === a.ativo && orig.valor_investido === a.valor_investido
            ))
            .map(a => ({
              ativo: a.ativo,
              risco: a.risco,
              valor_ordem: a.valor_investido
            }))[0] || null
        })
      })

      if (res.ok) {
        const validacao = await res.json()
        setValidacaoSuitability(validacao)
        
        // Se risco excede e é rejeição, precisa do termo
        if (validacao.status === 'Alerta' && riscoProjetado > formData.score_max_risco) {
          setShowTermoModal(true)
          return false
        }
        
        return true
      }
    } catch (error) {
      console.error('Erro ao validar suitability:', error)
    }
    return true
  }

  const aceitarTermo = async () => {
    if (!validacaoSuitability) return

    try {
      const res = await fetch('/api/suitability/termo-ciencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: formData.nome,
          relatorio_id: validacaoSuitability.protocolo,
          riscos: validacaoSuitability.detalhes_risco
        })
      })

      if (res.ok) {
        setTermoAceito(true)
        setShowTermoModal(false)
        return true
      }
    } catch (error) {
      console.error('Erro ao registrar termo:', error)
    }
    return false
  }

  const salvarCliente = async () => {
    const riscoAtual = calcularRiscoAtual()
    const valorTotal = ativos.reduce((sum, a) => sum + a.valor_investido, 0)

    // Se está editando e há nova ordem de compra, validar suitability
    if (modalMode === 'edit' && verificarNovaOrdem()) {
      const riscoExcede = riscoAtual > formData.score_max_risco
      
      if (riscoExcede) {
        // Validar suitability primeiro
        const validacaoOk = await validarSuitability()
        
        if (!validacaoOk && !termoAceito) {
          // Mostrar modal de termo se ainda não foi aceito
          return
        }
      }
    }

    const payload = {
      ...formData,
      ativos,
      risco_atual: riscoAtual,
      valor_total: valorTotal
    }

    try {
      const url = modalMode === 'create' 
        ? '/api/clientes'
        : `/api/clientes/${selectedCliente?.id}`
      
      const method = modalMode === 'create' ? 'POST' : 'PUT'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        await carregarClientes()
        setShowModal(false)
        setTermoAceito(false)
        setValidacaoSuitability(null)
      } else {
        const error = await res.json()
        alert(error.message || 'Erro ao salvar cliente')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar cliente')
    }
  }

  const deletarCliente = async (id: string) => {
    if (!confirm('Deseja realmente deletar este cliente?')) return

    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await carregarClientes()
      }
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  const riscoAtual = calcularRiscoAtual()
  const valorTotal = ativos.reduce((sum, a) => sum + a.valor_investido, 0)

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Carregando clientes...</p>
      </div>
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestão de Clientes</h1>
          <button 
            onClick={() => abrirModal('create')}
            className={styles.buttonPrimary}
          >
            Novo Cliente
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Score Máximo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.perfil}</td>
                  <td>{cliente.score_max_risco.toFixed(2)}</td>
                  <td className={styles.actions}>
                    <button 
                      onClick={() => abrirModal('view', cliente)}
                      className={styles.buttonView}
                    >
                      Ver
                    </button>
                    <button 
                      onClick={() => abrirModal('edit', cliente)}
                      className={styles.buttonEdit}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => deletarCliente(cliente.id)}
                      className={styles.buttonDelete}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    Nenhum cliente cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showTermoModal && validacaoSuitability && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Termo de Ciência de Risco</h2>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.termoContent}>
                  <p><strong>Atenção!</strong></p>
                  <p>A nova ordem de compra resultará em um risco que excede o perfil do cliente.</p>
                  
                  <div className={styles.termoDetails}>
                    <p><strong>Protocolo:</strong> {validacaoSuitability.protocolo}</p>
                    <p><strong>Status:</strong> {validacaoSuitability.status}</p>
                    <p><strong>Risco Atual:</strong> {validacaoSuitability.risco_atual?.toFixed(2)}</p>
                    <p><strong>Risco Projetado:</strong> {validacaoSuitability.risco_projetado?.toFixed(2)}</p>
                    <p><strong>Score Máximo:</strong> {formData.score_max_risco.toFixed(2)}</p>
                  </div>

                  <div className={styles.termoText}>
                    <p>
                      Declaro que estou ciente dos riscos envolvidos nesta operação e que 
                      o risco projetado da carteira excede meu perfil de investidor.
                    </p>
                    <p>
                      Compreendo que esta operação pode resultar em perdas financeiras 
                      superiores ao meu apetite de risco declarado.
                    </p>
                  </div>

                  {validacaoSuitability.detalhes_risco && (
                    <div className={styles.riscoDetalhes}>
                      <strong>Detalhes:</strong>
                      <ul>
                        {validacaoSuitability.detalhes_risco.map((detalhe: string, i: number) => (
                          <li key={i}>{detalhe}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  onClick={() => {
                    setShowTermoModal(false)
                    setValidacaoSuitability(null)
                  }}
                  className={styles.buttonSecondary}
                >
                  Recusar
                </button>
                <button 
                  onClick={async () => {
                    const aceito = await aceitarTermo()
                    if (aceito) {
                      await salvarCliente()
                    }
                  }}
                  className={styles.buttonPrimary}
                >
                  Aceitar e Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>
                  {modalMode === 'create' && 'Novo Cliente'}
                  {modalMode === 'edit' && 'Editar Cliente'}
                  {modalMode === 'view' && 'Detalhes do Cliente'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.section}>
                  <h3>Informações do Cliente</h3>
                  
                  <div className={styles.field}>
                    <label>Nome</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      disabled={modalMode === 'view'}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={modalMode === 'view'}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Perfil de Risco</label>
                      <select
                        value={formData.perfil}
                        onChange={(e) => {
                          const perfil = e.target.value
                          const scores = { Conservador: 1.5, Moderado: 2.5, Arrojado: 3.5 }
                          setFormData({ 
                            ...formData, 
                            perfil,
                            score_max_risco: scores[perfil as keyof typeof scores]
                          })
                        }}
                        disabled={modalMode === 'view'}
                        className={styles.select}
                      >
                        <option value="Conservador">Conservador</option>
                        <option value="Moderado">Moderado</option>
                        <option value="Arrojado">Arrojado</option>
                      </select>
                    </div>

                    <div className={styles.field}>
                      <label>Score Máximo de Risco</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.score_max_risco}
                        onChange={(e) => setFormData({ ...formData, score_max_risco: parseFloat(e.target.value) })}
                        disabled={modalMode === 'view'}
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h3>Carteira de Investimentos</h3>
                  
                  {modalMode !== 'view' && (
                    <div className={styles.addAtivo}>
                      <input
                        type="text"
                        placeholder="Nome do Ativo"
                        value={novoAtivo.ativo}
                        onChange={(e) => setNovoAtivo({ ...novoAtivo, ativo: e.target.value })}
                        className={styles.input}
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Risco"
                        value={novoAtivo.risco || ''}
                        onChange={(e) => setNovoAtivo({ ...novoAtivo, risco: parseFloat(e.target.value) || 1.0 })}
                        className={styles.inputSmall}
                      />
                      <input
                        type="number"
                        placeholder="Valor Investido"
                        value={novoAtivo.valor_investido || ''}
                        onChange={(e) => setNovoAtivo({ ...novoAtivo, valor_investido: parseFloat(e.target.value) || 0 })}
                        className={styles.inputSmall}
                      />
                      <button onClick={adicionarAtivo} className={styles.buttonAdd}>
                        Adicionar
                      </button>
                    </div>
                  )}

                  <div className={styles.ativosList}>
                    {ativos.map((ativo, index) => (
                      <div key={index} className={styles.ativoItem}>
                        <span className={styles.ativoNome}>{ativo.ativo}</span>
                        <span className={styles.ativoRisco}>Risco: {ativo.risco.toFixed(1)}</span>
                        <span className={styles.ativoValor}>
                          R$ {ativo.valor_investido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        {modalMode !== 'view' && (
                          <button 
                            onClick={() => removerAtivo(index)}
                            className={styles.buttonRemove}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className={styles.summary}>
                    <div className={styles.summaryItem}>
                      <span>Valor Total:</span>
                      <strong>R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Risco Atual:</span>
                      <strong className={riscoAtual > formData.score_max_risco ? styles.riscoAlto : ''}>
                        {riscoAtual.toFixed(2)}
                      </strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Score Máximo:</span>
                      <strong>{formData.score_max_risco.toFixed(2)}</strong>
                    </div>
                  </div>

                  {riscoAtual > formData.score_max_risco && (
                    <div className={styles.warning}>
                      ⚠️ Risco da carteira excede o score máximo do perfil!
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  onClick={() => setShowModal(false)}
                  className={styles.buttonSecondary}
                >
                  Cancelar
                </button>
                {modalMode !== 'view' && (
                  <button 
                    onClick={salvarCliente}
                    className={styles.buttonPrimary}
                  >
                    Salvar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
