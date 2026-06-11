import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { demandas } from '../data/demandas.js'
import {
  filtrarPorPeriodo,
  calcularKpis,
  volumeMensal,
  porTipo,
  porSegmento,
  slaMensal,
} from '../utils/metrics.js'

const AZUL = '#0b2545'
const AZUL_CLARO = '#3e6ba8'
const LARANJA = '#f4772e'
const META_SLA = 90

const CORES_PIZZA = ['#0b2545', '#f4772e', '#3e6ba8', '#e6a817', '#2e9e5b', '#8a5cd6']

function KpiCard({ rotulo, valor, extra }) {
  return (
    <div className="card kpi">
      <span className="kpi-rotulo">{rotulo}</span>
      <span className="kpi-valor">{valor}</span>
      {extra && <span className="kpi-extra">{extra}</span>}
    </div>
  )
}

function VisaoGeral() {
  const [periodo, setPeriodo] = useState(6)

  const filtradas = useMemo(() => filtrarPorPeriodo(demandas, periodo), [periodo])
  const kpis = useMemo(() => calcularKpis(filtradas), [filtradas])
  const serieVolume = useMemo(() => volumeMensal(filtradas), [filtradas])
  const serieTipo = useMemo(() => porTipo(filtradas), [filtradas])
  const serieSegmento = useMemo(() => porSegmento(filtradas), [filtradas])
  const serieSla = useMemo(() => slaMensal(filtradas), [filtradas])

  return (
    <>
      <div className="controles">
        <label htmlFor="periodo">Período:</label>
        <select id="periodo" value={periodo} onChange={(e) => setPeriodo(Number(e.target.value))}>
          <option value={3}>Últimos 3 meses</option>
          <option value={6}>Últimos 6 meses</option>
        </select>
      </div>

      <div className="grid-kpis">
        <KpiCard
          rotulo="Demandas no período"
          valor={kpis.total}
          extra={`${kpis.abertas} ainda em aberto`}
        />
        <KpiCard
          rotulo="SLA cumprido"
          valor={`${kpis.slaPct}%`}
          extra={`Meta: ${META_SLA}%`}
        />
        <KpiCard
          rotulo="Tempo médio de resolução"
          valor={`${kpis.tempoMedioHoras}h`}
          extra="Demandas resolvidas"
        />
        <KpiCard
          rotulo="Satisfação média (CSAT)"
          valor={`${kpis.csat}/5`}
          extra="Avaliação pós-atendimento"
        />
      </div>

      <div className="grid-graficos">
        <div className="card">
          <h2>Volume de demandas por mês</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={serieVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e8f0" />
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="demandas"
                name="Demandas"
                stroke={AZUL}
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Cumprimento de SLA por mês (%)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={serieSla}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e8f0" />
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis fontSize={12} domain={[60, 100]} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <ReferenceLine
                y={META_SLA}
                stroke={LARANJA}
                strokeDasharray="6 4"
                label={{ value: `Meta ${META_SLA}%`, fontSize: 11, fill: LARANJA, position: 'insideTopRight' }}
              />
              <Line
                type="monotone"
                dataKey="sla"
                name="SLA"
                stroke={AZUL_CLARO}
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Demandas por tipo</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={serieTipo} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e8f0" />
              <XAxis type="number" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="tipo" fontSize={11} width={110} />
              <Tooltip />
              <Bar dataKey="demandas" name="Demandas" fill={LARANJA} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Demandas por segmento de cliente</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={serieSegmento}
                dataKey="demandas"
                nameKey="segmento"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {serieSegmento.map((item, i) => (
                  <Cell key={item.segmento} fill={CORES_PIZZA[i % CORES_PIZZA.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}

export default VisaoGeral
