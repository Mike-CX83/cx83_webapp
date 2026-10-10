import { describe, expect, it } from 'vitest'
import {
  ecosystemEdges,
  ecosystemNodes,
  ecosystemScenarios,
  findEdge,
  findNode,
} from '@/content/ecosystem'

describe('CX83 connected ecosystem source of truth', () => {
  it('keeps every node and directed edge unambiguous', () => {
    expect(new Set(ecosystemNodes.map((item) => item.id)).size).toBe(ecosystemNodes.length)
    expect(new Set(ecosystemEdges.map((item) => item.id)).size).toBe(ecosystemEdges.length)
    for (const node of ecosystemNodes) {
      expect(node.name.trim()).not.toBe('')
      expect(node.permission.trim()).not.toBe('')
      expect(node.description.trim()).not.toBe('')
      expect(node.x).toBeGreaterThanOrEqual(0)
      expect(node.y).toBeLessThanOrEqual(100)
    }
    for (const edge of ecosystemEdges) {
      expect(findNode(edge.from), edge.id).toBeDefined()
      expect(findNode(edge.to), edge.id).toBeDefined()
      expect(edge.from).not.toBe(edge.to)
    }
  })

  it('every scenario describes a continuous directed route and each step', () => {
    for (const scenario of ecosystemScenarios) {
      expect(scenario.path.length).toBeGreaterThan(1)
      expect(scenario.path).toHaveLength(scenario.captions.length)
      for (const id of scenario.path) expect(findNode(id), scenario.id + ': ' + id).toBeDefined()
      for (let step = 1; step < scenario.path.length; step++) {
        expect(findEdge(scenario.path[step - 1], scenario.path[step]), scenario.id + ': step ' + step).toBeDefined()
      }
    }
  })

  it('represents only the documented first party website route as demonstrated', () => {
    const website = ecosystemScenarios.find((item) => item.id === 'website')!
    expect(website.status).toBe('verified')
    expect(website.path).toEqual(['owner', 'chatgpt', 'cx83', 'github', 'nextjs', 'checks', 'staging'])
    expect(website.evidence).toBe('/how-it-works#real-proof')
    for (let step = 1; step < website.path.length; step++) {
      expect(findEdge(website.path[step - 1], website.path[step])?.status).toBe('verified')
    }
  })

  it('does not claim unverified email automation or released Studio software', () => {
    expect(findNode('gmail')?.status).toBe('example')
    expect(findNode('n8n')?.status).toBe('example')
    expect(findNode('wordpress')?.status).toBe('example')
    expect(findNode('studio')?.status).toBe('inDevelopment')
    expect(ecosystemScenarios.find((item) => item.id === 'inquiry')?.status).toBe('illustrative')
    expect(findEdge('n8n', 'gmail')?.status).toBe('illustrative')
  })

  it('keeps CAT independent of owner execution and deployment', () => {
    const cat = ecosystemScenarios.find((item) => item.id === 'cat')!
    expect(cat.path).toEqual(['visitor', 'cat', 'public', 'contact'])
    expect(cat.path).not.toContain('github')
    expect(cat.path).not.toContain('staging')
    expect(ecosystemEdges.filter((edge) => edge.from === 'cat').map((edge) => edge.to)).toEqual(['public'])
    expect(findNode('cat')?.permission).toContain('no owner editing tools')
  })
})
