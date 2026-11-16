// Read-only report. Does not import host.apply, scan HOME, save, restore or repair.
// node scripts/verify-host-ledger-diff.mjs --ledger /path/ledger.json [--scan /path/aggregate-rows.json]
import { readFile } from 'node:fs/promises'
import { ledgerDifference } from '../lib/host/ledger-audit.js'
const args = process.argv.slice(2)
if (!args.length) {
  console.log('Read-only ledger diff: --ledger <ledger.json> [--scan <aggregate-rows.json>] (no files changed)')
} else {
  const options = {}
  for (let index=0;index<args.length;index+=2) {
    if (!['--ledger','--scan'].includes(args[index]) || !args[index+1]) throw new Error('Expected --ledger <file> [--scan <file>]')
    options[args[index]]=args[index+1]
  }
  if (!options['--ledger']) throw new Error('--ledger is required; no implicit user ledger access')
  const ledger = JSON.parse(await readFile(options['--ledger'],'utf8'))
  const rows = options['--scan'] ? JSON.parse(await readFile(options['--scan'],'utf8')) : []
  if (!Array.isArray(rows)) throw new Error('Scan input must contain an aggregate row array')
  console.log(JSON.stringify(ledgerDifference(ledger,rows),null,2))
}
