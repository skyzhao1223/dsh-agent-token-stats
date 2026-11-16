// Real React + ReactDOM reconciliation against jsdom, never a fake React hook renderer.
// This verifies behavior and DOM structure, not layout, theme contrast, or the live GUI.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import vm from 'node:vm'
import { JSDOM } from 'jsdom'
import React, { act } from 'react'
import { fixture, sessions } from '../tests/client/fixtures.mjs'

const source = await fs.readFile(process.env.LTS_CLIENT || new URL('../lib/client.js', import.meta.url), 'utf8')
let createRoot
let passed = 0
const failures = []
async function check(name, test) {
  try { await test(); passed++; console.log('PASS', name) } catch (error) { failures.push(name); console.error('FAIL', name, error) }
}
async function harness({ data = fixture(), dataHandler, sessionHandler, code = source } = {}) {
  const dom = new JSDOM('<!doctype html><html><head></head><body><div id="mount"></div></body></html>', { url: 'http://localhost/' })
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Event: dom.window.Event, IS_REACT_ACT_ENVIRONMENT: true })
  if (!createRoot) ({ createRoot } = await import('react-dom/client'))
  const requests = [], requestOptions = [], registrations = [], disposers = [], timers = new Set(), intervals = new Set()
  const originalTimeout = dom.window.setTimeout.bind(dom.window)
  const originalClear = dom.window.clearTimeout.bind(dom.window)
  dom.window.setTimeout = (callback, ms) => {
    const id = originalTimeout(() => { timers.delete(id); callback() }, ms)
    timers.add(id); return id
  }
  dom.window.clearTimeout = id => { timers.delete(id); originalClear(id) }
  const originalInterval = dom.window.setInterval.bind(dom.window)
  const originalClearInterval = dom.window.clearInterval.bind(dom.window)
  dom.window.setInterval = (callback, ms) => { const id = originalInterval(callback, ms); intervals.add(id); return id }
  dom.window.clearInterval = id => { intervals.delete(id); originalClearInterval(id) }
  dom.window.HTMLElement.prototype.scrollIntoView = function () {}
  const fetcher = async (url, options) => {
    requests.push(url)
    requestOptions.push({ url, options })
    if (url.includes('/sessions')) return { ok: true, json: async () => sessionHandler ? sessionHandler(url) : sessions() }
    if (url.includes('/quota')) return { ok: true, json: async () => ({ quotas: [] }) }
    if (url.includes('/export')) return { ok: true, json: async () => ({ path: '/fixture/export.csv', rows: 2 }) }
    return dataHandler ? dataHandler(url) : { ok: true, json: async () => data }
  }
  let plugin
  dom.window.__ModuleLoader__ = { load: payload => { plugin = payload.factory(name => { assert.equal(name, 'react'); return React }) } }
  const context = vm.createContext({ window: dom.window, document: dom.window.document, fetch: fetcher, URL: dom.window.URL, Blob: dom.window.Blob, setTimeout: dom.window.setTimeout, console, Date })
  vm.runInContext(code, context, { filename: 'client.js' })
  plugin.apply({ effect: fn => { const cleanup = fn(); if (cleanup) disposers.push(cleanup) }, slots: { inject: (_name, fn) => fn(), register: (options, factory) => registrations.push({ options, factory }) } })
  const main = registrations.find(r => r.options.name === 'main')
  assert.ok(main, 'main slot registered')
  const mount = dom.window.document.getElementById('mount')
  const root = createRoot(mount, { onCaughtError: () => {} })
  await act(async () => { root.render(main.factory()); await Promise.resolve() })
  const flush = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve() }) }
  const click = async el => { assert.ok(el, 'click target exists'); await act(async () => { el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); await Promise.resolve() }) }
  const button = text => [...mount.querySelectorAll('button')].find(b => b.textContent === text)
  const tab = async id => { await click(mount.querySelector('#lts-tab-' + id)); await flush(); assert.equal(mount.querySelector('[role="tabpanel"]').id, 'lts-panel-' + id) }
  const text = () => mount.textContent
  const change = async (el, value) => {
    const proto = el.tagName === 'SELECT' ? dom.window.HTMLSelectElement.prototype : dom.window.HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
    await act(async () => { el.dispatchEvent(new dom.window.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); await Promise.resolve() })
  }
  const close = async () => {
    await act(async () => root.unmount())
    disposers.reverse().forEach(fn => fn())
    assert.equal(intervals.size, 0, 'component intervals disposed')
    assert.equal(timers.size, 0, 'component timers disposed')
    assert.equal(dom.window.document.querySelector('style[data-dsh-agent-token-stats]'), null, 'plugin style disposed')
    dom.window.close()
  }
  return { dom, mount, root, requests, requestOptions, registrations, flush, click, button, tab, text, change, close }
}

await check('six pages render with actual ReactDOM, bilingual labels and keyboard navigation', async () => {
  const h = await harness()
  try {
    assert.equal(h.registrations.length, 2)
    assert.ok(h.text().includes('API 请求（已知部分）'))
    assert.ok(h.text().includes('Assistant 消息（已知部分）'))
    assert.ok(h.text().includes('185 + 未知'))
    assert.ok(h.text().includes('40.0%'))
    assert.equal(h.mount.querySelector('.lts-card:first-child .lts-delta') === null, true, 'incomplete token totals cannot claim a period delta')
    const expected = { overview: '厂商份额', trend: 'Token 趋势', compare: '时间段对比', detail: '模型明细(', sessions: 'Fixture session', sources: 'scan fixture failure' }
    for (const [id, content] of Object.entries(expected)) { await h.tab(id); assert.ok(h.text().includes(content), id + ' body') }
    assert.ok(h.text().includes('最近成功扫描'))
    assert.ok(h.text().includes('陈旧快照'))
    await h.click(h.button('EN'))
    for (const [id, content] of Object.entries({ overview: 'Vendor Share', trend: 'Token Trend', compare: 'Period Comparison', detail: 'Model Detail (', sessions: 'Fixture session', sources: 'Data Source Status' })) { await h.tab(id); assert.ok(h.text().includes(content), id + ' English body') }
    assert.ok(h.text().includes('Stale snapshot'))
    await act(async () => { h.mount.querySelector('#lts-tab-sources').dispatchEvent(new h.dom.window.KeyboardEvent('keydown', { key: 'Home', bubbles: true })) })
    assert.equal(h.mount.querySelector('[role="tabpanel"]').id, 'lts-panel-overview')
    assert.equal(h.dom.window.document.activeElement.id, 'lts-tab-overview')
  } finally { await h.close() }
})
await check('source/vendor/model/time filters, unknown-only data and detail expansion', async () => {
  const h = await harness()
  try {
    await h.click(h.button('Cursor'))
    assert.equal(h.mount.querySelector('.lts-card-value').textContent, '未知', 'unknown usage is not zero')
    await h.tab('detail')
    assert.ok(h.mount.querySelector('tbody').textContent.includes('未知'))
    await h.tab('sources')
    assert.ok(h.text().includes('OpenCode'), 'sources ignore analytics filters')
    await h.click(h.button('清空筛选'))
    await h.tab('detail')
    await h.change(h.mount.querySelector('select'), 'OpenAI')
    assert.ok(h.mount.querySelector('tbody').textContent.includes('gpt-fixture'))
    assert.ok(!h.mount.querySelector('tbody').textContent.includes('cursor-message'))
    await h.change(h.mount.querySelector('.lts-search-input'), 'does-not-exist')
    assert.ok(h.text().includes('当前筛选范围内没有数据'))
    await h.click(h.button('清空筛选'))
    await h.change(h.mount.querySelector('.lts-search-input'), 'gpt-fixture')
    const row = h.mount.querySelector('tbody tr')
    await h.click(row)
    assert.ok(h.mount.querySelector('.lts-expand'))
    await h.click(h.button('全部')) // source All; resets source without discarding model search
    const allButtons = [...h.mount.querySelectorAll('button')].filter(b => b.textContent === '全部')
    await h.click(allButtons.at(-1))
    assert.ok(h.text().includes('全部时间'))
  } finally { await h.close() }
})
await check('malformed rows are safe, legacy tokens stay unverified, sessions unknown not zero', async () => {
  const data = fixture()
  data.rows = [null, {}, { a: 'cursor', m: 'legacy', v: 'Legacy', d: data.rows[0].d, n: '2', i: Infinity, o: -2, r: {}, cr: null, cw: 0 }]
  data.sources = [null, { id: 'legacy', label: 'Legacy', status: 'ok', detail: {} }]
  data.projects = [null, {}]
  const h = await harness({ data, sessionHandler: () => ({ sessions: [null, { title: 'Unknown session' }] }) })
  try {
    assert.ok(!h.text().includes('NaN'))
    assert.ok(!h.text().includes('Infinity'))
    assert.ok(h.text().includes('旧台账 / 覆盖率未核验'))
    assert.equal(h.mount.querySelector('.lts-card-value').textContent, '未知')
    await h.tab('sessions')
    assert.ok(h.text().includes('Unknown session'))
    assert.ok(h.mount.querySelector('tbody').textContent.includes('未知'))
    await h.tab('sources')
    assert.ok(h.text().includes('Legacy'))
  } finally { await h.close() }
})
await check('HTTP and invalid JSON shape keep last good snapshot with visible error', async () => {
  let response = fixture(), bad = false, invalid = false
  const h = await harness({ dataHandler: async () => bad ? { ok: false, status: 503 } : { ok: true, json: async () => invalid ? { rows: {} } : response } })
  try {
    bad = true; await h.click(h.button('立即刷新'))
    assert.ok(h.text().includes('HTTP 503'))
    assert.ok(h.text().includes('正在显示上次数据'))
    assert.ok(h.text().includes('185 + 未知'))
    bad = false; invalid = true; await h.click(h.button('立即刷新'))
    assert.ok(h.text().includes('数据响应格式无效'))
    assert.ok(h.text().includes('185 + 未知'))
    invalid = false; await h.click(h.button('立即刷新'))
    assert.ok(!h.text().includes('刷新失败'))
  } finally { await h.close() }
})
await check('session rejection and invalid sessions response are visible without panel crash', async () => {
  let invalid = false
  const h = await harness({ sessionHandler: () => { if (!invalid) throw new Error('session-fixture-rejection'); return { sessions: 'bad' } } })
  try {
    await h.tab('sessions')
    assert.ok(h.text().includes('session-fixture-rejection'))
    invalid = true
    await h.click(h.button('Cursor(较慢)')); await h.flush()
    assert.ok(h.text().includes('数据响应格式无效'))
    await h.tab('overview'); assert.ok(h.text().includes('厂商份额'))
  } finally { await h.close() }
})
await check('CSV export uses POST for file mutation and renders success feedback', async () => {
  const h = await harness()
  try {
    await h.click(h.button('导出 CSV')); await h.flush()
    const request = h.requestOptions.find(r => r.url === '/agent-token-stats/export')
    assert.ok(request, 'export request issued')
    assert.equal(request.options.method, 'POST', 'GET must never create an export file')
    assert.ok(h.text().includes('已导出 /fixture/export.csv'))
    assert.equal(h.button('导出 CSV').disabled, false, 'export button recovers after response')
  } finally { await h.close() }
})
await check('scanning snapshot status and timers dispose on unmount', async () => {
  const data = fixture(); data.scanning = true
  const h = await harness({ data })
  try { assert.ok(h.text().includes('后台扫描中')); assert.ok(h.text().includes('台账快照')) } finally { await h.close() }
})
await check('actual React render error boundary catches, retries and does not erase ledger', async () => {
  // Fault injection into a real child render; the runtime and React boundary remain untouched.
  const code = source.replace('function Dashboard() {', 'function Dashboard() { if (window.__failRender) throw new Error("forced-render-fault");')
  const data = fixture(); data.sources[0].label = { invalid: 'React child' }
  // Source normalization protects this case. Trigger the render fault using the boundary's retry remount.
  const h = await harness({ data, code })
  try {
    h.dom.window.__failRender = true
    await h.click(h.button('EN'))
    assert.ok(h.mount.querySelector('[role="alert"]'))
    assert.ok(h.text().includes('forced-render-fault'))
    assert.ok(h.text().includes('never the local ledger'))
    h.dom.window.__failRender = false
    await h.click(h.button('Clear panel cache and retry')); await h.flush()
    assert.ok(h.text().includes('Vendor Share'))
    assert.ok(!h.mount.querySelector('[role="alert"]'))
    assert.ok(h.requests.filter(r => r === '/agent-token-stats/data').length >= 2)
  } finally { await h.close() }
})
await check('in-flight data response after unmount cannot install polling timers', async () => {
  let resolve
  const waiting = new Promise(r => { resolve = r })
  const h = await harness({ dataHandler: () => waiting })
  await h.close()
  const data = fixture(); data.scanning = true
  await act(async () => { resolve({ ok: true, json: async () => data }); await Promise.resolve() })
  assert.equal(h.requests.length, 1)
})
if (failures.length) { console.error(`${failures.length} failed; ${passed} passed`); process.exitCode = 1 }
else console.log(`ALL PASS: ${passed} real ReactDOM regression groups (React ${React.version}); live GUI visual verification not performed`)
