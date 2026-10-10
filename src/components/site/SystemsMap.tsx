'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import {
  ecosystemEdges,
  ecosystemNodes,
  ecosystemScenarios,
  ecosystemStatusLabels,
  findNode,
  type EcosystemNode,
} from '@/content/ecosystem'

type MapVariant = 'preview' | 'full'

const layers = [
  { id: 'owner', label: 'Business owner', number: '01', node: 'owner', category: 'people', heading: 'A real request starts with the owner.', example: 'Please improve the service page and check its links.', boundary: 'A conversation cannot override account permissions.' },
  { id: 'ai', label: 'Connected AI', number: '02', node: 'chatgpt', category: 'ai', heading: 'Your supported AI turns an idea into a task.', example: 'ChatGPT uses an authorized connector.', boundary: 'Another AI provider needs its own verified configuration.' },
  { id: 'tools', label: 'Authorized tools', number: '03', node: 'cx83', category: 'cx83', heading: 'The software does the real work.', example: 'An approved operation updates actual code or CMS content.', boundary: 'Owner connections cannot grant CAT editing access.' },
  { id: 'workflows', label: 'Business workflows', number: '04', node: 'n8n', category: 'automation', heading: 'Optional workflows join your existing systems.', example: 'A saved inquiry could trigger an approved business process.', boundary: 'Automation and outbound email are not automatically included.' },
  { id: 'checks', label: 'Checks and staging', number: '05', node: 'checks', category: 'control', heading: 'Verification separates a request from a release.', example: 'The website passes tests before protected staging is updated.', boundary: 'Staging verification does not authorize public production.' },
  { id: 'control', label: 'Your accounts and data', number: '06', node: 'postgres', category: 'records', heading: 'Keep your accounts and records under defined control.', example: 'Website form entries have a designated system of record.', boundary: 'Data and licensing rights follow each actual configuration.' },
  { id: 'cat', label: 'Visitor CAT', number: '07', node: 'cat', category: 'visitor', heading: 'CAT helps visitors without owner access.', example: 'CAT explains public services and how to contact CX83.', boundary: 'Cannot edit source, deploy software, bill or read private inquiries.' },
] as const

const canvasNodeIds = [
  'owner', 'chatgpt', 'claude', 'gemini', 'cx83', 'github', 'nextjs',
  'payload', 'checks', 'staging', 'postgres', 'drive', 'gmail', 'n8n',
] as const
const previewNodeIds = ['owner', 'chatgpt', 'cx83', 'github', 'checks', 'staging'] as const
const visitorNodeIds = ['visitor', 'cat', 'public', 'contact'] as const
const otherNodeIds = ['claude', 'gemini', 'wordpress', 'studio'] as const

function Logo({ node, large = false }: { node: EcosystemNode; large?: boolean }) {
  if (node.logo) {
    return (
      <span className={'cx83-ecosystem-logo' + (large ? ' cx83-ecosystem-logo-large' : '')}>
        <Image src={node.logo} alt="" aria-hidden="true" width={large ? 60 : 34} height={large ? 60 : 34} unoptimized />
      </span>
    )
  }
  return <span className="cx83-ecosystem-logo cx83-ecosystem-logo-generic" aria-hidden="true">{node.category === 'people' || node.category === 'visitor' ? '●' : '↗'}</span>
}

function Status({ node }: { node: EcosystemNode }) {
  return <span className="cx83-ecosystem-node-status">{ecosystemStatusLabels[node.status]}</span>
}

function Preview() {
  return (
    <div className="cx83-systems-map cx83-ecosystem-preview" data-testid="systems-map">
      <p className="cx83-ecosystem-overline">A real CX83 website workflow</p>
      <ol className="cx83-ecosystem-preview-rail" aria-label="From owner request to verified staging">
        {previewNodeIds.map((id, index) => {
          const node = findNode(id)!
          return (
            <li key={id} className="cx83-ecosystem-preview-stop">
              <Link className="cx83-ecosystem-preview-link" href={'/how-it-works#system-map'} aria-label={node.name + '. ' + node.description + '. Explore details'}>
                <Logo node={node} />
                <strong>{node.name}</strong>
                <span>{index === 0 ? 'Request' : index === previewNodeIds.length - 1 ? 'Verified result' : ecosystemStatusLabels[node.status]}</span>
              </Link>
              {index < previewNodeIds.length - 1 && <span aria-hidden="true" className="cx83-ecosystem-preview-arrow">→</span>}
            </li>
          )
        })}
      </ol>
      <div className="cx83-ecosystem-preview-bottom">
        <p>Owner AI uses scoped connections. The real site is checked before protected staging is updated.</p>
        <Link href="/how-it-works#system-map" className="cx83-run2-text-link">Explore all connections <span aria-hidden="true">↗</span></Link>
      </div>
      <p className="cx83-ecosystem-disclaimer">Third party marks identify services, not partnerships or unrestricted access.</p>
    </div>
  )
}

function NodeButton({ node, current, related, onSelect, compact = false }: {
  node: EcosystemNode
  current: boolean
  related: boolean
  onSelect: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      className={'cx83-ecosystem-provider' + (compact ? ' cx83-ecosystem-provider-small' : '')}
      data-testid="ecosystem-provider"
      data-selected={current}
      data-related={related}
      data-status={node.status}
      aria-pressed={current}
      aria-label={(node.id === 'cat' ? 'CAT assistant' : node.name) + '. ' + ecosystemStatusLabels[node.status] + '. Select for details'}
      onClick={onSelect}
    >
      <Logo node={node} large={node.id === 'cx83'} />
      <span className="cx83-ecosystem-provider-text">
        <strong>{node.id === 'cat' ? 'CAT' : node.name}</strong>
        <Status node={node} />
      </span>
    </button>
  )
}

export function SystemsMap({ variant = 'full' }: { variant?: MapVariant }) {
  const [scenarioId, setScenarioId] = useState<string | null>('website')
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedNode, setSelectedNode] = useState<string | null>('owner')
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const scenario = ecosystemScenarios.find((item) => item.id === scenarioId)
  const stepId = scenario?.path[stepIndex]
  const activeLayer = layers.find((layer) => layer.id === selectedLayer)
  const activeNode = findNode(selectedNode ?? stepId ?? 'cx83') ?? ecosystemNodes[0]
  const focusedCategory = activeLayer?.category
  const activeRoute = new Set(scenario?.path ?? [])
  const currentEdge = scenario && stepIndex > 0
    ? ecosystemEdges.find((edge) => edge.from === scenario.path[stepIndex - 1] && edge.to === scenario.path[stepIndex])
    : null

  useEffect(() => {
    if (!playing || !scenario) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // The first step remains selected; manual navigation always works.
      return
    }
    if (stepIndex >= scenario.path.length - 1) return
    const timer = window.setTimeout(() => setStepIndex((index) => index + 1), 1500)
    return () => window.clearTimeout(timer)
  }, [playing, scenario, stepIndex])

  if (variant === 'preview') return <Preview />

  function chooseScenario(id: string) {
    const next = ecosystemScenarios.find((item) => item.id === id)!
    setScenarioId(id)
    setStepIndex(0)
    setSelectedNode(next.path[0])
    setSelectedLayer(null)
    setPlaying(false)
  }

  function chooseNode(id: string) {
    setSelectedNode(id)
    setSelectedLayer(null)
    setPlaying(false)
  }

  function goToStep(index: number) {
    if (!scenario) return
    const bounded = Math.max(0, Math.min(scenario.path.length - 1, index))
    setStepIndex(bounded)
    setSelectedNode(scenario.path[bounded])
    setSelectedLayer(null)
    setPlaying(false)
  }

  function showAll() {
    setScenarioId(null)
    setSelectedNode('cx83')
    setSelectedLayer(null)
    setStepIndex(0)
    setPlaying(false)
  }

  return (
    <div className="cx83-systems-map cx83-ecosystem-full" data-testid="systems-map" id="ecosystem-explorer">
      <div className="cx83-ecosystem-heading">
        <div>
          <p className="cx83-ecosystem-overline">CX83 connected ecosystem</p>
          <h3>Follow a request through real systems.</h3>
          <p>Choose a workflow or select any logo to explore its role, permissions and demonstrated status.</p>
        </div>
        <button className="cx83-ecosystem-small-control" type="button" onClick={showAll}>Show all connections</button>
      </div>

      <div className="cx83-ecosystem-scenario-selector" role="group" aria-label="Choose a workflow">
        {ecosystemScenarios.map((item) => (
          <button key={item.id} type="button" data-testid="ecosystem-scenario" aria-pressed={item.id === scenarioId} onClick={() => chooseScenario(item.id)}>
            <strong>{item.title}</strong>
            <span>{item.status === 'verified' ? 'Demonstrated path' : item.status === 'inDevelopment' ? 'In development' : 'Illustrative path'}</span>
          </button>
        ))}
      </div>

      <div className="cx83-ecosystem-viewport">
        <div className="cx83-ecosystem-diagram" aria-label="Provider connections and workflow paths">
          <svg className="cx83-ecosystem-edges" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Directed connections are also described in the step by step journey below">
            <defs>
              <marker id="cx83-ecosystem-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L6 3 L0 6 Z" fill="context-stroke" /></marker>
            </defs>
            {ecosystemEdges.filter((edge) => {
              return canvasNodeIds.includes(edge.from as typeof canvasNodeIds[number]) && canvasNodeIds.includes(edge.to as typeof canvasNodeIds[number])
            }).map((edge) => {
              const start = findNode(edge.from)!
              const end = findNode(edge.to)!
              const inRoute = !!scenario && scenario.path.some((id, index) => id === edge.from && scenario.path[index + 1] === edge.to)
              return (
                <line key={edge.id} x1={start.x} y1={start.y} x2={end.x} y2={end.y} vectorEffect="non-scaling-stroke" strokeWidth={inRoute ? 2 : 1} markerEnd="url(#cx83-ecosystem-arrow)"
                  className="cx83-ecosystem-connector"
                  data-route={inRoute}
                  data-current={currentEdge?.id === edge.id}
                  data-kind={edge.status}
                />
              )
            })}
          </svg>
          {canvasNodeIds.map((id) => {
            const node = findNode(id)!
            const current = activeNode.id === id || (!!scenario && stepId === id)
            const related = (!scenario && !focusedCategory) || activeRoute.has(id) || focusedCategory === node.category
            return (
              <div key={id} className="cx83-ecosystem-position" style={{ left: node.x + '%', top: node.y + '%' }}>
                <NodeButton node={node} current={current} related={related} onSelect={() => chooseNode(id)} />
              </div>
            )
          })}
        </div>

        <aside className="cx83-systems-active-detail cx83-ecosystem-detail" aria-live="polite" data-testid="systems-active-detail" id="cx83-systems-active-detail">
          <p className="cx83-systems-eyebrow">{activeLayer ? 'Selected layer / ' + activeLayer.number : ecosystemStatusLabels[activeNode.status]}</p>
          <h3>{activeLayer?.heading ?? activeNode.name}</h3>
          <p>{activeNode.description}</p>
          <dl className="cx83-systems-detail-grid">
            <div><dt>Example</dt><dd>{activeLayer?.example ?? activeNode.description}</dd></div>
            <div><dt>Allowed access</dt><dd>{activeNode.permission}</dd></div>
            <div><dt>Boundary</dt><dd>{activeLayer?.boundary ?? (activeNode.id === 'cat' ? 'Cannot edit source, deploy or access customer records.' : ecosystemStatusLabels[activeNode.status])}</dd></div>
          </dl>
          <details className="cx83-systems-technical">
            <summary>Technical detail for this layer</summary>
            <p>{activeNode.technical}</p>
            <p>Provider connections are separately authorized. A logo does not indicate a live integration or endorsement.</p>
          </details>
          {scenario?.evidence && <Link className="cx83-run2-text-link" href={scenario.evidence}>See the actual proof record <span aria-hidden="true">↗</span></Link>}
        </aside>
      </div>

      <div className="cx83-ecosystem-families" role="group" aria-label="Explore provider families">
        {layers.map((layer) => (
          <button
            key={layer.id}
            className="cx83-ecosystem-family"
            type="button"
            data-testid="systems-layer"
            aria-pressed={selectedLayer === layer.id}
            aria-controls="cx83-systems-active-detail"
            onClick={() => { setSelectedLayer(layer.id); setSelectedNode(layer.node); setPlaying(false) }}
          >
            <span className="cx83-systems-node-index">{layer.number}</span>
            <span>{layer.label}</span>
          </button>
        ))}
      </div>

      <section className="cx83-ecosystem-journey" aria-label="Selected workflow journey">
        <div className="cx83-ecosystem-journey-heading">
          <div>
            <p className="cx83-ecosystem-overline">Step by step</p>
            <h3>{scenario?.title ?? 'All connections overview'}</h3>
            <p>{scenario?.outcome ?? 'Select a provider or workflow to understand the paths and permission boundaries.'}</p>
          </div>
          {scenario && <div className="cx83-ecosystem-playback">
            <button type="button" onClick={() => goToStep(stepIndex - 1)} disabled={stepIndex === 0}>Previous</button>
            <button type="button" onClick={() => goToStep(stepIndex + 1)} disabled={stepIndex === scenario.path.length - 1}>Next step</button>
            <button type="button" onClick={() => { setStepIndex(0); setSelectedNode(scenario.path[0]); setSelectedLayer(null); setPlaying(true) }}>Replay</button>
            <button type="button" onClick={() => setPlaying(false)} disabled={!playing}>Pause</button>
          </div>}
        </div>
        {scenario && <>
          <p className="cx83-ecosystem-progress" data-testid="ecosystem-step" aria-live="polite">Step {stepIndex + 1} of {scenario.path.length}: {scenario.captions[stepIndex]}. <span>{scenario.status === 'verified' ? 'First party demonstrated route' : 'Illustrative or developing route'}</span></p>
          <ol className="cx83-ecosystem-steps">
            {scenario.path.map((id, index) => {
              const node = findNode(id)!
              return (
                <li key={id + index}>
                  <button type="button" aria-current={stepIndex === index ? 'step' : undefined} onClick={() => goToStep(index)} data-active={stepIndex === index}>
                    <span className="cx83-ecosystem-step-num">{String(index + 1).padStart(2, '0')}</span>
                    <Logo node={node} />
                    <span><strong>{node.name}</strong><small>{scenario.captions[index]}</small><em>{ecosystemStatusLabels[node.status]}</em></span>
                  </button>
                </li>
              )
            })}
          </ol>
        </>}
      </section>

      <section className="cx83-ecosystem-visitor" data-testid="visitor-lane" aria-label="Separate public visitor assistant permission boundary">
        <div>
          <p className="cx83-ecosystem-overline">Different access, different purpose</p>
          <h3>CAT is for visitors, not website administration.</h3>
          <p>The visitor route reads approved public CX83 information and leads to ordinary public pages. It has no link to private editing, deployments, billing or customer records.</p>
        </div>
        <ol className="cx83-ecosystem-visitor-rail">
          {visitorNodeIds.map((id, index) => {
            const node = findNode(id)!
            return <li key={id}>
              <NodeButton node={node} current={activeNode.id === id} related={true} compact onSelect={() => chooseNode(id)} />
              {index < visitorNodeIds.length - 1 && <span className="cx83-ecosystem-visitor-arrow" aria-hidden="true">→</span>}
            </li>
          })}
        </ol>
      </section>

      <div className="cx83-ecosystem-other">
        <p>Additional tools to explore, each with separate authorization and release status</p>
        <div>
          {otherNodeIds.map((id) => {
            const node = findNode(id)!
            return <NodeButton key={id} node={node} current={activeNode.id === id} related={true} compact onSelect={() => chooseNode(id)} />
          })}
        </div>
      </div>
      <p className="cx83-systems-instructions">Use Tab and Enter or Space to select a logo, category, scenario or journey step. Every connection requires appropriate permissions. Third party marks identify illustrative or demonstrated tools and do not imply partnership or endorsement.</p>
    </div>
  )
}
