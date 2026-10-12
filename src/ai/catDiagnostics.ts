// Aggregate operational counters only. No conversation, request ID, IP, prompt or provider error text.
const outcomes = new Map<string, { provider: string; configuredModel: string; responseModel: string; finishReason: string; rejected: boolean; count: number }>()
function modelLabel(value: string | undefined): string {
  return value && /^[a-z0-9._:/-]{1,120}$/i.test(value) && !/^sk-/i.test(value) ? value : 'unknown'
}
export function recordCatOutcome(input: { provider: string | null; configuredModel: string; responseModel?: string; finishReason: string; rejected: boolean }) {
  const entry = { provider: ['openrouter', 'openai', 'google'].includes(input.provider || '') ? input.provider! : 'unknown', configuredModel: modelLabel(input.configuredModel), responseModel: modelLabel(input.responseModel),
    finishReason: ['stop', 'length', 'content-filter', 'error', 'tool-calls', 'other', 'unknown'].includes(input.finishReason) ? input.finishReason : 'unknown', rejected: input.rejected }
  const key = JSON.stringify(entry)
  if (!outcomes.has(key) && outcomes.size >= 100) outcomes.delete(outcomes.keys().next().value!)
  outcomes.set(key, { ...entry, count: (outcomes.get(key)?.count || 0) + 1 })
}
export function catDiagnosticCounters() { return [...outcomes.values()] }
