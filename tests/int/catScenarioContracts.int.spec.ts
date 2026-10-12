import { describe, expect, it } from 'vitest'
import scenarios from '../fixtures/catScenarios.json'
import { buildSystemPrompt } from '@/ai/assistant'
import { contactShortcut } from '@/ai/visitorAnswer'
import { parseChatMessages } from '@/ai/chatProtocol'

// Contract coverage uses the supplied scenario inputs. Model correctness stays in the separate live suite.
describe('30 scenario request contracts', () => {
  it('covers at least thirty unique representative visitor scenarios', () => {
    expect(scenarios.length).toBeGreaterThanOrEqual(30)
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length)
    for (const c of ['services', 'pricing', 'contact', 'technical', 'ambiguous', 'planning', 'continuity', 'unsupported', 'malicious', 'formatting', 'privacy']) expect(scenarios.some((s) => s.category === c)).toBe(true)
  })
  it.each(scenarios)('$id accepts the valid visitor input and retains any supplied history', (scenario) => {
    const history = (scenario.history || []).map((m) => ({ role: m.role, parts: [{ type: 'text', text: m.text }] }))
    const result = parseChatMessages([...history, { role: 'user', parts: [{ type: 'text', text: scenario.prompt }] }])
    expect(result.at(-1)?.content).toBe(scenario.prompt)
    expect(result).toHaveLength(history.length + 1)
  })
  it('contact fixtures produce the approved deterministic inquiry destinations', () => {
    expect(contactShortcut(scenarios[9].prompt)).toContain('/contact#contact-form')
    expect(contactShortcut(scenarios[10].prompt)).toContain('context=websites-and-business-tools')
  })
  it('business instructions preserve confirmed services and prohibit invented commitments', () => {
    const prompt = buildSystemPrompt('APPROVED CONTENT FIXTURE', '')
    expect(prompt).toContain('APPROVED CONTENT FIXTURE')
    expect(prompt).toContain('Do not invent prices, guarantees, deadlines')
    expect(prompt).toContain('preliminary project')
    expect(prompt).toContain('Never output safety classifications')
  })
})
