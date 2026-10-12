export function minimizeDiagnosticText(text: string): string {
  return text
    .replace(/\b(?:sk-[\w-]+|AIza[\w-]+|Bearer\s+[\w.~-]+)\b/gi, '[credential removed]')
    .replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, '[email removed]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[identifier removed]')
    .replace(/\b(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/g, '[phone removed]')
    .replace(/\b(?:password|api[_ -]?key|token|secret)\s*[:=]\s*\S+/gi, '[credential removed]')
    .replace(/https?:\/\/\S+/gi, '[URL removed]')
}

