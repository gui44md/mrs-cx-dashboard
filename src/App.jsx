import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import VisaoGeral from './pages/VisaoGeral.jsx'
import Demandas from './pages/Demandas.jsx'
import MelhoriaContinua from './pages/MelhoriaContinua.jsx'

const PAGINAS = {
  visaoGeral: {
    titulo: 'Visão Geral',
    subtitulo: 'Indicadores de atendimento e experiência do cliente',
    componente: VisaoGeral,
  },
  demandas: {
    titulo: 'Gestão de Demandas',
    subtitulo: 'Acompanhamento e organização das demandas de atendimento',
    componente: Demandas,
  },
  melhoria: {
    titulo: 'Melhoria Contínua',
    subtitulo: 'Insights gerados a partir dos dados de atendimento',
    componente: MelhoriaContinua,
  },
}

function App() {
  const [paginaAtual, setPaginaAtual] = useState('visaoGeral')
  const pagina = PAGINAS[paginaAtual]
  const Pagina = pagina.componente

  return (
    <>
      <Sidebar paginaAtual={paginaAtual} aoNavegar={setPaginaAtual} />
      <div className="conteudo">
        <header className="header">
          <div>
            <h1>{pagina.titulo}</h1>
            <p className="subtitulo">{pagina.subtitulo}</p>
          </div>
        </header>
        <main className="pagina">
          <Pagina />
        </main>
        <footer className="rodape">
          Projeto educacional de portfólio com dados 100% fictícios, inspirado na rotina de uma
          área de Suporte e Experiência do Cliente no setor ferroviário de cargas. Sem qualquer
          afiliação com a MRS Logística S.A.
        </footer>
      </div>
    </>
  )
}

export default App
