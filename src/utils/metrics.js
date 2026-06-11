// Agregações usadas pelas páginas do dashboard.

export const MESES_LABEL = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function filtrarPorPeriodo(demandas, meses) {
  if (!meses) return demandas
  const limite = new Date(2026, 5 - meses + 1, 1) // a partir do 1º dia do mês inicial
  return demandas.filter((d) => new Date(d.abertura) >= limite)
}

export function calcularKpis(demandas) {
  const abertas = demandas.filter((d) => d.status !== 'Resolvida').length
  const resolvidas = demandas.filter((d) => d.status === 'Resolvida')

  const comSla = resolvidas.filter((d) => d.slaCumprido !== null)
  const slaPct = comSla.length
    ? Math.round((comSla.filter((d) => d.slaCumprido).length / comSla.length) * 100)
    : 0

  const tempos = resolvidas.map(
    (d) => (new Date(d.resolucao) - new Date(d.abertura)) / 36e5
  )
  const tempoMedioHoras = tempos.length
    ? Math.round(tempos.reduce((s, t) => s + t, 0) / tempos.length)
    : 0

  const notas = resolvidas.filter((d) => d.satisfacao !== null).map((d) => d.satisfacao)
  const csat = notas.length
    ? (notas.reduce((s, n) => s + n, 0) / notas.length).toFixed(1)
    : '—'

  return { total: demandas.length, abertas, slaPct, tempoMedioHoras, csat }
}

export function volumeMensal(demandas) {
  const porMes = new Map()
  for (const d of demandas) {
    const data = new Date(d.abertura)
    const chave = data.getFullYear() * 12 + data.getMonth()
    porMes.set(chave, (porMes.get(chave) || 0) + 1)
  }
  return [...porMes.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([chave, qtd]) => ({ mes: MESES_LABEL[chave % 12], demandas: qtd }))
}

export function porTipo(demandas) {
  const mapa = new Map()
  for (const d of demandas) {
    mapa.set(d.tipo, (mapa.get(d.tipo) || 0) + 1)
  }
  return [...mapa.entries()]
    .map(([tipo, qtd]) => ({ tipo, demandas: qtd }))
    .sort((a, b) => b.demandas - a.demandas)
}

export function porSegmento(demandas) {
  const mapa = new Map()
  for (const d of demandas) {
    mapa.set(d.segmento, (mapa.get(d.segmento) || 0) + 1)
  }
  return [...mapa.entries()]
    .map(([segmento, qtd]) => ({ segmento, demandas: qtd }))
    .sort((a, b) => b.demandas - a.demandas)
}

export function slaMensal(demandas) {
  const porMes = new Map()
  for (const d of demandas) {
    if (d.slaCumprido === null) continue
    const data = new Date(d.abertura)
    const chave = data.getFullYear() * 12 + data.getMonth()
    if (!porMes.has(chave)) porMes.set(chave, { ok: 0, total: 0 })
    const item = porMes.get(chave)
    item.total++
    if (d.slaCumprido) item.ok++
  }
  return [...porMes.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([chave, { ok, total }]) => ({
      mes: MESES_LABEL[chave % 12],
      sla: Math.round((ok / total) * 100),
    }))
}

// ---- Insights para a página de Melhoria Contínua ----

function variacaoPercentual(atual, anterior) {
  if (!anterior) return null
  return Math.round(((atual - anterior) / anterior) * 100)
}

export function gerarInsights(demandas) {
  const insights = []

  // Compara o último mês completo (mai) com o trimestre anterior (fev–abr), por tipo
  const noMes = (d, mes) => new Date(d.abertura).getMonth() === mes
  const noIntervalo = (d, ini, fim) => {
    const m = new Date(d.abertura).getMonth()
    return m >= ini && m <= fim
  }

  const tipos = [...new Set(demandas.map((d) => d.tipo))]
  for (const tipo of tipos) {
    const doTipo = demandas.filter((d) => d.tipo === tipo)
    const mai = doTipo.filter((d) => noMes(d, 4)).length
    const mediaTrimestre = doTipo.filter((d) => noIntervalo(d, 1, 3)).length / 3
    const variacao = variacaoPercentual(mai, mediaTrimestre)
    if (variacao !== null && variacao >= 25 && mai >= 4) {
      insights.push({
        titulo: `Demandas de "${tipo}" cresceram ${variacao}% em maio`,
        detalhe: `Foram ${mai} demandas em maio contra uma média de ${mediaTrimestre.toFixed(1)}/mês no trimestre anterior.`,
        sugestao:
          tipo === 'Previsão de chegada'
            ? 'Implantar notificação proativa de ETA no portal do cliente reduziria contatos repetitivos e liberaria a equipe para demandas complexas.'
            : tipo === 'Acesso a sistemas'
              ? 'Criar fluxo de autoatendimento para redefinição de acesso reduziria o volume desse tipo de chamado.'
              : 'Investigar a causa raiz do aumento com as áreas operacionais envolvidas.',
        categoria: 'Tendência',
      })
    }
  }

  // Tipo com pior SLA
  const slaPorTipo = tipos
    .map((tipo) => {
      const resolvidas = demandas.filter((d) => d.tipo === tipo && d.slaCumprido !== null)
      if (resolvidas.length < 5) return null
      const pct = Math.round(
        (resolvidas.filter((d) => d.slaCumprido).length / resolvidas.length) * 100
      )
      return { tipo, pct, qtd: resolvidas.length }
    })
    .filter(Boolean)
    .sort((a, b) => a.pct - b.pct)

  if (slaPorTipo.length) {
    const pior = slaPorTipo[0]
    insights.push({
      titulo: `"${pior.tipo}" tem o menor cumprimento de SLA (${pior.pct}%)`,
      detalhe: `Das ${pior.qtd} demandas resolvidas desse tipo, ${pior.pct}% foram concluídas dentro do prazo.`,
      sugestao:
        'Mapear o fluxo de tratamento desse tipo de demanda com as áreas internas envolvidas e identificar gargalos de handoff.',
      categoria: 'SLA',
    })
  }

  // Segmento com menor satisfação
  const segmentos = [...new Set(demandas.map((d) => d.segmento))]
  const csatPorSegmento = segmentos
    .map((segmento) => {
      const notas = demandas
        .filter((d) => d.segmento === segmento && d.satisfacao !== null)
        .map((d) => d.satisfacao)
      if (notas.length < 5) return null
      return {
        segmento,
        csat: notas.reduce((s, n) => s + n, 0) / notas.length,
        qtd: notas.length,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.csat - b.csat)

  if (csatPorSegmento.length) {
    const pior = csatPorSegmento[0]
    insights.push({
      titulo: `Segmento ${pior.segmento} tem a menor satisfação média (${pior.csat.toFixed(1)}/5)`,
      detalhe: `Média calculada sobre ${pior.qtd} avaliações de demandas resolvidas.`,
      sugestao:
        'Agendar conversa estruturada com os clientes do segmento para entender as dores específicas e priorizar ações.',
      categoria: 'Satisfação',
    })
  }

  // Evolução positiva do SLA no semestre
  const serie = slaMensal(demandas)
  if (serie.length >= 2) {
    const primeiro = serie[0]
    const ultimo = serie[serie.length - 1]
    if (ultimo.sla > primeiro.sla) {
      insights.push({
        titulo: `SLA evoluiu de ${primeiro.sla}% (${primeiro.mes}) para ${ultimo.sla}% (${ultimo.mes})`,
        detalhe: 'Tendência consistente de melhoria no cumprimento de prazos ao longo do semestre.',
        sugestao:
          'Documentar as práticas que sustentaram a melhoria e transformá-las em padrão de atendimento da equipe.',
        categoria: 'Evolução',
      })
    }
  }

  return insights
}
