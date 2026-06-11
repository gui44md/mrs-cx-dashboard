const ITENS = [
  { id: 'visaoGeral', rotulo: 'Visão Geral', icone: '📊' },
  { id: 'demandas', rotulo: 'Demandas', icone: '🗂️' },
  { id: 'melhoria', rotulo: 'Melhoria Contínua', icone: '💡' },
]

function Sidebar({ paginaAtual, aoNavegar }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icone">🚆</span>
        <div className="logo-texto">
          <strong>CX Ferrovia</strong>
          <span>Suporte &amp; Experiência do Cliente</span>
        </div>
      </div>
      <nav>
        {ITENS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${paginaAtual === item.id ? 'ativo' : ''}`}
            onClick={() => aoNavegar(item.id)}
          >
            <span>{item.icone}</span>
            {item.rotulo}
          </button>
        ))}
      </nav>
      <div className="sidebar-rodape">
        Projeto de portfólio · dados fictícios
        <br />
        Guilherme Medina · 2026
      </div>
    </aside>
  )
}

export default Sidebar
