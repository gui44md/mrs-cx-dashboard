import { useMemo, useState } from 'react'
import { demandas as demandasIniciais, STATUS, TIPOS, CLIENTES } from '../data/demandas.js'

function formatarData(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DetalheDemanda({ demanda, aoFechar }) {
  if (!demanda) return null
  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{demanda.tipo}</h2>
        <p className="modal-id">{demanda.id}</p>
        <dl>
          <dt>Cliente</dt>
          <dd>
            {demanda.cliente} <span className="tag">{demanda.segmento}</span>
          </dd>
          <dt>Trecho</dt>
          <dd>{demanda.trecho}</dd>
          <dt>Descrição</dt>
          <dd>{demanda.descricao}</dd>
          <dt>Prioridade</dt>
          <dd>
            <span className={`tag prioridade-${demanda.prioridade}`}>{demanda.prioridade}</span>
          </dd>
          <dt>Status</dt>
          <dd>
            <span className={`tag status-${demanda.status}`}>{demanda.status}</span>
          </dd>
          <dt>Abertura</dt>
          <dd>{formatarData(demanda.abertura)}</dd>
          <dt>Resolução</dt>
          <dd>{formatarData(demanda.resolucao)}</dd>
          <dt>Prazo de SLA</dt>
          <dd>
            {demanda.slaPrazoHoras}h
            {demanda.slaCumprido !== null && (demanda.slaCumprido ? ' · cumprido ✅' : ' · estourado ⚠️')}
          </dd>
          <dt>Satisfação</dt>
          <dd>{demanda.satisfacao ? `${'⭐'.repeat(demanda.satisfacao)} (${demanda.satisfacao}/5)` : '—'}</dd>
          <dt>Responsável</dt>
          <dd>{demanda.responsavel}</dd>
        </dl>
        <button className="fechar" onClick={aoFechar}>
          Fechar
        </button>
      </div>
    </div>
  )
}

function Kanban({ lista, aoMoverDemanda, aoAbrirDetalhe }) {
  const [colunaSobre, setColunaSobre] = useState(null)

  return (
    <div className="kanban">
      {STATUS.map((status) => {
        const cartoes = lista.filter((d) => d.status === status)
        return (
          <div
            key={status}
            className={`kanban-coluna ${colunaSobre === status ? 'arrastando-sobre' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setColunaSobre(status)
            }}
            onDragLeave={() => setColunaSobre(null)}
            onDrop={(e) => {
              e.preventDefault()
              setColunaSobre(null)
              const id = e.dataTransfer.getData('text/plain')
              if (id) aoMoverDemanda(id, status)
            }}
          >
            <h3>
              {status} <span>{cartoes.length}</span>
            </h3>
            {cartoes.map((d) => (
              <div
                key={d.id}
                className={`kanban-cartao prioridade-${d.prioridade}`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', d.id)}
                onClick={() => aoAbrirDetalhe(d)}
              >
                <div className="cartao-id">
                  <span>{d.id}</span>
                  <span className={`tag prioridade-${d.prioridade}`}>{d.prioridade}</span>
                </div>
                <div className="cartao-cliente">{d.cliente}</div>
                <div>{d.tipo}</div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function Tabela({ lista, aoAbrirDetalhe }) {
  return (
    <div className="card tabela-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Prioridade</th>
            <th>Status</th>
            <th>Abertura</th>
            <th>Responsável</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((d) => (
            <tr key={d.id} onClick={() => aoAbrirDetalhe(d)}>
              <td>{d.id}</td>
              <td>{d.cliente}</td>
              <td>{d.tipo}</td>
              <td>
                <span className={`tag prioridade-${d.prioridade}`}>{d.prioridade}</span>
              </td>
              <td>
                <span className={`tag status-${d.status}`}>{d.status}</span>
              </td>
              <td>{formatarData(d.abertura)}</td>
              <td>{d.responsavel}</td>
            </tr>
          ))}
          {lista.length === 0 && (
            <tr>
              <td colSpan={7}>Nenhuma demanda encontrada com os filtros atuais.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function Demandas() {
  const [lista, setLista] = useState(demandasIniciais)
  const [visao, setVisao] = useState('kanban')
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroPrioridade, setFiltroPrioridade] = useState('')
  const [detalhe, setDetalhe] = useState(null)

  // No kanban mostramos apenas as demandas em aberto + resolvidas recentes,
  // para a visão de "trabalho do dia"; a tabela mostra tudo.
  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return lista.filter((d) => {
      if (filtroTipo && d.tipo !== filtroTipo) return false
      if (filtroCliente && d.cliente !== filtroCliente) return false
      if (filtroPrioridade && d.prioridade !== filtroPrioridade) return false
      if (termo) {
        const texto = `${d.id} ${d.cliente} ${d.tipo} ${d.descricao}`.toLowerCase()
        if (!texto.includes(termo)) return false
      }
      return true
    })
  }, [lista, busca, filtroTipo, filtroCliente, filtroPrioridade])

  const listaKanban = useMemo(() => {
    const limite = new Date(2026, 5, 1)
    return filtradas.filter(
      (d) => d.status !== 'Resolvida' || new Date(d.abertura) >= limite
    )
  }, [filtradas])

  function moverDemanda(id, novoStatus) {
    setLista((atual) =>
      atual.map((d) => (d.id === id ? { ...d, status: novoStatus } : d))
    )
  }

  return (
    <>
      <div className="controles">
        <div className="botoes-toggle">
          <button className={visao === 'kanban' ? 'ativo' : ''} onClick={() => setVisao('kanban')}>
            Kanban
          </button>
          <button className={visao === 'tabela' ? 'ativo' : ''} onClick={() => setVisao('tabela')}>
            Tabela
          </button>
        </div>
        <input
          type="text"
          placeholder="Buscar por ID, cliente ou descrição…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)}>
          <option value="">Todos os clientes</option>
          {CLIENTES.map((c) => (
            <option key={c.nome} value={c.nome}>
              {c.nome}
            </option>
          ))}
        </select>
        <select value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)}>
          <option value="">Todas as prioridades</option>
          <option value="Alta">Alta</option>
          <option value="Média">Média</option>
          <option value="Baixa">Baixa</option>
        </select>
      </div>

      {visao === 'kanban' ? (
        <Kanban lista={listaKanban} aoMoverDemanda={moverDemanda} aoAbrirDetalhe={setDetalhe} />
      ) : (
        <Tabela lista={filtradas} aoAbrirDetalhe={setDetalhe} />
      )}

      <DetalheDemanda demanda={detalhe} aoFechar={() => setDetalhe(null)} />
    </>
  )
}

export default Demandas
