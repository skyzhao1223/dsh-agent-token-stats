// 价目/币种/推理计费的确定性验证(秒级,fixture HOME,不读真实日志)。
// 覆盖:pricing.json 的 display/fx 换算、规则自带 unit、上报费用按美元换算、
// 判断细分 pattern 优先、未命中规则=0、推理 token 按 rt 计费、缺 fx 时的告警行为。
// 用法:node scripts/verify-pricing.mjs
import { spawn } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert'

const CHILD = process.argv[2] === 'child'

function setupFixture(pricing) {
  const root = mkdtempSync(join(tmpdir(), 'ats-price-'))
  const home = join(root, 'home')
  mkdirSync(join(home, '.agent-token-stats'), { recursive: true })
  writeFileSync(join(home, '.agent-token-stats/pricing.json'), JSON.stringify(pricing))
  const rows = {
    'a|1': { a: 'dsh', p: 'deepseek', v: 'deepseek', m: 'deepseek/deepseek-v4.1-flash', d: '2026-10-18', n: 1, i: 1000000, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 0 },
    'a|2': { a: 'dsh', p: 'deepseek', v: 'deepseek', m: 'deepseek/deepseek-v4.1-flash', d: '2026-10-17', n: 1, i: 0, o: 0, r: 1000000, cr: 0, cw: 0, tt: 0, c: 0 },
    'a|3': { a: 'dsh', p: 'wps-gateway', v: 'wps', m: 'gateway-model-x', d: '2026-10-16', n: 1, i: 1000000, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 0 },
    'a|4': { a: 'claude-code', p: 'anthropic', v: 'anthropic', m: 'claude-opus-4-7', d: '2026-10-15', n: 1, i: 1000000, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 0 },
    'a|5': { a: 'dsh', p: 'unknown', v: 'other', m: 'mystery/x', d: '2026-10-14', n: 1, i: 1000000, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 0 },
    'a|6': { a: 'opencode', p: 'openai', v: 'openai', m: 'gpt-5-mini', d: '2026-10-13', n: 1, i: 0, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 1 }
  }
  writeFileSync(join(home, '.agent-token-stats/ledger.json'), JSON.stringify({ version: 1, updatedAt: 1700000000000, rows: rows, projects: {}, sources: {} }))
  process.env.HOME = home
  return home
}

async function ask(pricing) {
  setupFixture(pricing)
  const host = await import(new URL('../lib/index.js', import.meta.url))
  const routes = new Map()
  const children = new Set()
  host.apply({
    shell: {
      resolve: s => s,
      async execute(s) {
        return {
          result: async () => await new Promise(function (resolve) {
            const child = spawn('bash', ['-c', s.command], { env: process.env, detached: true })
            children.add(child)
            let out = ''
            child.stdout.on('data', d => { out += d })
            child.on('error', () => { children.delete(child); resolve({ exitCode: 1, stdout: { text: '' }, stderr: { text: 'spawn error' } }) })
            child.on('close', code => { children.delete(child); resolve({ exitCode: code, stdout: { text: out }, stderr: { text: '' } }) })
            child.stdin.on('error', function () { /* reader may exit before we write */ })
            try { child.stdin.end(typeof s.stdin === 'string' ? s.stdin : '') } catch (e) { /* ignore EPIPE */ }
          })
        }
      }
    },
    webServer: { register(r) { routes.set(r.path, r.handler); return () => routes.delete(r.path) } },
    effect(fn) { const d = fn(); return () => { if (typeof d === 'function') d() } }
  })
  const body = await new Promise(function (resolve) {
    let b = ''
    routes.get('/agent-token-stats/data')({ method: 'GET', url: '/agent-token-stats/data', headers: {} }, { statusCode: 0, setHeader() {}, end(c) { b += c === undefined ? '' : String(c); resolve(b) } })
  })
  children.forEach(c => { try { process.kill(-c.pid, 'SIGKILL') } catch (e) { /* gone */ } })
  return JSON.parse(body)
}

const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-6, label + ': expected ' + expected + ', got ' + actual)

if (CHILD) {
  // 缺 fx:跨币种金额原样展示,并置告警位
  const noFx = await ask({ display: 'CNY', rules: [] })
  assert.equal(noFx.currency.display, 'CNY', 'display must be CNY')
  assert.equal(noFx.currency.fx, 0, 'fx must be 0')
  assert.equal(noFx.currency.fxMissing, true, 'missing fx must be reported')
  const ds = noFx.rows.filter(r => r.m === 'deepseek/deepseek-v4.1-flash')
  near(ds[0].ec, 0.28, 'no-fx: USD amount must stay as-is')
  console.log('no-fx case OK: fxMissing flagged, amounts left unconverted')
  process.exit(0)
}

// fx 换算 + 规则币种 + 上报币种 + 细分优先 + 推理计费
const data = await ask({
  display: 'CNY',
  fx: 7.2,
  rules: [{ pat: 'gateway-model', i: 2, o: 8, cr: 0.2, cw: 2, unit: 'CNY' }]
})
assert.equal(data.currency.display, 'CNY', 'display currency')
assert.equal(data.currency.symbol, '¥', 'symbol must follow display')
assert.equal(data.currency.unit, 'USD', 'file unit defaults to USD')
assert.equal(data.currency.reported, 'USD', 'reported costs are USD')
assert.equal(data.currency.fx, 7.2, 'fx echoed')
assert.equal(data.currency.fxMissing, false, 'no missing fx here')

const byModel = {}
for (const r of data.rows) (byModel[r.m] = byModel[r.m] || []).push(r)
const find = (m, day) => byModel[m].filter(r => r.d === day)[0]

// 1) 内置美元价 → 展示人民币(0.28 USD × 7.2)
near(find('deepseek/deepseek-v4.1-flash', '2026-10-18').ec, 0.28 * 7.2, 'USD rule converted to CNY')
// 2) 推理 token 按 rt(=输出价 0.42)计费,不再漏计
near(find('deepseek/deepseek-v4.1-flash', '2026-10-17').ec, 0.42 * 7.2, 'reasoning billed at rt')
// 3) 用户规则自带 CNY 单位 → 不做换算
near(find('gateway-model-x', '2026-10-16').ec, 2, 'CNY-denominated rule must not be converted')
// 4) 细分 pattern 优先:claude-opus(15) 不能被 claude(3) 兜底吃掉
near(find('claude-opus-4-7', '2026-10-15').ec, 15 * 7.2, 'specific pattern must win')
// 5) 未命中规则 = 0(不瞎猜)
assert.equal(find('mystery/x', '2026-10-14').ec, 0, 'unmatched model must estimate 0')
// 6) 上报费用按美元换算,且不再另行估算
const rep = find('gpt-5-mini', '2026-10-13')
near(rep.c, 7.2, 'reported USD converted to display')
assert.equal(rep.ec, 0, 'reported rows must not add an estimate')
// 7) 预算口径与展示币种一致(仅上报行,1 USD → 7.2)
const u = data.budget.use
assert.ok(u.monthTokens >= 0 && u.monthCost >= 7.2, 'budget use must carry converted cost, got ' + u.monthCost)

console.log('pricing fx case OK: conversion, rule unit, tiered match, reasoning pricing, reported handling')

const child = spawn(process.execPath, [new URL(import.meta.url).pathname, 'child'], { stdio: 'inherit' })
child.on('close', code => {
  assert.equal(code, 0, 'no-fx child case failed')
  console.log('verify OK: pricing/currency/reasoning behaviour holds')
  process.exit(0)
})
