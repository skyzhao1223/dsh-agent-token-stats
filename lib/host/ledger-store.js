import * as fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export function emptyLedger() { return { version: 1, updatedAt: 0, rows: {}, projects: {}, sources: {} } }
export function validateLedger(value) {
  if (!value || value.version !== 1 || !Number.isFinite(value.updatedAt) || value.updatedAt < 0) throw new Error('Invalid ledger version/time')
  for (const name of ['rows', 'projects', 'sources']) {
    if (!value[name] || typeof value[name] !== 'object' || Array.isArray(value[name])) throw new Error('Invalid ledger ' + name)
    for (const row of Object.values(value[name])) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Invalid ledger entry')
      for (const [key, n] of Object.entries(row)) {
        if (typeof n === 'number' && (!Number.isFinite(n) || n < 0)) throw new Error('Invalid ledger numeric field ' + key)
      }
    }
  }
  return value
}

/** Atomic mkdir lock. Never steal an old lock from a live PID. Orphan locks
 * without an owner are left for manual inspection rather than unsafe deletion. */
export class LedgerStore {
  constructor(directory, { lockTimeoutMs = 10000, backupIntervalMs = 3600000, now = Date.now } = {}) {
    this.directory = path.resolve(directory)
    this.file = path.join(this.directory, 'ledger.json')
    this.backup = path.join(this.directory, 'ledger.prev.json')
    this.lock = path.join(this.directory, '.ledger.lock')
    this.lockTimeoutMs = lockTimeoutMs
    this.backupIntervalMs = backupIntervalMs
    this.now = now
  }
  async read() {
    let original
    try { return { ledger: validateLedger(JSON.parse(await fs.readFile(this.file, 'utf8'))), recovered: false } }
    catch (error) {
      if (error.code === 'ENOENT') {
        try { return { ledger: validateLedger(JSON.parse(await fs.readFile(this.backup, 'utf8'))), recovered: true, missingPrimary: true, warning: 'Primary ledger missing; loaded validated backup' } }
        catch (backupError) { if (backupError.code === 'ENOENT') return { ledger: emptyLedger(), recovered: false }; throw new Error('Primary ledger missing and backup invalid; refusing empty replacement') }
      }
      original = error
    }
    try {
      return { ledger: validateLedger(JSON.parse(await fs.readFile(this.backup, 'utf8'))), recovered: true, warning: 'Primary ledger invalid; loaded validated backup: ' + original.message }
    } catch { throw new Error('Ledger and backup unavailable/invalid; refusing empty replacement: ' + original.message) }
  }
  async acquire() {
    await fs.mkdir(this.directory, { recursive: true, mode: 0o700 })
    const token = randomUUID(), start = Date.now()
    for (;;) {
      try {
        await fs.mkdir(this.lock, { mode: 0o700 })
        try { await fs.writeFile(path.join(this.lock, 'owner.json'), JSON.stringify({ pid: process.pid, token }), { flag: 'wx', mode: 0o600 }) }
        catch (error) { await fs.rmdir(this.lock).catch(() => {}); throw error }
        return async () => {
          const owner = JSON.parse(await fs.readFile(path.join(this.lock, 'owner.json'), 'utf8'))
          if (owner.token !== token) throw new Error('Ledger lock ownership changed')
          await fs.unlink(path.join(this.lock, 'owner.json'))
          await fs.rmdir(this.lock)
        }
      } catch (error) {
        if (error.code !== 'EEXIST') throw error
        // Dead PID reclamation is intentionally omitted: two reclaimers can
        // otherwise remove a third process's newly acquired lock (ABA race).
        if (Date.now() - start >= this.lockTimeoutMs) throw new Error('Ledger lock timeout; inspect ' + this.lock)
        await new Promise(resolve => setTimeout(resolve, 25))
      }
    }
  }
  async atomicWrite(file, text) {
    const target = path.resolve(file)
    if (path.dirname(target) !== this.directory) throw new Error('Unsafe ledger target')
    const temp = path.join(this.directory, '.ledger.' + randomUUID())
    let handle
    try {
      handle = await fs.open(temp, 'wx', 0o600)
      await handle.writeFile(text)
      await handle.sync()
      await handle.close(); handle = null
      await fs.rename(temp, target)
      // Flush the directory entry where supported; Windows may reject it.
      let dir
      try { dir = await fs.open(this.directory, 'r'); await dir.sync() } catch (e) { if (!['EINVAL', 'EPERM', 'EISDIR', 'ENOTSUP'].includes(e.code)) throw e }
      finally { await dir?.close() }
    } finally { await handle?.close(); await fs.unlink(temp).catch(e => { if (e.code !== 'ENOENT') throw e }) }
  }
  async commit(update) {
    const release = await this.acquire()
    try {
      const loaded = await this.read()
      const ledger = loaded.ledger
      if (loaded.recovered && !loaded.missingPrimary) {
        // Retain evidence before replacing a damaged primary; never rotate the
        // damaged file over the only validated backup.
        await fs.copyFile(this.file, path.join(this.directory, 'ledger.corrupt.' + this.now() + '.' + randomUUID() + '.json'))
      }
      let backupAt = 0, hasBackup = false
      try { backupAt = (await fs.stat(this.backup)).mtimeMs; hasBackup = true } catch (e) { if (e.code !== 'ENOENT') throw e }
      if (!loaded.recovered && ledger.updatedAt > 0 && this.now() - backupAt >= this.backupIntervalMs) {
        await this.atomicWrite(this.backup, JSON.stringify(ledger))
      }
      await update(ledger)
      ledger.updatedAt = this.now()
      validateLedger(ledger)
      await this.atomicWrite(this.file, JSON.stringify(ledger))
      // First commit needs a recoverable baseline too.
      if (!hasBackup && !loaded.recovered) await this.atomicWrite(this.backup, JSON.stringify(ledger))
      return { ledger, recovered: loaded.recovered, warning: loaded.warning || null }
    } finally { await release() }
  }
}
