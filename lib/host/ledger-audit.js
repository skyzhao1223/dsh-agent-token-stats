import { validateLedger } from './ledger-store.js'
const number = value => Number.isFinite(Number(value)) ? Number(value) : 0
const fields = ['n', 'i', 'o', 'r', 'cr', 'cw', 'tt', 'c']
export function ledgerDifference(ledger, scanRows = []) {
  validateLedger(ledger)
  const scanned = new Map(scanRows.map(row => [[row.a,row.p,row.v,row.m,row.d].join('\u0001'),row]))
  const report = { readOnly: true, ledgerUpdatedAt: ledger.updatedAt, legacyRows: 0, rows: [], note: 'Differences are observations, not proof of error: deleted logs and source retention can also explain gaps. No repair is performed.' }
  for (const [key,row] of Object.entries(ledger.rows)) {
    const observed = scanned.get(key), legacy = row.semanticVersion !== 1 || row.legacyUnverified === true
    if (legacy) report.legacyRows++
    const differences = observed ? Object.fromEntries(fields.map(field=>[field,number(row[field])-number(observed[field])]).filter(([,delta])=>delta!==0)) : null
    if (legacy || !observed || Object.keys(differences).length) report.rows.push({key,agent:row.a,model:row.m,day:row.d,legacyUnverified:legacy,scanPresent:!!observed,differences,ledger:Object.fromEntries(fields.map(field=>[field,number(row[field])])),observed:observed?Object.fromEntries(fields.map(field=>[field,number(observed[field])])):null})
    scanned.delete(key)
  }
  for (const [key,row] of scanned) report.rows.push({key,agent:row.a,model:row.m,day:row.d,scanPresent:true,ledgerPresent:false,observed:Object.fromEntries(fields.map(field=>[field,number(row[field])]))})
  return report
}
