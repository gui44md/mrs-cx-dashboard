import { useMemo } from 'react'
import { demandas } from '../data/demandas.js'
import { gerarInsights } from '../utils/metrics.js'

function MelhoriaContinua() {
  const insights = useMemo(() => gerarInsights(demandas), [])

  return (
    <>
      <div className="card">
        <h2>Como esta página funciona</h2>
        <p style={{ fontSize: 13, color: 'var(--texto-suave)', margin: 0 }}>
          Os insights abaixo não são escritos à mão: são <strong>calculados automaticamente</strong>{' '}
          a partir dos dados de atendimento — variação de volume por tipo de demanda, cumprimento
          de SLA e satisfação por segmento. A ideia é simular como uma área de Suporte e
          Experiência do Cliente pode usar os próprios dados para priorizar iniciativas de
          melhoria contínua.
        </p>
      </div>

      <div className="grid-insights">
        {insights.map((insight) => (
          <div key={insight.titulo} className="card insight">
            <span className="insight-categoria">{insight.categoria}</span>
            <h2>{insight.titulo}</h2>
            <p className="insight-detalhe">{insight.detalhe}</p>
            <p className="insight-sugestao">
              <strong>Sugestão de melhoria:</strong> {insight.sugestao}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

export default MelhoriaContinua
