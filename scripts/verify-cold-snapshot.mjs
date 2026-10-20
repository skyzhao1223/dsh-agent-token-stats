// 冷启动台账快照字段检查(秒级,无需真实日志):首屏必须来自磁盘台账且字段与全量结果同构
import { spawn } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert'

const root = mkdtempSync(join(tmpdir(), 'ats-cold-'))
const home = join(root, 'home')
mkdirSync(join(home, '.agent-token-stats'), { recursive: true })
mkdirSync(join(home, '.codex/sessions'), { recursive: true })
writeFileSync(join(home, '.codex/sessions/s1.jsonl'), '')
const STAMP = 1700000000000
writeFileSync(join(home, '.agent-token-stats/ledger.json'), JSON.stringify({
  version: 1,
  updatedAt: STAMP,
  rows: { 'k': { a: 'claude-code', p: 'anthropic', v: 'anthropic', m: 'claude-sonnet', d: '2026-10-17', n: 3, i: 100, o: 50, r: 0, cr: 10, cw: 0, tt: 0, c: 0 } },
  projects: {},
  sources: { 'claude-code': { records: 5, sessions: 2, files: 3, lastActivityAt: STAMP, everOk: true } }
}))
process.env.HOME = home

const host = await import(new URL('../lib/index.js', import.meta.url))
const children = new Set()
const collects = []
function runShell(spec) {
  return new Promise(function (resolve) {
    if (spec.command.indexOf('.codex/sessions') >= 0 && spec.command.indexOf('jq') >= 0) collects.push(Date.now())
    const child = spawn('bash', ['-c', spec.command], { env: process.env, detached: true })
    children.add(child)
    let out = ''
    child.stdout.on('data', d => { out += d })
    child.on('close', code => { children.delete(child); resolve({ exitCode: code, stdout: { text: out }, stderr: { text: '' } }) })
    child.on('error', () => { children.delete(child); resolve({ exitCode: 1, stdout: { text: '' }, stderr: { text: 'spawn error' } }) })
    child.stdin.end(typeof spec.stdin === 'string' ? spec.stdin : '')
  })
}
const routes = new Map()
host.apply({
  shell: { resolve: s => s, async execute(s) { const r = await runShell(s); return { result: async () => r } } },
  webServer: { register(r) { routes.set(r.path, r.handler); return () => routes.delete(r.path) } },
  effect(fn) { const d = fn(); return () => { if (typeof d === 'function') d() } }
})

const t0 = Date.now()
const body = await new Promise(function (resolve) {
  let b = ''
  routes.get('/agent-token-stats/data')({ method: 'GET', url: '/agent-token-stats/data', headers: {} }, { statusCode: 0, setHeader() {}, end(c) { b += c === undefined ? '' : String(c); resolve(b) } })
})
const ms = Date.now() - t0
const json = JSON.parse(body)
console.log('cold(snapshot) open: ' + ms + 'ms rows=' + json.rows.length + ' generatedAt=' + json.generatedAt + ' scanning=' + json.scanning + ' persisted=' + json.ledger.persisted)
assert.ok(ms < 2000, 'cold open must be instant')
assert.equal(json.scanning, true, 'must report scanning')
assert.equal(json.rows.length, 1, 'must expose ledger rows')
assert.equal(json.generatedAt, STAMP, 'snapshot must report the ledger save time, not now')
assert.equal(json.ledger.persisted, true, 'existing ledger must read as persisted')
assert.equal(json.sources[0].id, 'claude-code', 'source id must survive the snapshot')
assert.equal(json.sources[0].label, 'Claude Code', 'label must be resolved')
assert.equal(json.sources[0].status, 'ok', 'source with records must be ok')
assert.ok(json.budget && json.budget.use, 'budget block must be present')

// 手动刷新必须同样瞬时;若后台已有扫描在跑,刷新要排队补一次强制扫描(不能被丢掉)
async function get(url) {
  const started = Date.now()
  const raw = await new Promise(function (resolve) {
    let b = ''
    routes.get('/agent-token-stats/data')({ method: 'GET', url: url, headers: {} }, { statusCode: 0, setHeader() {}, end(c) { b += c === undefined ? '' : String(c); resolve(b) } })
  })
  return { ms: Date.now() - started, json: JSON.parse(raw) }
}
const forced = await get('/agent-token-stats/data?refresh=1')
console.log('forced refresh during first scan: ' + forced.ms + 'ms scanning=' + forced.json.scanning)
assert.ok(forced.ms < 1500, 'forced refresh must answer instantly, took ' + forced.ms + 'ms')
const deadline = Date.now() + 20000
while (collects.length < 2 && Date.now() < deadline) await new Promise(r => setTimeout(r, 250))
console.log('codex collects after cold + forced: ' + collects.length)
assert.ok(collects.length >= 2, 'a forced refresh queued behind a running scan must still run')

children.forEach(c => { try { process.kill(-c.pid, 'SIGKILL') } catch (e) { /* gone */ } })
console.log('cold snapshot OK')
process.exit(0)
