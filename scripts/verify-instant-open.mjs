// 回归验证:面板打开(冷/热)必须立即返回,重扫只能在后台跑。
// 用一个最小 host 桩 + 真实 shell 驱动 lib/index.js,不依赖 DSH 运行时。
// 用法:node scripts/verify-instant-open.mjs   (会用真实 HOME 读日志,后台扫描约 1~2 分钟)
import { spawn } from 'node:child_process'
import assert from 'node:assert'

const host = await import(new URL('../lib/index.js', import.meta.url))

const children = new Set()
const heavy = []
function runShell(spec) {
  return new Promise(function (resolve) {
    if (/sqlite3 -readonly/.test(spec.command) || /zstd -dc/.test(spec.command)) heavy.push(Date.now())
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

function killScans() {
  children.forEach(function (c) { try { process.kill(-c.pid, 'SIGKILL') } catch (e) { /* already gone */ } })
  children.clear()
}

const routes = new Map()
const ctx = {
  shell: {
    resolve(spec) { return spec },
    async execute(spec) { const r = await runShell(spec); return { result: async () => r } }
  },
  webServer: {
    register(route) { routes.set(route.path, route.handler); return function () { routes.delete(route.path) } }
  },
  effect(fn) { const d = fn(); return function () { if (typeof d === 'function') d() } }
}

function call(path) {
  return new Promise(function (resolve, reject) {
    let body = ''
    const req = { method: 'GET', url: path, headers: { accept: 'application/json' } }
    const res = {
      statusCode: 0,
      setHeader() {},
      end(chunk) { body += chunk === undefined ? '' : String(chunk); resolve({ code: res.statusCode, body: body }) }
    }
    Promise.resolve(routes.get(path.split('?')[0])(req, res)).catch(reject)
  })
}

async function timed(path) {
  const t0 = Date.now()
  const r = await call(path)
  const ms = Date.now() - t0
  assert.equal(r.code, 200, path + ' must answer 200, got ' + r.code + ' ' + r.body.slice(0, 200))
  return { ms: ms, json: JSON.parse(r.body) }
}

host.apply(ctx)
const started = Date.now()

// 1) 冷启动:内存无结果,必须 ~瞬时返回磁盘台账快照并置 scanning
const cold = await timed('/agent-token-stats/data')
console.log('cold open: ' + cold.ms + 'ms rows=' + cold.json.rows.length + ' sources=' + cold.json.sources.length + ' scanning=' + cold.json.scanning)
assert.ok(cold.ms < 3000, 'cold open must not wait for the scan, took ' + cold.ms + 'ms')
assert.equal(cold.json.scanning, true, 'cold open must report scanning=true')
assert.ok(Array.isArray(cold.json.rows), 'cold open must include rows array')
assert.ok(cold.json.sources.length > 0, 'cold open must include ledger sources')

// 2) 重复打开:始终瞬时,且不会每次拉起新的重扫
const repeat = []
for (let i = 0; i < 4; i++) repeat.push((await timed('/agent-token-stats/data')).ms)
console.log('repeat opens: ' + repeat.join('ms, ') + 'ms')
assert.ok(Math.max.apply(null, repeat) < 1500, 'repeat opens must stay instant, got ' + repeat.join(','))

// 3) 等后台首次全量扫描落地,再验证热路径直接命中内存结果
const deadline = Date.now() + 300000
let warm = null
for (;;) {
  warm = await timed('/agent-token-stats/data')
  if (warm.json.scanning !== true) break
  if (Date.now() > deadline) break
  await new Promise(function (r) { setTimeout(r, 3000) })
}
console.log('warm open: ' + warm.ms + 'ms scanning=' + warm.json.scanning + ' rows=' + warm.json.rows.length + ' generatedAt=' + warm.json.generatedAt)
assert.equal(warm.json.scanning, false, 'background scan must eventually settle')
assert.ok(warm.ms < 1500, 'warm open must be instant, took ' + warm.ms + 'ms')
assert.ok(warm.json.rows.length > 0, 'warm open must contain ledger rows')

// 4) 冷却:扫描刚结束,签名即使抖动也不该立刻再拉起重扫
const before = heavy.length
for (let i = 0; i < 3; i++) await timed('/agent-token-stats/data')
await new Promise(function (r) { setTimeout(r, 5000) })
console.log('heavy scans during cooldown window: ' + (heavy.length - before) + ' (total heavy spawns ' + heavy.length + ')')
assert.equal(heavy.length - before, 0, 'cooldown must suppress immediate re-scans')

// 5) 手动刷新(force)同样不阻塞,重扫排到后台
const forced = await timed('/agent-token-stats/data?refresh=1')
console.log('forced refresh: ' + forced.ms + 'ms scanning=' + forced.json.scanning)
assert.ok(forced.ms < 3000, 'forced refresh must answer immediately, took ' + forced.ms + 'ms')
assert.equal(forced.json.scanning, true, 'forced refresh must report scanning=true')

killScans()
console.log('verify OK: cold/warm/forced opens are instant; scans only run in background; elapsed ' + (Date.now() - started) + 'ms')
