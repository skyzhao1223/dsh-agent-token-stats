export function fixture() {
  const now = Date.now()
  const day = new Date(now).toLocaleDateString('en-CA')
  const base = { a: 'opencode', p: 'openai', v: 'OpenAI', d: day, n: 2, i: 100, o: 50, r: 5, cr: 20, cw: 10, tt: 0, c: 0.25, ec: 0, apiRequests: 2, assistantMessages: null, knownTokenRecords: 2, unknownTokenRecords: 0, tokensKnown: true, countBasis: 'api-response', legacyUnverified: false }
  return {
    generatedAt: now, scanning: false,
    rows: [
      { ...base, m: 'gpt-fixture' },
      { ...base, a: 'cursor', p: 'cursor', v: 'Unknown', m: 'cursor-message', n: 0, i: 0, o: 0, r: 0, cr: 0, cw: 0, c: 0, apiRequests: null, assistantMessages: 3, knownTokenRecords: 0, unknownTokenRecords: 3, tokensKnown: false, countBasis: 'assistant-message' }
    ],
    sources: [{ id: 'opencode', label: 'OpenCode', status: 'ok', detail: 'fixture records', lastSuccessfulScan: now, lastAttemptAt: now, stale: false, coverage: { knownTokenRecords: 2, unknownTokenRecords: 0, ratio: 1 } }, { id: 'cursor', label: 'Cursor', status: 'error', detail: 'retained fixture', stale: true, error: 'scan fixture failure', lastSuccessfulScan: now - 3600000, lastAttemptAt: now, coverage: { knownTokenRecords: 0, unknownTokenRecords: 3, ratio: 0 } }],
    projects: [{ a: 'opencode', name: '/fixture/project', n: 2, total: 185, lastAt: now }],
    ledger: { persisted: true, path: '/fixture/ledger.json', savedAt: now },
    currency: { display: 'USD', symbol: '$', unit: 'USD', reported: 'USD', fx: 0, fxMissing: false }
  }
}
export function sessions() {
  return { sessions: [{ id: 'session-fixture', title: 'Fixture session', project: '/fixture/project', model: 'gpt-fixture', n: 2, i: 100, o: 50, r: 5, cr: 20, cw: 10, c: 0.25, createdAt: Date.now(), updatedAt: Date.now(), tokensKnown: true, knownTokenRecords: 2, unknownTokenRecords: 0, apiRequests: 2, assistantMessages: null }] }
}
