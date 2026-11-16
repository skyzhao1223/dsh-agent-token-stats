/** Lazy tasks, at most limit collectors active (rather than eagerly launching all). */
export async function runLimited(tasks, limit = 3) {
  const results = new Array(tasks.length)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    for (;;) {
      const index = next++
      if (index >= tasks.length) return
      results[index] = tasks[index] ? await tasks[index]() : null
    }
  }))
  return results
}
export function retainPart(previous, result, at) {
  return result.error ? { ...result, data: previous?.data || null, lastAttemptAt: at, lastSuccessfulScan: previous?.lastSuccessfulScan || 0, stale: true }
    : { ...result, lastAttemptAt: at, lastSuccessfulScan: at, stale: false }
}
export function recordSemantics(record) {
  const tokens = ['i', 'o', 'r', 'cr', 'cw', 'tt'].reduce((sum, field) => sum + (Number(record[field]) || 0), 0)
  const known = record.tokensKnown ?? tokens > 0
  return {
    apiRequests: record.apiRequests ?? null,
    assistantMessages: record.assistantMessages !== undefined ? record.assistantMessages : (['codewhale', 'codex', 'hermes'].includes(record.agent) ? null : record.n),
    knownTokenRecords: record.knownTokenRecords ?? (known ? 1 : 0),
    unknownTokenRecords: record.unknownTokenRecords ?? (known ? 0 : 1),
    tokensKnown: known,
    countBasis: record.countBasis || 'observed-responses'
  }
}
export function sumSemantics(records) {
  const out = { apiRequests: 0, assistantMessages: 0, knownTokenRecords: 0, unknownTokenRecords: 0, tokensKnown: true, countBasis: 'observations' }
  for (const record of records) {
    const sem = recordSemantics(record)
    for (const field of ['apiRequests', 'assistantMessages']) out[field] = out[field] === null || sem[field] === null ? null : out[field] + sem[field]
    out.knownTokenRecords += sem.knownTokenRecords
    out.unknownTokenRecords += sem.unknownTokenRecords
    out.tokensKnown &&= sem.tokensKnown
  }
  return out
}
