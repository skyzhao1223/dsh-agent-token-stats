import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { LedgerStore, emptyLedger } from '../../lib/host/ledger-store.js'
import { cursorRecords } from '../../lib/host/cursor.js'
import { openCodeSql } from '../../lib/host/opencode.js'
import { runLimited, retainPart } from '../../lib/host/scan.js'
import { ledgerDifference } from '../../lib/host/ledger-audit.js'
const fixture = () => fs.mkdtemp(path.join(tmpdir(), 'ats-host-'))
const cursor = rows => cursorRecords(rows, { localDay: () => '2026-11-16', inferVendor: () => 'test' })

test('Cursor bubble-only means assistant messages, unknown tokens, zero invented API requests', () => {
  const { records } = cursor([{cid:'a',ca:1000,na:5,ti:0,tok:0,ud:'{}'}])
  assert.equal(records.length,1); assert.equal(records[0].n,0)
  assert.equal(records[0].assistantMessages,5); assert.equal(records[0].apiRequests,null)
  assert.equal(records[0].tokensKnown,false); assert.equal(records[0].i,0)
})
test('Cursor mixed model amount never allocates tokens or claims composer model per bubble', () => {
  const { records } = cursor([{cid:'a',ca:1000,na:3,ti:101,tok:55,ud:{claude:{amount:2,costInCents:4},gpt:{amount:1,costInCents:3}}}])
  assert.equal(records.filter(r=>r.apiRequests>0).reduce((n,r)=>n+r.apiRequests,0),3)
  assert.equal(records.find(r=>r.model==='claude').i,0)
  const local = records.find(r=>r.model==='(unattributed)')
  assert.equal(local.i,101); assert.equal(local.o,55); assert.equal(local.assistantMessages,3)
})
test('OpenCode real SQLite interleaved migration counts unique IDs and backfills', () => {
  const schema = {message:['id','data','time_created'],session_message:['id','data','time_created','type','session_id']}
  const legacy = (id,at,tokens) => `INSERT INTO message VALUES('${id}','${JSON.stringify({role:'assistant',modelID:'gpt',providerID:'p',tokens:{input:tokens}})}',${at});`
  const modern = (id,at,tokens) => `INSERT INTO session_message VALUES('${id}','${JSON.stringify({model:{id:'gpt',providerID:'p'},tokens:{input:tokens}})}',${at},'assistant','s');`
  const sql = 'CREATE TABLE message(id TEXT,data TEXT,time_created INTEGER);CREATE TABLE session_message(id TEXT,data TEXT,time_created INTEGER,type TEXT,session_id TEXT);'+legacy('same',4000,10)+legacy('legacy',9000,20)+modern('same',2000,30)+modern('backfilled',1000,40)+openCodeSql(schema)
  const result = spawnSync('sqlite3',['-json',':memory:',sql],{encoding:'utf8'})
  assert.equal(result.status,0,result.stderr)
  const rows = JSON.parse(result.stdout)
  assert.equal(rows.reduce((n,r)=>n+r.n,0),3)
  assert.equal(rows.reduce((n,r)=>n+r.i,0),90)
})
test('OpenCode absent session tables avoid invalid joins; unsupported columns fail clearly', () => {
  const sql = openCodeSql({session_message:['id','data','time_created','type']})
  assert.ok(!sql.includes('LEFT JOIN'))
  assert.throws(()=>openCodeSql({message:['data']}),/Unsupported/)
})
test('Failed source retains successful records and timestamps', () => {
  const data = {records:[{i:10}]}
  const first = retainPart(null,{data,error:null},1000)
  const failed = retainPart(first,{data:null,error:'failure'},2000)
  assert.equal(failed.data,data); assert.equal(failed.lastSuccessfulScan,1000)
  assert.equal(failed.lastAttemptAt,2000); assert.equal(failed.stale,true)
})
test('Lazy collector pool never exceeds configured concurrency', async () => {
  let active=0,max=0
  const tasks=Array.from({length:12},()=>async()=>{active++;max=Math.max(max,active);await new Promise(r=>setTimeout(r,2));active--;return true})
  const result=await runLimited(tasks,3)
  assert.equal(result.length,12);assert.equal(max,3)
})
test('Ledger stale caller commits reload under lock; repeated scans do not double count', async () => {
  const directory=await fixture(), a=new LedgerStore(directory), b=new LedgerStore(directory)
  const update = observed => ledger => {
    const row=ledger.rows.key ||= {n:0,ln:0}
    row.n+=Math.max(0,observed-row.ln);row.ln=Math.max(observed,row.ln)
  }
  await Promise.all([a.commit(update(10)),b.commit(update(10))])
  await a.commit(update(4));await b.commit(update(10));await a.commit(update(12))
  assert.equal((await b.read()).ledger.rows.key.n,12)
})
test('Independent processes serialize their fresh ledger updates', async () => {
  const directory=await fixture(), url=new URL('../../lib/host/ledger-store.js',import.meta.url).href
  const script=`import {LedgerStore} from ${JSON.stringify(url)};const s=new LedgerStore(process.argv[1]);for(let i=0;i<5;i++)await s.commit(l=>{l.rows.counter ||= {n:0};l.rows.counter.n++})`
  await Promise.all(Array.from({length:3},()=>new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,['--input-type=module','-e',script,directory]);let error='';child.stderr.on('data',d=>error+=d);child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(error)))
  })))
  assert.equal((await new LedgerStore(directory).read()).ledger.rows.counter.n,15)
})
test('Corrupt primary recovers backup, retains damaged evidence before commit', async () => {
  const directory=await fixture(),store=new LedgerStore(directory)
  await store.commit(l=>{l.rows.key={n:8}})
  await fs.writeFile(store.file,'{broken')
  assert.equal((await store.read()).recovered,true)
  await store.commit(l=>{l.rows.key.n++})
  assert.equal((await store.read()).ledger.rows.key.n,9)
  assert.ok((await fs.readdir(directory)).some(n=>n.startsWith('ledger.corrupt.')))
  assert.equal(JSON.parse(await fs.readFile(store.backup,'utf8')).rows.key.n,8)
})
test('Missing primary recovers backup; missing primary with invalid backup refuses empty ledger', async () => {
  const directory=await fixture(),store=new LedgerStore(directory)
  await fs.writeFile(store.backup,JSON.stringify({...emptyLedger(),updatedAt:100,rows:{k:{n:5}}}))
  assert.equal((await store.read()).ledger.rows.k.n,5)
  await store.commit(()=>{})
  assert.equal((await store.read()).ledger.rows.k.n,5)
  const invalid=await fixture(),other=new LedgerStore(invalid)
  await fs.writeFile(other.backup,'broken')
  await assert.rejects(other.read(),/refusing empty/)
})
test('Both invalid copies cannot be overwritten and lock timeout is fail-closed', async () => {
  const directory=await fixture(),store=new LedgerStore(directory,{lockTimeoutMs:30})
  await fs.writeFile(store.file,'bad');await fs.writeFile(store.backup,'bad')
  await assert.rejects(store.commit(()=>{}),/refusing empty/)
  assert.equal(await fs.readFile(store.file,'utf8'),'bad')
  await fs.mkdir(store.lock)
  await assert.rejects(store.commit(()=>{}),/lock timeout/)
})
test('Backup rotation uses backup age even while primary continuously refreshes', async () => {
  const directory=await fixture(),store=new LedgerStore(directory,{backupIntervalMs:50})
  await store.commit(l=>{l.rows.k={n:1}})
  await fs.utimes(store.backup,new Date(0),new Date(0))
  await store.commit(l=>{l.rows.k.n=2})
  assert.equal(JSON.parse(await fs.readFile(store.backup,'utf8')).rows.k.n,1)
  await fs.utimes(store.backup,new Date(0),new Date(0))
  await store.commit(l=>{l.rows.k.n=3})
  assert.equal(JSON.parse(await fs.readFile(store.backup,'utf8')).rows.k.n,2)
})

test('OpenCode duplicate empty modern usage falls back to valid old tokens; empty object remains unknown', () => {
  const schema={message:['id','data','time_created'],session_message:['id','data','time_created','type']}
  const sql=`CREATE TABLE message(id TEXT,data TEXT,time_created INTEGER); CREATE TABLE session_message(id TEXT,data TEXT,time_created INTEGER,type TEXT);
  INSERT INTO message VALUES('same','{"role":"assistant","modelID":"gpt","tokens":{"input":12},"cost":0.2}',1000);
  INSERT INTO session_message VALUES('same','{"model":{"id":"gpt"},"tokens":{}}',1000,'assistant');
  INSERT INTO session_message VALUES('empty','{"model":{"id":"gpt"},"tokens":{}}',1000,'assistant');
  INSERT INTO session_message VALUES('zero','{"model":{"id":"gpt"},"tokens":{"input":0}}',1000,'assistant');`+openCodeSql(schema)
  const result=spawnSync('sqlite3',['-json',':memory:',sql],{encoding:'utf8'})
  assert.equal(result.status,0,result.stderr)
  const rows=JSON.parse(result.stdout)
  assert.equal(rows.reduce((n,r)=>n+r.n,0),3)
  assert.equal(rows.reduce((n,r)=>n+r.known,0),2)
  assert.equal(rows.reduce((n,r)=>n+r.i,0),12)
  assert.equal(rows.reduce((n,r)=>n+r.c,0),0.2)
})
test('Read-only difference report preserves all input and flags legacy observations without asserting corruption', () => {
  const row={a:'cursor',p:'cursor',v:'v',m:'m',d:'2026-11-16',n:6,i:0},key=[row.a,row.p,row.v,row.m,row.d].join('\u0001')
  const ledger={...emptyLedger(),rows:{[key]:row}},before=JSON.stringify(ledger)
  const report=ledgerDifference(ledger,[{...row,n:0}])
  assert.equal(report.readOnly,true);assert.equal(report.legacyRows,1)
  assert.equal(report.rows[0].differences.n,6);assert.equal(JSON.stringify(ledger),before)
})
