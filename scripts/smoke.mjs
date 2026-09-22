// Dependency-free smoke test: host ESM exports + client bundle factory + slot registration.
import { readFileSync } from 'node:fs'
import assert from 'node:assert'

const host = await import(new URL('../lib/index.js', import.meta.url))
assert.equal(typeof host.apply, 'function', 'host apply must be a function')
assert.ok(Array.isArray(host.inject) && host.inject.includes('shell') && host.inject.includes('webServer'), 'host inject must include shell + webServer')

const code = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
let loaded = null
const win = { __ModuleLoader__: { load(x) { loaded = x } }, innerWidth: 1440, innerHeight: 900, setInterval: () => 0, clearInterval: () => {} }
const fakeReact = { createElement: () => ({}), useState: v => [v, () => {}], useEffect: () => {}, useCallback: f => f, useMemo: f => { try { return f() } catch { return null } } }
const req = n => { if (n === 'react') return fakeReact; throw new Error('unexpected require: ' + n) }
new Function('window', 'require', code)(win, req)
assert.equal(loaded.id, 'dsh-agent-token-stats', 'bundle id mismatch')
const m = loaded.factory(req)
assert.equal(typeof m.apply, 'function', 'client apply must be a function')
assert.deepEqual(m.inject, ['slots'], 'client inject must be [slots]')
const injected = []
globalThis.document = { createElement: () => ({ setAttribute() {}, style: {}, textContent: '' }), head: { appendChild() {} } }
m.apply({ slots: { inject: n => injected.push(n), register: () => {} }, effect: fn => { try { fn() } catch { /* css effect needs real dom */ } return () => {} } })
assert.ok(injected.includes('main') && injected.includes('sidebar.panellist'), 'both slots must be injected')
console.log('smoke OK: host exports + client factory + slot registration')
