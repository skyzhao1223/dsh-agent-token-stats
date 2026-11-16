const number = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0

/** Cursor assistant bubbles are messages, not billable API requests. Costs and
 * request counts remain as reported; token totals are never allocated by cost. */
export function cursorRecords(rows, { localDay, inferVendor }) {
  const records = [], composers = new Set()
  let lastAt = 0, withTokens = 0
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    if (typeof row.cid === 'string') composers.add(row.cid)
    const ms = number(row.ca), day = localDay(ms)
    lastAt = Math.max(lastAt, ms)
    let usage = row.ud
    if (typeof usage === 'string') { try { usage = JSON.parse(usage) } catch { throw new Error('Invalid Cursor usageData JSON') } }
    if (!usage || typeof usage !== 'object' || Array.isArray(usage)) usage = {}
    const base = { agent: 'cursor', provider: 'cursor', ms, day, n: 0, i: 0, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 0, project: '(Cursor IDE)' }
    const slugs = Object.keys(usage)
    for (const slug of slugs) {
      const item = usage[slug]
      if (!item || typeof item !== 'object') continue
      const amountKnown = typeof item.amount === 'number' && Number.isFinite(item.amount) && item.amount >= 0
      const amount = number(item.amount), cents = number(item.costInCents)
      if (!amount && !cents) continue
      const model = slug === 'default' ? 'unknown' : slug
      records.push({ ...base, model, vendor: inferVendor(model), n: amount, apiRequests: amountKnown ? amount : null, assistantMessages: 0,
        tokensKnown: false, unknownTokenRecords: 1, knownTokenRecords: 0, countBasis: 'reported-api-requests', c: cents / 100 })
    }
    const messages = number(row.na), input = number(row.ti), output = number(row.tok)
    if (messages > 0 || input + output > 0) {
      // Composer modelConfig is not per-bubble model evidence. Preserve token
      // totals in an unattributed bucket, separately from model usageData.
      const known = input + output > 0
      records.push({ ...base, model: '(unattributed)', vendor: 'unknown', apiRequests: slugs.length ? 0 : null,
        assistantMessages: messages, i: input, o: output, tokensKnown: known,
        unknownTokenRecords: known ? 0 : 1, knownTokenRecords: known ? 1 : 0, countBasis: 'assistant-messages' })
      if (known) withTokens++
    }
  }
  return { records, sessions: composers.size, lastAt, withTokens }
}
