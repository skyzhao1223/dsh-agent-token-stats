import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
const root = new URL('../', import.meta.url)
const selected = readdirSync(new URL('./', import.meta.url)).filter(name =>
  ['smoke.mjs', 'verify-cold-snapshot.mjs', 'verify-pricing.mjs', 'verify-ux.mjs', 'verify-traffic.py', 'verify-cooldown.mjs', 'verify-instant-open.mjs'].includes(name) ||
  (name !== 'verify-host-ledger-diff.mjs' && /^verify-(host|client).*\.mjs$/.test(name))
).sort()
// All scan tests now use isolated fixture HOME. The read-only audit CLI is
// excluded from the test list (its behavior is covered by host regression).
for (const name of selected) {
  const command = name.endsWith('.py') ? 'python3' : process.execPath
  const result = spawnSync(command, ['scripts/' + name], { cwd: root, stdio: 'inherit', timeout: 120000 })
  if (result.error || result.status !== 0) {
    console.error('FAILED:', name, result.error || result.status)
    process.exit(1)
  }
}
console.log('PASS:', selected.length, 'isolated regression suites')
