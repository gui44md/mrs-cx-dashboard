// Dados simulados de demandas de atendimento de uma operadora ferroviária de carga.
// Gerados de forma determinística (seed fixa) para que os números do dashboard
// sejam sempre os mesmos. Todos os clientes e nomes são fictícios.

// PRNG com seed fixa (mulberry32) — mesma sequência a cada execução
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260611)

function escolher(lista) {
  return lista[Math.floor(rand() * lista.length)]
}

function escolherPonderado(pesos) {
  const total = Object.values(pesos).reduce((s, p) => s + p, 0)
  let r = rand() * total
  for (const [chave, peso] of Object.entries(pesos)) {
    r -= peso
    if (r <= 0) return chave
  }
  return Object.keys(pesos)[0]
}

export const CLIENTES = [
  { nome: 'Minera Serra Azul', segmento: 'Mineração' },
  { nome: 'Ferro Forte Mineração', segmento: 'Mineração' },
  { nome: 'Siderúrgica Paraibuna', segmento: 'Siderurgia' },
  { nome: 'Aços do Sudeste', segmento: 'Siderurgia' },
  { nome: 'Agro Grãos do Cerrado', segmento: 'Agronegócio' },
  { nome: 'Cooperativa TriSul', segmento: 'Agronegócio' },
  { nome: 'Cimentos Mantiqueira', segmento: 'Cimento' },
  { nome: 'TransContêiner Santos', segmento: 'Contêineres' },
  { nome: 'LogPort Intermodal', segmento: 'Contêineres' },
]

export const TIPOS = [
  'Localização de carga',
  'Previsão de chegada',
  'Ocorrência',
  'Reclamação',
  'Acesso a sistemas',
  'Dúvida operacional',
]

export const STATUS = ['Nova', 'Em andamento', 'Aguardando cliente', 'Resolvida']

export const RESPONSAVEIS = ['Ana Ribeiro', 'Carlos Mendes', 'Juliana Costa', 'Rafael Lima']

// Prazo de SLA (horas) por prioridade
export const SLA_HORAS = { Alta: 24, 'Média': 48, Baixa: 72 }

const TRECHOS = [
  'Juiz de Fora (MG) → Porto de Itaguaí (RJ)',
  'Conselheiro Lafaiete (MG) → Volta Redonda (RJ)',
  'P2-07 Serra Azul (MG) → Porto de Santos (SP)',
  'Jundiaí (SP) → Porto de Santos (SP)',
  'Barra do Piraí (RJ) → Juiz de Fora (MG)',
  'Itutinga (MG) → Barra Mansa (RJ)',
]

const DESCRICOES = {
  'Localização de carga': [
    'Cliente solicita posição atual da composição com lote de minério.',
    'Pedido de localização de vagões carregados no terminal de origem.',
    'Cliente pergunta em qual pátio os vagões estão estacionados.',
  ],
  'Previsão de chegada': [
    'Cliente pede ETA atualizado para programar descarga no terminal.',
    'Solicitação de previsão de chegada para janela de atracação no porto.',
    'Cliente precisa do horário estimado para alocar equipe de descarga.',
  ],
  'Ocorrência': [
    'Registro de avaria em vagão identificada na inspeção de chegada.',
    'Comunicação de parada não programada por manutenção de via.',
    'Divergência de peso entre nota e balança do terminal.',
  ],
  'Reclamação': [
    'Cliente reclama de atraso recorrente na janela de carregamento.',
    'Reclamação sobre falta de atualização proativa de status.',
    'Cliente insatisfeito com tempo de resposta no último chamado.',
  ],
  'Acesso a sistemas': [
    'Usuário do cliente sem acesso ao portal de acompanhamento.',
    'Solicitação de novo login para equipe de logística do cliente.',
    'Erro ao emitir relatório de desempenho no portal do cliente.',
  ],
  'Dúvida operacional': [
    'Dúvida sobre documentação exigida para novo fluxo de carga.',
    'Cliente pergunta sobre procedimento de agendamento de carregamento.',
    'Dúvida sobre leitura do relatório mensal de indicadores.',
  ],
}

// Configuração mensal: volume cresce ao longo do semestre e o tipo
// "Previsão de chegada" ganha peso (tendência usada na página de insights).
// Taxa de SLA melhora de ~78% (jan) para ~92% (jun).
const MESES_CONFIG = [
  { ano: 2026, mes: 0, qtd: 12, pesoPrevisao: 2.0, taxaSla: 0.78 },
  { ano: 2026, mes: 1, qtd: 13, pesoPrevisao: 2.2, taxaSla: 0.8 },
  { ano: 2026, mes: 2, qtd: 14, pesoPrevisao: 2.6, taxaSla: 0.84 },
  { ano: 2026, mes: 3, qtd: 15, pesoPrevisao: 3.0, taxaSla: 0.86 },
  { ano: 2026, mes: 4, qtd: 17, pesoPrevisao: 3.6, taxaSla: 0.9 },
  { ano: 2026, mes: 5, qtd: 10, pesoPrevisao: 4.0, taxaSla: 0.92 }, // junho parcial
]

const HOJE = new Date(2026, 5, 11)

function gerarDemandas() {
  const lista = []
  let contador = 1

  for (const cfg of MESES_CONFIG) {
    for (let i = 0; i < cfg.qtd; i++) {
      const cliente = escolher(CLIENTES)
      const tipo = escolherPonderado({
        'Localização de carga': 3,
        'Previsão de chegada': cfg.pesoPrevisao,
        'Ocorrência': 1.6,
        'Reclamação': 1.2,
        'Acesso a sistemas': 1.4,
        'Dúvida operacional': 1.8,
      })
      const prioridade = escolherPonderado({ Alta: 1, 'Média': 2, Baixa: 1.5 })

      const ultimoDia = cfg.mes === HOJE.getMonth() ? HOJE.getDate() : 28
      const dia = 1 + Math.floor(rand() * ultimoDia)
      const hora = 7 + Math.floor(rand() * 11) // horário comercial
      const abertura = new Date(cfg.ano, cfg.mes, dia, hora, Math.floor(rand() * 60))

      const prazoHoras = SLA_HORAS[prioridade]
      const dentroDoSla = rand() < cfg.taxaSla

      // Demandas recentes (últimos 10 dias) podem ainda estar abertas
      const diasDesdeAbertura = (HOJE - abertura) / 36e5 / 24
      let status
      if (diasDesdeAbertura < 2) {
        status = escolherPonderado({ Nova: 2, 'Em andamento': 1 })
      } else if (diasDesdeAbertura < 10) {
        status = escolherPonderado({
          Nova: 0.5,
          'Em andamento': 1.5,
          'Aguardando cliente': 1,
          Resolvida: 2.5,
        })
      } else {
        status = 'Resolvida'
      }

      let resolucao = null
      let satisfacao = null
      let slaCumprido = null
      if (status === 'Resolvida') {
        const horasResolucao = dentroDoSla
          ? prazoHoras * (0.2 + rand() * 0.7)
          : prazoHoras * (1.1 + rand() * 1.2)
        resolucao = new Date(abertura.getTime() + horasResolucao * 36e5)
        slaCumprido = dentroDoSla
        satisfacao = dentroDoSla
          ? 4 + Math.round(rand()) // 4 ou 5
          : 2 + Math.round(rand() * 2) // 2 a 4
      }

      lista.push({
        id: `DM-2026-${String(contador++).padStart(3, '0')}`,
        cliente: cliente.nome,
        segmento: cliente.segmento,
        tipo,
        prioridade,
        status,
        abertura: abertura.toISOString(),
        resolucao: resolucao ? resolucao.toISOString() : null,
        slaPrazoHoras: prazoHoras,
        slaCumprido,
        satisfacao,
        responsavel: escolher(RESPONSAVEIS),
        descricao: escolher(DESCRICOES[tipo]),
        trecho: escolher(TRECHOS),
      })
    }
  }

  lista.sort((a, b) => new Date(b.abertura) - new Date(a.abertura))

  // Garante fila de entrada visível no kanban: as 3 demandas mais recentes
  // ainda não foram triadas
  for (const d of lista.slice(0, 3)) {
    d.status = 'Nova'
    d.resolucao = null
    d.satisfacao = null
    d.slaCumprido = null
  }

  return lista
}

export const demandas = gerarDemandas()
