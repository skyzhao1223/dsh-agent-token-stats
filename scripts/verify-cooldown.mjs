// 冷却 + 待补扫验证(约 90s):用 fixture HOME 驱动真实 lib/index.js,
// 断言 (1) 重扫冷却期内不重复扫描;(2) 冷却期间的签名变更不会被吞掉,冷却结束后补扫入账。
// 用法:node scripts/verify-cooldown.mjs
import { spawn } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert'

const root = mkdtempSync(join(tmpdir(), 'ats-fix-'))
const home = join(root, 'home')
mkdirSync(join(home, '.codex/sessions'), { recursive: true })
const sess = join(home, '.codex/sessions', 's1.jsonl')

// Codex 会话级快照:同一个 key(agent×model×day)被扫到更大的 total 时,台账 ratchet 必须增长
function snapshot(total) {
  return [
    JSON.stringify({ type: 'session_meta', payload: { timestamp: '2026-10-18T00:00:00Z', id: 'sess-1', cwd: '/tmp/proj' } }),
    JSON.stringify({ type: 'turn_context', payload: { model: 'gpt-5' } }),
    JSON.stringify({ type: 'event_msg', timestamp: '2026-10-18T00:00:10Z', payload: { type: 'token_count', info: { total_token_usage: { input_tokens: total, cached_input_tokens: 0, output_tokens: Math.floor(total / 2), reasoning_output_tokens: 0 } } } })
  ].join('\n') + '\n'
}
writeFileSync(sess, snapshot(1000))

process.env.HOME = home

const host = await import(new URL('../lib/index.js', import.meta.url))

const children = new Set()
const codexCollects = []
function runShell(spec) {
  return new Promise(function (resolve) {
    if (spec.command.indexOf('.codex/sessions') >= 0 && spec.command.indexOf('jq') >= 0) codexCollects.push(Date.now())
    const child = spawn('bash', ['-c', spec.command], { env: process.env, detached: true })
    children.add(child)
    let out = ''
    let err = ''
    child.stdout.on('data', function (d) { out += d })
    child.stderr.on('data', function (d) { err += d })
    child.on('error', function (e) { children.delete(child); resolve({ exitCode: 1, stdout: { text: '' }, stderr: { text: String(e && e.message) } }) })
    child.on('close', function (code) { children.delete(child); resolve({ exitCode: code, stdout: { text: out }, stderr: { text: err } }) })
    if (typeof spec.stdin === 'string' && spec.stdin !== '') child.stdin.end(spec.stdin)
    else child.stdin.end()
  })
}

const routes = new Map()
const ctx = {
  shell: { resolve(s) { return s }, async execute(s) { const r = await runShell(s); return { result: async () => r } } },
  webServer: { register(route) { routes.set(route.path, route.handler); return function () { routes.delete(route.path) } } },
  effect(fn) { const d = fn(); return function () { if (typeof d === 'function') d() } }
}

function call(path) {
  return new Promise(function (resolve, reject) {
    let body = ''
    const req = { method: 'GET', url: path, headers: { accept: 'application/json' } }
    const res = { statusCode: 0, setHeader() {}, end(c) { body += c === undefined ? '' : String(c); resolve({ code: res.statusCode, body: body }) } }
    Promise.resolve(routes.get(path.split('?')[0])(req, res)).catch(reject)
  })
}
async function get(path) {
  const t0 = Date.now()
  const r = await call(path)
  assert.equal(r.code, 200, path + ' -> ' + r.code + ' ' + r.body.slice(0, 200))
  return { ms: Date.now() - t0, json: JSON.parse(r.body) }
}
const sleep = ms => new Promise(r => setTimeout(r, ms))

function codexLedgerTokens() {
  const ledger = JSON.parse(readFileSync(join(home, '.agent-token-stats/ledger.json'), 'utf8'))
  let i = 0
  let o = 0
  Object.keys(ledger.rows).forEach(function (k) {
    const e = ledger.rows[k]
    if (e.a !== 'codex') return
    i += Number(e.i) || 0
    o += Number(e.o) || 0
  })
  return { i: i, o: o }
}

host.apply(ctx)
const cold = await get('/agent-token-stats/data')
console.log('cold open: ' + cold.ms + 'ms scanning=' + cold.json.scanning)
assert.ok(cold.ms < 3000, 'cold open must be instant')

const deadline = Date.now() + 60000
let warm = cold
while (warm.json.scanning === true && Date.now() < deadline) {
  await sleep(1000)
  warm = await get('/agent-token-stats/data')
}
assert.equal(warm.json.scanning, false, 'first scan must settle')
const t0 = Date.now()
const first = codexLedgerTokens()
console.log('after first scan: codex i=' + first.i + ' o=' + first.o + ' codexCollects=' + codexCollects.length)
assert.equal(codexCollects.length, 1, 'first scan must collect codex once')
assert.ok(first.i > 0, 'first scan must record tokens')

// 追加一条更大的快照:签名(mtime)变化,但 codex 冷却 60s 尚未到期
appendFileSync(sess, snapshot(3000))

await sleep(Math.max(0, t0 + 31000 - Date.now()))
const mid = await get('/agent-token-stats/data')
console.log('t+31s open: ' + mid.ms + 'ms scanning=' + mid.json.scanning)
assert.ok(mid.ms < 1500, 'open during cooldown must be instant')
await sleep(9000)
const duringCooldown = codexLedgerTokens()
console.log('during cooldown: codex i=' + duringCooldown.i + ' codexCollects=' + codexCollects.length)
assert.equal(codexCollects.length, 1, 'cooldown must block the rescan')
assert.equal(duringCooldown.i, first.i, 'ledger must not advance while cooling down')

// 等冷却过期:此前的签名变更必须被补扫,不能被吞掉
await sleep(Math.max(0, t0 + 66000 - Date.now()))
const late = await get('/agent-token-stats/data')
console.log('t+66s open: ' + late.ms + 'ms scanning=' + late.json.scanning)
assert.ok(late.ms < 1500, 'open after cooldown must be instant')
const scanDeadline = Date.now() + 30000
while (codexCollects.length < 2 && Date.now() < scanDeadline) await sleep(1000)
await sleep(1000)
const after = codexLedgerTokens()
console.log('after cooldown: codex i=' + after.i + ' o=' + after.o + ' codexCollects=' + codexCollects.length)
assert.equal(codexCollects.length, 2, 'pending signature change must be re-scanned after cooldown')
assert.ok(after.i > duringCooldown.i, 'ledger must advance after the deferred rescan')

children.forEach(function (c) { try { process.kill(-c.pid, 'SIGKILL') } catch (e) { /* already gone */ } })
console.log('verify OK: cooldown suppresses rescan, deferred signature change is not swallowed')
