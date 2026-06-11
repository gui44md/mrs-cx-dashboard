# 🚆 CX Ferrovia — Painel de Suporte e Experiência do Cliente

Dashboard que simula a rotina de uma área de **Suporte e Experiência do Cliente** de uma
operadora ferroviária de cargas: acompanhamento de demandas de atendimento, indicadores de
desempenho (SLA, tempo de resolução, satisfação) e insights de melhoria contínua.

> **Demo:** https://gui44md.github.io/mrs-cx-dashboard/

## Por que este projeto existe

Construí este projeto ao me candidatar ao **Programa de Estágio da MRS** para a vaga de
Estágio Superior em Suporte e Experiência do Cliente (Juiz de Fora/MG). Em vez de apenas
descrever interesse pela área, quis demonstrar na prática como enxergo o trabalho dela:

| O que a vaga pede | Onde aparece no projeto |
| --- | --- |
| Acompanhar e organizar demandas de atendimento | Página **Demandas** — kanban com arrastar e soltar + tabela com busca e filtros |
| Visão analítica | Página **Visão Geral** — KPIs de SLA, tempo de resolução e CSAT, com gráficos por tipo, segmento e mês |
| Apoiar iniciativas de melhoria contínua | Página **Melhoria Contínua** — insights calculados automaticamente a partir dos dados, com sugestões de ação |
| Interação com diferentes áreas / clientes | Tipos de demanda inspirados nos fluxos reais de atendimento ferroviário: localização de carga, previsão de chegada, ocorrências, reclamações e acesso a sistemas |

## Funcionalidades

- **Visão Geral** — 4 KPIs (demandas, SLA cumprido, tempo médio de resolução, CSAT) e 4
  gráficos (volume mensal, SLA mensal vs. meta, demandas por tipo, demandas por segmento de
  cliente), com filtro de período.
- **Gestão de Demandas** — kanban (Nova → Em andamento → Aguardando cliente → Resolvida) com
  drag-and-drop nativo HTML5, visão alternativa em tabela, busca por texto, filtros por tipo,
  cliente e prioridade, e modal com o detalhe completo de cada demanda.
- **Melhoria Contínua** — insights gerados por código a partir dos dados (tendências de
  crescimento por tipo de demanda, pior SLA, segmento com menor satisfação, evolução do SLA no
  semestre), cada um com uma sugestão prática de melhoria de processo.

## Stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Recharts](https://recharts.org/) para os gráficos
- CSS puro com variáveis (sem framework de UI)
- Dados **100% fictícios**, gerados de forma determinística (seed fixa) em
  [`src/data/demandas.js`](src/data/demandas.js) — sem backend

## Como rodar

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Estrutura

```
src/
├── data/demandas.js        # gerador determinístico das demandas fictícias
├── utils/metrics.js        # agregações: KPIs, séries mensais e insights
├── components/Sidebar.jsx
└── pages/
    ├── VisaoGeral.jsx      # KPIs + gráficos
    ├── Demandas.jsx        # kanban + tabela + modal
    └── MelhoriaContinua.jsx
```

## Aviso

Projeto educacional de portfólio. Todos os clientes, demandas e indicadores são fictícios.
Este projeto **não possui qualquer afiliação com a MRS Logística S.A.** e não utiliza marcas,
logotipos ou dados da empresa.

---

Feito por **Guilherme Medina** · 2026
