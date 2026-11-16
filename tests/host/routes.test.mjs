import { test, after } from 'node:test'
const disposers = []
after(() => disposers.forEach(dispose => dispose()))
import assert from 'node:assert/strict'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { apply } from '../../lib/index.js'

function harness({connection, shellResult = command => ({exitCode:0,stdout:{text:''}})} = {}) {
  const routes = new Map()
  apply({connection,shell:{resolve:s=>s,execute:async spec=>({result:async()=>shellResult(spec.command)})},webServer:{register:route=>{routes.set(route.path,route.handler);return()=>{}}},effect:fn=>{const dispose=fn();if(typeof dispose==='function')disposers.push(dispose);return dispose}})
  async function request(route,headers={},method='GET') {
    const req={url:route,method,headers},res={statusCode:0,setHeader(){},end(body){this.body=body}}
    await routes.get(route.split('?')[0])(req,res)
    return {status:res.statusCode,body:JSON.parse(res.body || '{}')}
  }
  return {request,routes}
}
const owner={admit:()=>({peer:{principal:{kind:'owner'}}})}

test('All full routes fail closed without credential admission before any shell operation', async () => {
  for (const connection of [undefined,{admit:()=>({rejection:401})},{admit:()=>({peer:{principal:{kind:'guest'}}})}]) {
    let shells=0
    const h=harness({connection,shellResult:()=>{shells++;throw new Error('must not scan')}})
    for (const route of h.routes.keys()) assert.equal((await h.request(route)).status,403,route)
    assert.equal(shells,0)
  }
})
test('Full routes forward credential and Host headers even without Origin; cross-host rejection enforced', async () => {
  let admissions=0
  const h=harness({connection:{admit:req=>{admissions++;assert.equal(req.headers.origin,undefined);return req.headers.host==='trusted:52202'?{peer:{principal:{kind:'owner'}}}:{rejection:403}}}})
  assert.equal((await h.request('/agent-token-stats/data',{host:'evil.test',cookie:'invalid'})).status,403)
  assert.equal(admissions,1)
  const accepted=await h.request('/agent-token-stats/sessions?agent=none',{host:'trusted:52202',cookie:'valid'})
  assert.equal(accepted.status,200);assert.equal(admissions,2)
})
test('Cross-Origin even owner credentials and non-GET routes reject', async () => {
  const h=harness({connection:owner})
  assert.equal((await h.request('/agent-token-stats/data',{host:'trusted:52202',origin:'https://evil.test'})).status,403)
  assert.equal((await h.request('/agent-token-stats/data',{},'POST')).status,405)
})
test('Full data route preserves success on collector failure and avoids legacy Cursor double insertion', async () => {
  const oldHome=process.env.HOME
  const home=await fs.mkdtemp(path.join(tmpdir(),'ats-route-'))
  process.env.HOME=home
  const directory=path.join(home,'.agent-token-stats');await fs.mkdir(directory)
  const day=new Date(1000).toLocaleDateString('sv-SE')
  const key=['cursor','cursor','test','gpt',day].join('\u0001')
  await fs.writeFile(path.join(directory,'ledger.json'),JSON.stringify({version:1,updatedAt:100,rows:{[key]:{a:'cursor',p:'cursor',v:'test',m:'gpt',d:day,n:5,ln:5,i:100,li:100,o:50,lo:50}},projects:{},sources:{}}))
  let fail=false
  const h=harness({connection:owner,shellResult:command=>{
    if(command.includes('for t in bash find'))return{exitCode:0,stdout:{text:'jq=ok\nsqlite3=ok\nzstd=ok\n'}}
    if(command.includes('echo == claude'))return{exitCode:0,stdout:{text:'== claude\n0\n== dsh\n0\n== cursoride\n1 10\n== opencode\nnone\n'}}
    if(command.includes('SELECT substr(c.key'))return fail?{exitCode:1,stderr:{text:'fixture read failed'}}:{exitCode:0,stdout:{text:JSON.stringify([{cid:'a',ca:1000,na:5,ti:100,tok:50,ud:{}}])}}
    return {exitCode:0,stdout:{text:''}}
  }})
  async function settled(refresh=false) {
    let response=await h.request('/agent-token-stats/data'+(refresh?'?refresh=1':''))
    for(let n=0;n<100 && response.body.scanning;n++){await new Promise(r=>setTimeout(r,5));response=await h.request('/agent-token-stats/data')}
    assert.equal(response.body.scanning,false);return response.body
  }
  try {
    const first=await settled()
    assert.equal(first.rows.reduce((n,r)=>n+r.i,0),100,'corrected bucket must not re-add historical tokens')
    assert.equal(first.rows.reduce((n,r)=>n+r.n,0),5,'assistant messages must not re-add historical API counts')
    const source=first.sources.find(s=>s.id==='cursor')
    assert.equal(source.stale,false);assert.ok(source.lastSuccessfulScan>0)
    fail=true
    const failed=await settled(true), stale=failed.sources.find(s=>s.id==='cursor')
    assert.equal(stale.status,'error');assert.equal(stale.stale,true)
    assert.equal(stale.lastSuccessfulScan,source.lastSuccessfulScan)
    assert.equal(stale.records,source.records)
    assert.equal(failed.rows.reduce((n,r)=>n+r.i,0),100)
  } finally {process.env.HOME=oldHome}
})
