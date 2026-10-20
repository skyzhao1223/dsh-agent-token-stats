// 客户端 UX 回归(无浏览器依赖,秒级)。
//
// 用自带的极小 React 垫片把 client.js 的 Dashboard 真正渲染出来(函数组件按路径持有
// 自己的 hook 槽,状态更新会重渲染),断言的是「结构与交互」:
//   首屏骨架 / 扫描状态条 / 筛选器适用范围 / 空状态 / 当日下钻与截断披露 /
//   键盘快捷键(/,Esc)→ 导出轻提示 / 会话页默认来源 / 侧栏入口无障碍名 /
//   主题 token 与响应式规则的守卫。
//
// 注意:这是结构级验证,**不是视觉验证** —— 像素、配色、真实对比度仍需在有浏览器的
// 环境里人工确认。用法:node scripts/verify-ux.mjs
//
// 垫片的已知保真度边界(别把它当成真 React):没有 key 协调、组件按渲染路径持有 hook,
// 所以「条件 hook / 组件换位置导致 hook 错位」这类问题它抓不到;setInterval/clearInterval
// 是惰性桩,30 秒时钟与定时器取消路径没有被真正驱动。ref 提交、effect cleanup、
// useMemo/useCallback/useEffect 的依赖语义是真跑的。
import { readFileSync } from 'node:fs'
import assert from 'node:assert'

// LTS_CLIENT 可指向另一个副本,用来做「把功能删掉,断言必须挂」的变异自检。
const SRC = readFileSync(process.env.LTS_CLIENT || new URL('../lib/client.js', import.meta.url), 'utf8')

// ---------------------------------------------------------------- 极小 React 垫片
function makeRuntime() {
  const stores = new Map()
  let current = null
  let rendering = false
  let dirty = false
  let scheduled = false
  let rootFn = null
  let tree = null
  let effects = []
  const calls = { focus: 0, scroll: 0, lastScroll: null }

  function store(path) {
    let s = stores.get(path)
    if (s === undefined) { s = { hooks: [], cursor: 0 }; stores.set(path, s) }
    return s
  }
  function slot(i, make) {
    if (current === null) throw new Error('hook called outside render')
    if (current.hooks.length <= i) current.hooks[i] = make()
    return current.hooks[i]
  }
  // useMemo/useCallback 必须按依赖记忆,否则 [load] 这类依赖每次都是新身份,
  // 组件里的 useEffect(..., [load]) 会每帧重新取数 —— 那是垫片的 bug,不是被测代码的。
  function sameDeps(a, b) {
    if (a === undefined || b === undefined) return false
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
    return true
  }

  function createElement(type, props) {
    const children = []
    for (let i = 2; i < arguments.length; i++) {
      const c = arguments[i]
      if (c === null || c === undefined || c === false || c === true || c === '') continue
      if (Array.isArray(c)) {
        for (let k = 0; k < c.length; k++) {
          const x = c[k]
          if (x === null || x === undefined || x === false || x === true || x === '') continue
          children.push(x)
        }
      } else children.push(c)
    }
    const merged = Object.assign({}, props || {})
    merged.children = children
    return { type: type, props: merged }
  }

  const React = {
    Fragment: 'Fragment',
    createElement: createElement,
    useState: function (init) {
      const i = current.cursor++
      const s = slot(i, function () { return { kind: 'state', v: typeof init === 'function' ? init() : init } })
      return [s.v, function (next) {
        const val = typeof next === 'function' ? next(s.v) : next
        if (val === s.v) return
        s.v = val
        dirty = true
        if (!rendering) schedule()
      }]
    },
    useRef: function (init) {
      const i = current.cursor++
      return slot(i, function () { return { kind: 'ref', ref: { current: init === undefined ? null : init } } }).ref
    },
    useMemo: function (fn, deps) {
      const i = current.cursor++
      const prev = current.hooks[i]
      if (prev !== undefined && prev.kind === 'memo' && sameDeps(prev.deps, deps)) return prev.value
      const value = fn()
      current.hooks[i] = { kind: 'memo', deps: deps, value: value }
      return value
    },
    useCallback: function (fn, deps) {
      const i = current.cursor++
      const prev = current.hooks[i]
      if (prev !== undefined && prev.kind === 'memo' && sameDeps(prev.deps, deps)) return prev.value
      current.hooks[i] = { kind: 'memo', deps: deps, value: fn }
      return fn
    },
    useEffect: function (fn, deps) {
      const i = current.cursor++
      const prev = current.hooks[i]
      const first = prev === undefined || prev.kind !== 'effect'
      const changed = first || deps === undefined || prev.deps === undefined ||
        deps.length !== prev.deps.length || deps.some(function (d, k) { return d !== prev.deps[k] })
      const s = first ? { kind: 'effect', deps: deps, cleanup: undefined } : prev
      s.deps = deps
      current.hooks[i] = s
      if (changed) {
        effects.push(function () {
          if (typeof s.cleanup === 'function') s.cleanup()
          const c = fn()
          s.cleanup = typeof c === 'function' ? c : undefined
        })
      }
    }
  }

  function renderComp(fn, props, path) {
    const s = store(path)
    const prev = current
    current = s
    s.cursor = 0
    let out
    try { out = fn(props) } finally { current = prev }
    return out
  }

  // 提交阶段的 ref 处理:宿主节点的 ref 会被真的调用/赋值,这样插件里
  // 「(searchRef.current).focus()」「dayRef.current.scrollIntoView()」「tabRefs.current[id].focus()」
  // 三条路径都能被断到,而不是被垫片静默跳过。
  // 节点按渲染路径复用(真实 DOM 节点在重渲染之间是同一个对象),否则同一格每次渲染都换新
  // 对象,测试对节点的修改(ref.current.getBoundingClientRect = …)会在下一帧凭空消失。
  const nodes = new Map()
  function makeNode(type) {
    return {
      __type: type,
      style: {},
      focus: function () { calls.focus++ },
      scrollIntoView: function (opts) { calls.scroll++; calls.lastScroll = opts || null },
      setAttribute: function () {},
      appendChild: function () {},
      removeChild: function () {}
    }
  }
  function nodeAt(path, type) {
    let n = nodes.get(path)
    if (n === undefined || n.__type !== type) {
      n = makeNode(type)
      nodes.set(path, n)
    }
    return n
  }

  function expand(node, path) {
    if (node === null || node === undefined || typeof node !== 'object') return node
    if (typeof node.type === 'function') return expand(renderComp(node.type, node.props, path), path)
    const kids = node.props.children || []
    const next = []
    for (let i = 0; i < kids.length; i++) {
      const k = kids[i]
      next.push(typeof k === 'string' || typeof k === 'number' ? String(k) : expand(k, path + '/' + i))
    }
    const out = { type: node.type, props: Object.assign({}, node.props, { children: next }) }
    const ref = node.props.ref
    if (typeof ref === 'function') ref(nodeAt(path, node.type))
    else if (ref !== null && ref !== undefined && typeof ref === 'object') ref.current = nodeAt(path, node.type)
    return out
  }

  function pass() {
    effects = []
    rendering = true
    let raw
    try { raw = renderComp(rootFn, {}, 'root') } finally { rendering = false }
    const out = expand(raw, 'root')
    const q = effects
    effects = []
    for (let i = 0; i < q.length; i++) q[i]()
    return out
  }
  function schedule() {
    if (scheduled) return
    scheduled = true
    queueMicrotask(function () { scheduled = false; flush() })
  }
  function flush() {
    let guard = 0
    do {
      dirty = false
      tree = pass()
      guard++
    } while (dirty && guard < 50)
    return tree
  }

  // 卸载:跑掉所有 effect 的 cleanup 并清空 hook 槽,用来验证「离开页面时监听/定时器被收走」。
  function unmount() {
    stores.forEach(function (s) {
      s.hooks.forEach(function (h) {
        if (h !== null && h !== undefined && h.kind === 'effect' && typeof h.cleanup === 'function') h.cleanup()
      })
      s.hooks.length = 0
    })
    stores.clear()
    nodes.clear()
    tree = null
    rootFn = null
  }

  return {
    React: React,
    mount: function (fn) { rootFn = fn; return flush() },
    flush: flush,
    tree: function () { return tree },
    calls: calls,
    unmount: unmount,
    stores: stores
  }
}

// ---------------------------------------------------------------- 渲染树工具
function flat(node, out) {
  out = out || []
  if (node === null || node === undefined || typeof node !== 'object') return out
  out.push(node)
  const ch = node.props && node.props.children ? node.props.children : []
  for (let i = 0; i < ch.length; i++) {
    const c = ch[i]
    if (typeof c === 'string' || typeof c === 'number') out.push({ type: '#text', text: String(c), props: { children: [] } })
    else flat(c, out)
  }
  return out
}
function cls(n) { return (n.props && n.props.className) || '' }
function byClass(node, part) {
  // 按 class token 精确匹配:否则 'lts-card' 会连 'lts-cards' 网格一起算进来
  return flat(node).filter(function (n) {
    if (typeof n.type !== 'string') return false
    const c = cls(n)
    return c !== '' && c.split(/\s+/).indexOf(part) !== -1
  })
}
function textOf(node) {
  let s = ''
  flat(node).forEach(function (n) { if (n.type === '#text') s += n.text + ' ' })
  return s.replace(/\s+/g, ' ').trim()
}
function findAll(node, pred) { return flat(node).filter(pred) }
function buttonByText(node, label) { return findAll(node, function (n) { return n.type === 'button' && textOf(n) === label })[0] }
function tabsOf(node) { return findAll(byClass(node, 'lts-tabs')[0], function (n) { return n.type === 'button' }) }

// ---------------------------------------------------------------- 环境桩
function makeWindow() {
  const timers = []
  const listeners = {}
  const win = {
    innerWidth: 1440,
    innerHeight: 900,
    __ModuleLoader__: { load: function (m) { win.__module = m } },
    setTimeout: function (cb, ms) { timers.push({ cb: cb, ms: ms || 0 }); return timers.length },
    clearTimeout: function () {},
    setInterval: function () { return 1 },
    clearInterval: function () {},
    // reduced 可在测试里翻转,用来验证 prefers-reduced-motion 分支真的被走到
    reduced: false,
    matchMedia: function () { return { matches: win.reduced === true } },
    addEventListener: function (name, fn) { listeners[name] = fn },
    removeEventListener: function (name) { delete listeners[name] },
    runTimers: function (maxMs) {
      // 真实 setTimeout 只触发一次,所以取出的定时器要从队列里摘掉
      const due = []
      for (let i = timers.length - 1; i >= 0; i--) if (timers[i].ms <= maxMs) due.unshift(timers.splice(i, 1)[0])
      due.forEach(function (t) { t.cb() })
      return due.length
    },
    timerDelays: function () { return timers.map(function (t) { return t.ms }) },
    key: function (k, target, mods) {
      listeners.keydown(Object.assign({ key: k, target: target || null, preventDefault: function () {} }, mods || {}))
    },
    hasKeyHandler: function () { return typeof listeners.keydown === 'function' }
  }
  return win
}
function makeDocument(captured) {
  return {
    createElement: function (tag) {
      const el = { tagName: String(tag).toUpperCase(), style: {}, attrs: {}, children: [] }
      el.setAttribute = function (k, v) { el.attrs[k] = v }
      el.appendChild = function (c) { el.children.push(c) }
      el.removeChild = function () {}
      el.click = function () { el.clicked = true }
      return el
    },
    head: { appendChild: function (el) { captured.css = el.textContent } },
    body: { appendChild: function () {} }
  }
}

function loadClient(win, doc) {
  const rt = makeRuntime()
  globalThis.window = win
  globalThis.document = doc
  const req = function (name) {
    if (name === 'react') return rt.React
    throw new Error('unexpected require: ' + name)
  }
  new Function('window', 'document', 'require', SRC)(win, doc, req)
  const mod = win.__module.factory(req)
  const registered = {}
  mod.apply({
    slots: {
      inject: function (name, cb) { if (typeof cb === 'function') cb() },
      register: function (opts, fn) { registered[opts.name] = fn }
    },
    effect: function (fn) { const d = fn(); return function () { if (typeof d === 'function') d() } }
  })
  assert.ok(registered.main, 'main slot must be registered')
  assert.ok(registered['sidebar.panellist'], 'sidebar.panellist must be registered')
  return { rt: rt, registered: registered, mod: mod }
}

// ---------------------------------------------------------------- 假数据
const DAY = 86400000
function dayStr(offset) {
  const d = new Date(Date.now() + offset * DAY)
  const p = function (n) { return (n < 10 ? '0' : '') + n }
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
}
function payload(opts) {
  opts = opts || {}
  const agents = opts.agents || ['dsh', 'opencode', 'claude-code']
  const rows = []
  for (let i = 0; i < 120; i++) {
    rows.push({
      a: agents[i % agents.length],
      p: 'p1', v: i % 2 === 0 ? 'deepseek' : 'moonshot',
      m: 'model-' + (i % 5), d: dayStr(-(i % 30)),
      n: 1 + (i % 7), i: 1000 + i, o: 200 + i, r: 50, cr: 500 + i, cw: 100,
      tt: 0, c: 0.01 * i, ec: 0.02 * i
    })
  }
  return {
    generatedAt: Date.now() - 5 * 60000,
    scanning: opts.scanning === true,
    currency: { display: 'USD', symbol: '$', unit: 'USD', reported: 'USD', fx: 0, fxMissing: false },
    sources: [
      { id: 'dsh', label: 'DSH', status: 'ok', detail: 'ok', lastActivityAt: Date.now(), fileMtimeMs: Date.now(), drift: false, error: null },
      { id: 'cursor', label: 'Cursor', status: 'missing', detail: 'n/a', lastActivityAt: 0, fileMtimeMs: 0, drift: false, error: null }
    ],
    rows: rows,
    projects: [{ a: 'dsh', name: '/Users/x/proj/a', n: 10, total: 1000, lastAt: Date.now() }],
    budget: { config: { dailyTokens: 0, monthlyTokens: 0, dailyCost: 0, monthlyCost: 0 }, use: { dayTokens: 0, dayCost: 0, monthTokens: 0, monthCost: 0 } },
    ledger: { path: '~/.agent-token-stats/ledger.json', savedAt: Date.now(), persisted: true, error: null }
  }
}
function makeFetch(payloadObj, capture) {
  return function (url) {
    capture.push(String(url))
    let body = {}
    if (String(url).indexOf('/agent-token-stats/data') === 0) body = payloadObj
    else if (String(url).indexOf('/agent-token-stats/sessions') === 0) body = { sessions: [{ id: 's1', title: 't', project: '/Users/x/p', model: 'm', n: 3, i: 1, o: 1, r: 0, cr: 0, cw: 0, tt: 0, c: 0, updatedAt: Date.now() }] }
    else if (String(url).indexOf('/agent-token-stats/export') === 0) body = { path: '~/.agent-token-stats/export-x.csv', rows: 12 }
    else if (String(url).indexOf('/agent-token-stats/report') === 0) body = { markdown: '# r', filename: 'token-report-week.md' }
    else if (String(url).indexOf('/agent-token-stats/quota') === 0) body = { quotas: [] }
    return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve(body) } })
  }
}
async function settle(rt) {
  for (let i = 0; i < 10; i++) {
    await new Promise(function (r) { setTimeout(r, 0) })
    rt.flush()
  }
  return rt.tree()
}

// ---------------------------------------------------------------- 断言
let passed = 0
function ok(name, fn) { fn(); passed++; console.log('  ✓ ' + name) }

async function main() {
  console.log('client UX regression')

  // ============ CSS 守卫 ============
  const captured = {}
  const boot = loadClient(makeWindow(), makeDocument(captured))
  ok('样式表已注入', function () {
    assert.ok(typeof captured.css === 'string' && captured.css.length > 2000, 'stylesheet captured')
  })
  ok('CSS 只引用随 dsh 发布的主题 token', function () {
    const used = {}
    ;(captured.css.match(/--dsw-[a-z0-9-]+/g) || []).forEach(function (t) { used[t] = true })
    // 允许清单 = 在随 dsh 一起发布的 UI 包里 grep 到的 token 名。
    const allowed = [
      '--dsw-alias-bg-base', '--dsw-alias-bg-layer-1', '--dsw-alias-bg-layer-2', '--dsw-alias-bg-skeleton',
      '--dsw-alias-border-l1', '--dsw-alias-border-l2', '--dsw-alias-brand-primary',
      '--dsw-alias-label-primary', '--dsw-alias-label-secondary',
      '--dsw-alias-state-error-primary', '--dsw-alias-state-success-primary', '--dsw-alias-state-warn-primary'
    ]
    const unknown = Object.keys(used).filter(function (t) { return allowed.indexOf(t) === -1 })
    assert.deepEqual(unknown, [], 'unknown tokens: ' + unknown.join(', '))
  })
  ok('焦点环 / reduced-motion / 窄屏断点 / 骨架 / toast 样式都在', function () {
    assert.ok(captured.css.indexOf(':focus-visible') !== -1, 'focus-visible rule')
    assert.ok(captured.css.indexOf('prefers-reduced-motion') !== -1, 'reduced motion rule')
    assert.ok(captured.css.indexOf('max-width: 640px') !== -1, 'narrow breakpoint')
    assert.ok(captured.css.indexOf('--lts-pad-x') !== -1, 'one padding variable drives root + sticky toolbar')
    assert.ok(captured.css.indexOf('.lts-toast{') !== -1, 'toast style')
    assert.ok(captured.css.indexOf('.lts-sk{') !== -1, 'skeleton style')
    assert.ok(captured.css.indexOf(':disabled') !== -1, 'disabled chip style')
  })

  // ============ 首屏骨架 ============
  {
    const win = makeWindow()
    const env = loadClient(win, makeDocument({}))
    globalThis.fetch = function () { return new Promise(function () {}) } // 永不返回:停在首屏
    const t = env.rt.mount(env.registered.main)
    ok('首屏渲染骨架,而不是空白里一行「正在加载」', function () {
      assert.ok(byClass(t, 'lts-sk').length > 10, 'skeleton blocks: ' + byClass(t, 'lts-sk').length)
      assert.equal(byClass(t, 'lts-skeleton').length, 1, 'one skeleton wrapper')
      assert.ok(textOf(t).indexOf('正在加载看板') !== -1, 'loading copy')
      assert.ok(textOf(t).indexOf('首次加载') !== -1, 'keeps the 10~30s expectation')
      assert.equal(byClass(t, 'lts-empty-panel').length, 0, 'no empty-state card while loading')
      assert.equal(byClass(t, 'lts-card').length, 0, 'no fake metric cards')
    })
  }

  // ============ 正常渲染 ============
  const fetchCalls = []
  const win2 = makeWindow()
  const env2 = loadClient(win2, makeDocument({}))
  globalThis.fetch = makeFetch(payload(), fetchCalls)
  env2.rt.mount(env2.registered.main)
  let tree = await settle(env2.rt)

  ok('数据到达后渲染真实看板', function () {
    assert.equal(byClass(tree, 'lts-sk').length, 0, 'skeleton gone')
    assert.ok(byClass(tree, 'lts-card').length >= 8, 'metric cards: ' + byClass(tree, 'lts-card').length)
  })
  ok('meta 行改用相对时间,绝对时间留在 title', function () {
    const meta = byClass(tree, 'lts-meta')[0]
    const txt = textOf(meta)
    assert.ok(txt.indexOf('更新于') !== -1 && txt.indexOf('5 分钟前') !== -1, 'relative freshness: ' + txt.slice(0, 90))
    assert.ok(findAll(meta, function (n) { return typeof (n.props.title || '') === 'string' && (n.props.title || '').indexOf('更新于') !== -1 }).length === 1, 'absolute time in tooltip')
  })
  ok('tab 有 tablist/tab 语义、aria-selected、roving tabindex 与 tabpanel 关联', function () {
    const tabs = tabsOf(tree)
    assert.equal(byClass(tree, 'lts-tabs')[0].props.role, 'tablist', 'role=tablist')
    assert.equal(tabs.length, 6, 'six tabs')
    tabs.forEach(function (t) { assert.equal(t.props.role, 'tab', 'role=tab') })
    assert.equal(tabs.filter(function (t) { return t.props['aria-selected'] === 'true' }).length, 1, 'exactly one selected')
    assert.equal(tabs.filter(function (t) { return t.props.tabIndex === 0 }).length, 1, 'one tab in the tab order')
    // 每个 tab 必须指向真实存在的 tabpanel(此前的 aria-controls 是悬空的)
    const panels = findAll(tree, function (n) { return n.props && n.props.role === 'tabpanel' })
    assert.equal(panels.length, 1, 'exactly one tabpanel rendered')
    const selected = tabs.filter(function (t) { return t.props['aria-selected'] === 'true' })[0]
    assert.equal(panels[0].props.id, selected.props['aria-controls'], 'panel id matches the selected tab aria-controls')
    assert.equal(panels[0].props['aria-labelledby'], selected.props.id, 'panel points back at its tab')
    assert.equal(selected.props.id, 'lts-tab-overview', 'stable ids')
  })
  ok('键盘监听已挂上(Esc / 「/」)', function () {
    assert.ok(win2.hasKeyHandler(), 'keydown listener registered')
  })

  // ============ 导出 → 轻提示 ============
  const exportBtn = buttonByText(tree, '导出 CSV')
  ok('导出按钮存在,反馈不进页头', function () {
    assert.ok(exportBtn, 'export button')
    exportBtn.props.onClick({})
    env2.rt.flush()
    const header = byClass(env2.rt.tree(), 'lts-header')[0]
    assert.equal(textOf(header).indexOf('已导出'), -1, 'header carries no export copy (the feedback lives in the toast)')
  })
  tree = await settle(env2.rt)
  ok('导出结果出现在右下角 toast(带 Esc 提示与关闭按钮)', function () {
    const toast = byClass(tree, 'lts-toast')[0]
    assert.ok(toast, 'toast rendered')
    assert.equal(byClass(toast, 'lts-toast-main')[0].props.role, 'status', 'announced as a live status region')
    assert.ok(textOf(toast).indexOf('已导出') !== -1, 'success copy: ' + textOf(toast).slice(0, 80))
    assert.ok(textOf(toast).indexOf('Esc') !== -1, 'Esc hint')
    assert.equal(findAll(toast, function (n) { return n.type === 'button' }).length, 1, 'dismiss button')
  })
  ok('Esc 第一优先收起 toast', function () {
    win2.key('Escape')
    env2.rt.flush()
    assert.equal(byClass(env2.rt.tree(), 'lts-toast').length, 0, 'toast dismissed')
  })

  // ============ 搜索快捷键 ============
  ok('「/」聚焦搜索框(证明 ref 真的被提交阶段挂上)', function () {
    const input = byClass(env2.rt.tree(), 'lts-search-input')[0]
    assert.ok(input, 'search input')
    assert.ok(input.props['aria-label'], 'aria-label present')
    const before = env2.rt.calls.focus
    win2.key('/')
    assert.equal(env2.rt.calls.focus, before + 1, 'slash focuses the search box')
  })
  ok('Esc 在搜索框内清空查询;在别的输入框上不越权清筛选', function () {
    const input = byClass(env2.rt.tree(), 'lts-search-input')[0]
    input.props.onChange({ target: { value: 'qwen' } })
    env2.rt.flush()
    assert.equal(byClass(env2.rt.tree(), 'lts-search-input')[0].props.value, 'qwen', 'typing updates the query')
    assert.ok(byClass(env2.rt.tree(), 'lts-fchip').length >= 1, 'active-filter chip appears')
    // 焦点不在搜索框(比如自动刷新勾选框)时,Esc 不许动模型筛选
    win2.key('Escape', { tagName: 'INPUT', type: 'checkbox' })
    env2.rt.flush()
    assert.equal(byClass(env2.rt.tree(), 'lts-search-input')[0].props.value, 'qwen', 'foreign input must not clear the model filter')
    // 焦点在搜索框内才清空
    win2.key('Escape', input.props.ref.current)
    env2.rt.flush()
    assert.equal(byClass(env2.rt.tree(), 'lts-search-input')[0].props.value, '', 'Esc clears the query when the search box itself is focused')
  })
  ok('Esc 在别的输入框上仍然能关当日明细,且不动筛选', function () {
    // 复现审查提出的场景:焦点在自动刷新勾选框上按 Esc
    tabsOf(env2.rt.tree())[1].props.onClick()
    env2.rt.flush()
    byClass(env2.rt.tree(), 'lts-heat-click')[0].props.onClick()
    env2.rt.flush()
    assert.ok(byClass(env2.rt.tree(), 'lts-daysel')[0], 'day detail open')
    // 打开明细之后再设筛选(反过来的话视图会空,热力图就不在了)
    byClass(env2.rt.tree(), 'lts-search-input')[0].props.onChange({ target: { value: 'qwen' } })
    env2.rt.flush()
    win2.key('Escape', { tagName: 'INPUT', type: 'checkbox' })
    env2.rt.flush()
    assert.equal(byClass(env2.rt.tree(), 'lts-daysel').length, 0, 'day detail closed even with a foreign input focused')
    assert.equal(byClass(env2.rt.tree(), 'lts-search-input')[0].props.value, 'qwen', 'and the filter was left alone')
    // 收尾:清掉筛选,别影响后面的用例
    byClass(env2.rt.tree(), 'lts-search-input')[0].props.onChange({ target: { value: '' } })
    env2.rt.flush()
  })
  ok('Esc 在别的「文本」输入框上完全不越权(既不关明细也不清筛选)', function () {
    tabsOf(env2.rt.tree())[1].props.onClick()
    env2.rt.flush()
    byClass(env2.rt.tree(), 'lts-heat-click')[0].props.onClick()
    env2.rt.flush()
    byClass(env2.rt.tree(), 'lts-search-input')[0].props.onChange({ target: { value: 'qwen' } })
    env2.rt.flush()
    assert.ok(byClass(env2.rt.tree(), 'lts-daysel')[0], 'day detail open')
    win2.key('Escape', { tagName: 'TEXTAREA' })
    env2.rt.flush()
    assert.ok(byClass(env2.rt.tree(), 'lts-daysel')[0], 'Esc belongs to the focused text field — the panel must not react')
    assert.equal(byClass(env2.rt.tree(), 'lts-search-input')[0].props.value, 'qwen', 'and the filter is untouched too')
    byClass(env2.rt.tree(), 'lts-search-input')[0].props.onChange({ target: { value: '' } })
    env2.rt.flush()
  })
  ok('Cmd/Ctrl+/ 不被劫持', function () {
    const before = env2.rt.calls.focus
    win2.key('/', { tagName: 'BODY' }, { metaKey: true })
    win2.key('/', { tagName: 'BODY' }, { ctrlKey: true })
    assert.equal(env2.rt.calls.focus, before, 'browser shortcuts keep working')
    win2.key('/', { tagName: 'BODY' })
    assert.equal(env2.rt.calls.focus, before + 1, 'plain slash still focuses')
  })

  // ============ 筛选器适用范围 ============
  ok('「数据源」页:筛选器换成说明 + 清空入口,不留按了没反应的控件', function () {
    tabsOf(env2.rt.tree())[5].props.onClick()
    env2.rt.flush()
    const t = env2.rt.tree()
    assert.ok(textOf(t).indexOf('筛选不适用于当前页') !== -1, 'explicit note')
    assert.equal(byClass(t, 'lts-select').length, 0, 'vendor select hidden')
    assert.equal(byClass(t, 'lts-search-input').length, 0, 'model search hidden')
    assert.ok(byClass(t, 'lts-src').length >= 1, 'sources still rendered')
  })
  ok('「会话」页:同样让位,并保留自己的来源选择', function () {
    tabsOf(env2.rt.tree())[4].props.onClick()
    env2.rt.flush()
    const t = env2.rt.tree()
    assert.ok(textOf(t).indexOf('筛选不适用于当前页') !== -1, 'note on sessions tab')
    const chips = byClass(t, 'lts-chip')
    assert.ok(chips.length >= 3, 'session source chips present: ' + chips.length)
  })
  ok('方向键切换页签并把焦点真的移到新页签', function () {
    const tabs = tabsOf(env2.rt.tree())
    const before = env2.rt.calls.focus
    tabs[4].props.onKeyDown({ key: 'ArrowRight', preventDefault: function () {}, target: {} })
    env2.rt.flush()
    const after = tabsOf(env2.rt.tree())
    assert.equal(after[5].props['aria-selected'], 'true', 'ArrowRight moves the selection')
    assert.equal(after.length, 6, 'tab set intact')
    assert.equal(env2.rt.calls.focus, before + 1, 'focus followed the selection (roving tabindex)')
    assert.equal(after[5].props.tabIndex, 0, 'new tab is the one in the tab order')
    assert.equal(after[4].props.tabIndex, -1, 'old tab left the tab order')
  })

  // ============ 当日下钻 ============
  const closeDay = function () {
    const sec = byClass(env2.rt.tree(), 'lts-daysel')[0]
    if (sec) { buttonByText(sec, '✕ 关闭').props.onClick(); env2.rt.flush() }
  }
  ok('热力图下钻:细节区披露「显示前 N / 共 M」并可展开', function () {
    tabsOf(env2.rt.tree())[1].props.onClick() // 趋势
    env2.rt.flush()
    const heat = byClass(env2.rt.tree(), 'lts-heat-click')
    assert.ok(heat.length > 0, 'heatmap cells clickable')
    heat[0].props.onClick()
    env2.rt.flush()
    const t = env2.rt.tree()
    const section = byClass(t, 'lts-daysel')[0]
    assert.ok(section, 'day detail section')
    assert.ok(section.props.ref !== null && section.props.ref !== undefined, 'carries the scroll ref')
    const txt = textOf(section)
    assert.ok(txt.indexOf('显示前') !== -1, 'truncation disclosed: ' + txt.slice(0, 100))
    assert.ok(txt.indexOf('共') !== -1, 'total disclosed')
    assert.ok(buttonByText(section, '✕ 关闭'), 'close button')
  })
  ok('下钻后把细节区滚进视野:普通用 smooth,reduced-motion 用 auto', function () {
    win2.runTimers(0) // 排掉上一条用例留下的滚动定时器,保证只数这一次
    const before = env2.rt.calls.scroll
    const reopen = function () {
      byClass(env2.rt.tree(), 'lts-heat-click')[0].props.onClick()
      env2.rt.flush()
      win2.runTimers(0)
    }
    closeDay()
    reopen()
    assert.equal(env2.rt.calls.scroll, before + 1, 'scrollIntoView called exactly once per drill-down')
    assert.equal(env2.rt.calls.lastScroll.behavior, 'smooth', 'smooth by default')
    // 翻转 reduced-motion 后必须退化成瞬时滚动
    win2.reduced = true
    closeDay()
    reopen()
    assert.equal(env2.rt.calls.lastScroll.behavior, 'auto', 'reduced motion skips the smooth scroll')
    win2.reduced = false
  })
  ok('滚动偏移按吸顶工具条的实测高度算,而不是写死(窄屏换行会更高)', function () {
    closeDay()
    // 让工具条「长高」到 168px:此时滚动偏移必须是 150px,而不是 CSS 里写死的 130/112
    const bar = byClass(env2.rt.tree(), 'lts-toolbar')[0].props.ref.current
    assert.ok(bar, 'toolbar ref is wired up')
    bar.getBoundingClientRect = function () { return { height: 168 } }
    byClass(env2.rt.tree(), 'lts-heat-click')[0].props.onClick()
    env2.rt.flush()
    win2.runTimers(0)
    const sec = byClass(env2.rt.tree(), 'lts-daysel')[0]
    assert.equal(sec.props.ref.current.style.scrollMarginTop, '150px', 'offset = measured height - 18 (sticky top:-18px)')
    // 工具条变矮(宽屏不换行)时偏移必须跟着变小
    bar.getBoundingClientRect = function () { return { height: 96 } }
    closeDay()
    byClass(env2.rt.tree(), 'lts-heat-click')[0].props.onClick()
    env2.rt.flush()
    win2.runTimers(0)
    assert.equal(byClass(env2.rt.tree(), 'lts-daysel')[0].props.ref.current.style.scrollMarginTop, '78px', 'offset follows the measured height')
  })
  // 专门造一天 80 个模型的台账:这时截断按钮必须出现,且点击后行数变多
  {
    const win = makeWindow()
    const env = loadClient(win, makeDocument({}))
    const p = payload()
    const day = dayStr(0)
    p.rows = []
    for (let i = 0; i < 80; i++) {
      p.rows.push({ a: 'dsh', p: 'p1', v: 'deepseek', m: 'model-' + i, d: day, n: 1, i: 100, o: 10, r: 0, cr: 0, cw: 0, tt: 0, c: 0, ec: 0 })
    }
    globalThis.fetch = makeFetch(p, [])
    env.rt.mount(env.registered.main)
    const t0 = await settle(env.rt)
    tabsOf(t0)[1].props.onClick() // 热力图在趋势页
    env.rt.flush()
    const heat = byClass(env.rt.tree(), 'lts-heat-click')
    assert.ok(heat.length > 0, 'heatmap cells available for the day fixture')
    heat[heat.length - 1].props.onClick()
    env.rt.flush()

    ok('当日记录超过 60 条:披露真实总数,「展开全部」放出全部', function () {
      const section = byClass(env.rt.tree(), 'lts-daysel')[0]
      const rowCount = function (n) {
        return findAll(byClass(n, 'lts-table-scroll')[0], function (x) { return x.type === 'tr' }).length
      }
      const before = rowCount(section)
      assert.ok(textOf(section).indexOf('显示前 60') !== -1, 'says it shows the first 60: ' + textOf(section).slice(0, 60))
      assert.ok(textOf(section).indexOf('共 80') !== -1, 'says the true total is 80')
      const more = findAll(section, function (x) { return x.type === 'button' && cls(x).indexOf('lts-daymore') !== -1 })[0]
      assert.ok(more, 'show-all button present')
      assert.ok(textOf(more).indexOf('80') !== -1, 'button states how many rows it reveals: ' + textOf(more))
      more.props.onClick()
      env.rt.flush()
      const after = rowCount(byClass(env.rt.tree(), 'lts-daysel')[0])
      assert.ok(after > before, 'more rows after expanding: ' + before + ' -> ' + after)
    })
  }

  // opencode 有数据(会被自动选中);用户改点 CodeWhale 后必须停在他的选择上
  {
    const win = makeWindow()
    const env = loadClient(win, makeDocument({}))
    const calls = []
    globalThis.fetch = makeFetch(payload({ agents: ['opencode'] }), calls)
    env.rt.mount(env.registered.main)
    await settle(env.rt)
    tabsOf(env.rt.tree())[4].props.onClick()
    env.rt.flush()
    const chips = findAll(byClass(env.rt.tree(), 'lts-section')[0], function (n) { return n.type === 'button' && cls(n).indexOf('lts-chip') !== -1 })

    ok('用户手点会话来源后,自动默认不再覆盖他的选择', function () {
      const pick = chips.filter(function (c) { return textOf(c) === 'CodeWhale' })[0]
      assert.ok(pick, 'CodeWhale chip present')
      pick.props.onClick()
      env.rt.flush()
      const after = findAll(byClass(env.rt.tree(), 'lts-section')[0], function (n) { return n.type === 'button' && cls(n).indexOf('lts-chip') !== -1 })
        .filter(function (c) { return textOf(c) === 'CodeWhale' })[0]
      assert.equal(after.props.className.indexOf('lts-chip-on') !== -1, true, 'CodeWhale is now the selected source')
      assert.equal(after.props.title, '该来源暂无会话数据', 'a data-less source still explains itself on hover')
    })
  }

  ok('当日明细可用按钮关闭', function () {
    buttonByText(byClass(env2.rt.tree(), 'lts-daysel')[0], '✕ 关闭').props.onClick()
    env2.rt.flush()
    assert.equal(byClass(env2.rt.tree(), 'lts-daysel').length, 0, 'closed')
  })
  ok('Esc 也能关闭当日明细(无输入框聚焦时)', function () {
    const heat = byClass(env2.rt.tree(), 'lts-heat-click')
    heat[0].props.onClick()
    env2.rt.flush()
    assert.ok(byClass(env2.rt.tree(), 'lts-daysel')[0], 'open again')
    win2.key('Escape')
    env2.rt.flush()
    assert.equal(byClass(env2.rt.tree(), 'lts-daysel').length, 0, 'Esc closed it')
  })

  // ============ 空状态 ============
  ok('筛选到空:只给一屏可操作说明,不再各分区重复「暂无数据」', function () {
    const input = byClass(env2.rt.tree(), 'lts-search-input')[0]
    input.props.onChange({ target: { value: 'no-such-model-xyz' } })
    env2.rt.flush()
    const t = env2.rt.tree()
    assert.equal(byClass(t, 'lts-empty-panel').length, 1, 'exactly one empty panel')
    assert.ok(textOf(t).indexOf('当前筛选范围内没有数据') !== -1, 'explains what happened')
    assert.ok(buttonByText(t, '清空筛选'), 'offers clear-filters')
    assert.ok(buttonByText(t, '切到「全部时间」'), 'offers switch-to-all-time')
    assert.equal(byClass(t, 'lts-card').length, 0, 'no all-zero cards behind it')
    buttonByText(t, '清空筛选').props.onClick()
    env2.rt.flush()
    assert.equal(byClass(env2.rt.tree(), 'lts-empty-panel').length, 0, 'clearing filters restores the board')
  })
  ok('筛选到空时「数据源」页仍然可达(排查入口不能被空状态顶掉)', function () {
    const input = byClass(env2.rt.tree(), 'lts-search-input')[0]
    input.props.onChange({ target: { value: 'no-such-model-xyz' } })
    env2.rt.flush()
    assert.equal(byClass(env2.rt.tree(), 'lts-empty-panel').length, 1, 'empty panel on the metrics tab')
    tabsOf(env2.rt.tree())[5].props.onClick()
    env2.rt.flush()
    const t = env2.rt.tree()
    assert.equal(byClass(t, 'lts-empty-panel').length, 0, 'no empty panel on the sources tab')
    assert.ok(byClass(t, 'lts-src').length >= 1, 'source diagnostics still visible')
    tabsOf(t)[0].props.onClick()
    env2.rt.flush()
    const back = byClass(env2.rt.tree(), 'lts-search-input')[0]
    back.props.onChange({ target: { value: '' } })
    env2.rt.flush()
  })

  // ============ 扫描状态条 ============
  {
    const win = makeWindow()
    const env = loadClient(win, makeDocument({}))
    globalThis.fetch = makeFetch(payload({ scanning: true }), [])
    env.rt.mount(env.registered.main)
    const t = await settle(env.rt)
    ok('后台扫描时给出状态条:说明先看台账快照', function () {
      const strip = byClass(t, 'lts-status')[0]
      assert.ok(strip, 'status strip')
      assert.equal(strip.props.role, 'status', 'role=status')
      assert.ok(textOf(strip).indexOf('后台扫描中') !== -1, 'states the scan')
      assert.ok(textOf(strip).indexOf('台账快照') !== -1, 'explains the snapshot')
      assert.equal(byClass(t, 'lts-pulse').length, 1, 'pulsing indicator')
    })
    ok('扫描状态只出现在状态条里,meta 行不重复', function () {
      const meta = byClass(t, 'lts-meta')[0]
      assert.equal(textOf(meta).indexOf('后台扫描中'), -1, 'meta carries no scan copy')
      assert.equal(byClass(meta, 'lts-status').length, 0, 'the strip is not nested inside the meta line')
      assert.equal(byClass(t, 'lts-status').length, 1, 'exactly one scan strip in the tree')
    })
  }

  // ============ 静默通道不得干扰手动刷新 ============
  {
    const win = makeWindow()
    const env = loadClient(win, makeDocument({}))
    const pending = []
    globalThis.fetch = function () {
      return new Promise(function (resolve, reject) {
        pending.push({ resolve: resolve, reject: reject })
      })
    }
    const respond = function (i, body) {
      pending[i].resolve({ ok: true, status: 200, json: function () { return Promise.resolve(body) } })
    }
    env.rt.mount(env.registered.main)
    assert.equal(pending.length, 1, 'initial load is in flight')
    respond(0, payload({ scanning: true }))
    await settle(env.rt)

    ok('扫描中会安排静默轮询', function () {
      assert.ok(win.timerDelays().indexOf(5000) !== -1, 'a 5s quiet poll is scheduled while scanning')
    })

    win.runTimers(5000)
    env.rt.flush()
    ok('手动刷新进入忙碌态且按钮禁用', function () {
      assert.ok(buttonByText(env.rt.tree(), '立即刷新'), 'idle label before clicking')
      buttonByText(env.rt.tree(), '立即刷新').props.onClick({})
      env.rt.flush()
      const busy = buttonByText(env.rt.tree(), '刷新中…')
      assert.ok(busy, 'busy label while refreshing')
      assert.equal(busy.props.disabled, true, 'button disabled while refreshing')
    })
    assert.equal(pending.length, 3, 'quiet poll + manual refresh both in flight')
    respond(1, payload({ scanning: true })) // 静默那条先回来
    await settle(env.rt)
    const stillBusy = buttonByText(env.rt.tree(), '刷新中…')
    ok('静默轮询返回时不许抹掉手动刷新的忙碌态', function () {
      assert.ok(stillBusy, 'still busy after the quiet response landed')
      assert.equal(stillBusy.props.disabled, true, 'still disabled')
    })

    respond(2, payload({ scanning: true }))
    await settle(env.rt)
    ok('手动刷新返回后恢复,并按需继续轮询', function () {
      assert.ok(buttonByText(env.rt.tree(), '立即刷新'), 'back to the idle label')
      assert.ok(win.timerDelays().indexOf(5000) !== -1, 'polling continues because the host is still scanning')
    })

    win.runTimers(5000)
    env.rt.flush()
    pending[pending.length - 1].reject(new Error('network down'))
    await settle(env.rt)
    ok('静默轮询失败会退避重试,而不是把状态条永久留在原地', function () {
      assert.ok(win.timerDelays().indexOf(15000) !== -1, 'a bounded 15s retry is scheduled')
      assert.ok(byClass(env.rt.tree(), 'lts-status')[0], 'scan strip is still shown')
    })
  }

  // ============ 会话页默认来源 ============
  {
    const win = makeWindow()
    const env = loadClient(win, makeDocument({}))
    const p = payload({ agents: ['codewhale'] })
    const calls = []
    globalThis.fetch = makeFetch(p, calls)
    env.rt.mount(env.registered.main)
    await settle(env.rt)
    tabsOf(env.rt.tree())[4].props.onClick()
    env.rt.flush()
    await settle(env.rt)
    ok('会话页默认选中「有数据」的来源,而不是写死的 OpenCode', function () {
      const sess = calls.filter(function (u) { return u.indexOf('/agent-token-stats/sessions') === 0 })
      assert.ok(sess.length >= 1, 'sessions fetched')
      assert.ok(sess[sess.length - 1].indexOf('agent=codewhale') !== -1, 'settles on the source with data: ' + sess[sess.length - 1])
    })
  }

  // ============ 侧栏入口 ============
  ok('侧栏面板图标带可访问名与悬浮 title', function () {
    const panel = env2.registered['sidebar.panellist']
    const icon = env2.rt.mount(function () { return panel({ size: 20, active: true }) })
    const svg = flat(icon).filter(function (n) { return n.type === 'svg' })[0]
    assert.ok(svg, 'svg rendered')
    assert.equal(svg.props.role, 'img', 'role=img')
    assert.equal(svg.props['aria-label'], 'Token 用量', 'aria-label')
    // 悬浮提示用 SVG <title> 子元素(属性形式浏览器不保证显示)
    const title = flat(icon).filter(function (n) { return n.type === 'title' })[0]
    assert.ok(title, 'SVG <title> child present')
    assert.equal(textOf(title), 'Token 用量', 'title text')
  })

  // ============ 卸载清理 ============
  {
    const win = makeWindow()
    const env = loadClient(win, makeDocument({}))
    globalThis.fetch = makeFetch(payload(), [])
    env.rt.mount(env.registered.main)
    await settle(env.rt)
    ok('离开页面时收走 window 上的按键监听(effect cleanup 真的执行)', function () {
      assert.ok(win.hasKeyHandler(), 'listener attached while mounted')
      env.rt.unmount()
      assert.equal(win.hasKeyHandler(), false, 'listener removed on unmount')
    })
  }

  // ============ 文案成对 ============
  ok('新增文案中英成对(逐键比对,不只是同一文件里出现两次)', function () {
    const start = SRC.indexOf('const STRINGS = {')
    const end = SRC.indexOf('\n    }', start)
    const block = SRC.slice(start, end)
    const enAt = block.indexOf('\n      en: {')
    assert.ok(enAt !== -1, 'both language blocks exist')
    const keySet = function (s) {
      const out = {}
      ;(s.match(/^\s*'[^']+':/gm) || []).forEach(function (m) { out[m.trim().replace(/:$/, '').replace(/'/g, '')] = true })
      return out
    }
    const Z = keySet(block.slice(0, enAt))
    const E = keySet(block.slice(enAt))
    const zhOnly = Object.keys(Z).filter(function (k) { return !E[k] })
    const enOnly = Object.keys(E).filter(function (k) { return !Z[k] })
    assert.deepEqual(zhOnly, [], 'zh-only keys: ' + zhOnly.join(', '))
    assert.deepEqual(enOnly, [], 'en-only keys: ' + enOnly.join(', '))
    const newKeys = Object.keys(Z).filter(function (k) { return /^k17[5-9]$|^k18[0-9]$|^k19[0-6]$/.test(k) })
    assert.ok(newKeys.length >= 20, 'this UX pass added its keys to both languages: ' + newKeys.length)
  })

  console.log('\nUX OK: ' + passed + ' checks passed (结构级验证,非视觉验证)')
}

await main()
