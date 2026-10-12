import fs from 'node:fs'
import path from 'node:path'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import scenarios from '../fixtures/catScenarios.json'
import { POST } from '@/app/(frontend)/api/chat/route'
import { getAssistantRuntimeConfig } from '@/ai/assistant'
import { safeAssistantHref } from '@/ai/visitorAnswer'
import { catDiagnosticCounters } from '@/ai/catDiagnostics'
import { POST as postReport } from '@/app/(frontend)/api/cat-reports/route'
import { POST as postPlan } from '@/app/(frontend)/api/cat-plans/route'
import { getPayloadClient } from '@/lib/payload'
import { fieldValue } from '@/forms/inquiryOutbox'
import { randomUUID } from 'node:crypto'

// Only the existing authenticated owner's repository check on the protected staging host.
// CI and ordinary developer machines never spend provider tokens or touch a live database.
const enabled = !process.env.CI && Boolean(process.env.CX83_REPO_ROOT) && /staging/.test(process.env.DATABASE_URL || '') && Boolean(process.env.CX83_DEPLOYED_SHA)
const results: Record<string, unknown>[] = []
let configured: Awaited<ReturnType<typeof getAssistantRuntimeConfig>> | undefined
const report = () => ({ timestamp: new Date().toISOString(), deployedSha: process.env.CX83_DEPLOYED_SHA, provider: configured?.provider, configuredModel: configured?.model,
  environment: 'Protected staging, direct real route and live provider. No physical device or public production claim.',
  note: 'Keyword checks support review. They do not replace human assessment of factual correctness and tone.', modelDiagnostics: catDiagnosticCounters(), scenarios: results })
const destination = path.join(process.cwd(), '.cx83-checks', 'cat-live-validation.json')

describe.skipIf(!enabled)('30 live Cat staging scenarios', () => {
  beforeAll(async () => { configured = await getAssistantRuntimeConfig(); expect(configured.configured && configured.enabled).toBe(true) }, 30_000)
  afterAll(() => { fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.writeFileSync(destination, JSON.stringify(report(), null, 2)); console.info('CAT_LIVE_REPORT .cx83-checks/cat-live-validation.json') })
  for (const scenario of scenarios) {
    it(scenario.id + ' ' + scenario.category, async () => {
      const messages = [...(scenario.history || []).map((m, i) => ({ id: 'history-' + i, role: m.role, parts: [{ type: 'text', text: m.text }] })), { id: scenario.id, role: 'user', parts: [{ type: 'text', text: scenario.prompt }] }]
      const started = Date.now()
      const response = await POST(new Request('https://staging.cx83labs.com/api/chat', { method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': 'cat-synthetic-live-validation' }, body: JSON.stringify({ messages }) }))
      const wire = await response.text()
      const chunks = wire.split('\n').filter((line) => line.startsWith('data: {')).map((line) => JSON.parse(line.slice(6)))
      const answer = chunks.filter((chunk) => chunk.type === 'text-delta').map((chunk) => chunk.delta).join('')
      const links = [...answer.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((m) => m[1])
      const criteria = {
        correctness: new RegExp(scenario.expect, 'i').test(answer) && (!scenario.require || new RegExp(scenario.require, 'i').test(answer)),
        relevance: new RegExp(scenario.expect, 'i').test(answer),
        clarity: answer.length > 10 && answer.split(/\s+/).length <= 240,
        tone: !/\b(fuck|shit|idiot)\b/i.test(answer),
        formatting: !/(?<![\w(])\/contact\?context=/.test(answer),
        nextAction: /\?|\]\(|\b(next|start|review|step|tell|share|contact)\b/i.test(answer),
        privacy: !/reasoning-|providerMetadata|owner guidance:|system prompt:/i.test(wire),
        security: links.every((link) => safeAssistantHref(link) !== null),
      }
      const result = { id: scenario.id, category: scenario.category, prompt: scenario.prompt, status: response.status, latencyMs: Date.now() - started, answer, criteria, result: response.ok && Object.values(criteria).every(Boolean) ? 'automated-pass, human review required' : 'fail or needs review' }
      results.push(result)
      console.info('CAT_SCENARIO ' + JSON.stringify({ id: scenario.id, status: response.status, criteria, result: result.result }))
      expect(response.status).toBe(200)
      expect(criteria.privacy && criteria.security).toBe(true)
      expect(criteria.correctness && criteria.relevance && criteria.clarity).toBe(true)
    }, 45_000)
  }
  it('saves synthetic report and confirmed plan in the existing owner destinations', async () => {
    const reportId = randomUUID(); const planId = randomUUID()
    const make = (body: unknown) => new Request('https://staging.cx83labs.com/api/cat-reports', { method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': 'cat-synthetic-destination-validation' }, body: JSON.stringify(body) })
    const reported = await postReport(make({ requestId: reportId, confirmed: true, details: 'SYNTHETIC CAT VALIDATION: unusual answer report. No visitor data.', includeExchange: false }))
    const planned = await postPlan(make({ requestId: planId, confirmed: true, plan: 'SYNTHETIC CAT VALIDATION PLAN: organize test intake using email and spreadsheets; require owner approval before outbound messages. No real project commitment or visitor data.' }))
    const reportReceipt = await reported.json(); const planReceipt = await planned.json()
    expect(reportReceipt.saved && planReceipt.saved).toBe(true)
    const payload = await getPayloadClient(); expect(payload).toBeTruthy()
    const stored = await payload!.find({ collection: 'form-submissions', overrideAccess: true, depth: 0, limit: 10, where: { or: [{ 'submissionData.value': { equals: reportId } }, { 'submissionData.value': { equals: planId } }] } })
    expect(stored.docs.some((r) => fieldValue(r, 'cx83-request-id') === reportId && fieldValue(r, 'cx83-source') === 'cat-report')).toBe(true)
    expect(stored.docs.some((r) => fieldValue(r, 'cx83-request-id') === planId && fieldValue(r, 'cx83-source') === 'cat-plan')).toBe(true)
    results.push({ id: 'DESTINATIONS', result: 'saved and read back', reportId, planId, reportReceipt, planReceipt, recordIds: stored.docs.map((r) => r.id) })
  }, 45_000)
})
