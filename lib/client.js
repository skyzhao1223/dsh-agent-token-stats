window.__ModuleLoader__.load({
  id: "dsh-agent-token-stats",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const ReactNS = require("react");
    const React = ReactNS && ReactNS.createElement ? ReactNS : (ReactNS && ReactNS.default) || ReactNS;
    const inject = ["slots"];
    function apply(ctx) {
    const slots = ctx.slots
    if (slots === undefined) return

    const AGENT_LABELS = {
      'claude-code': 'Claude Code',
      'wps-claude': 'WPS Claude',
      'opencode': 'OpenCode',
      'dsh': 'DSH',
      'openclaw': 'OpenClaw',
      'qclaw': 'QClaw',
      'codewhale': 'CodeWhale',
      'workbuddy': 'WorkBuddy',
      'cursor': 'Cursor',
      'codex': 'Codex CLI',
      'gemini': 'Gemini CLI',
      'cline': 'Cline/Roo',
      'hermes': 'Hermes',
      'pi': 'Pi'
    }
    const STATUS_LABELS = { ok: '已统计', 'no-data': '无 token 数据', missing: '未找到', error: '出错', pending: '等待解析', archived: '历史留存' }
    const PALETTE = ['#5b8def', '#3ecf8e', '#e8a23d', '#a97bef', '#ef6b6b', '#4bc0c0', '#f78fb3', '#9b8cf5', '#c9a86a', '#8fbf4b']
    const TABS = [
      { id: 'overview', label: '总览' },
      { id: 'trend', label: '趋势分析' },
      { id: 'compare', label: '对比分析' },
      { id: 'detail', label: '模型明细' },
      { id: 'sources', label: '数据源' }
    ]

    const CSS = [
      '.lts-scroll{height:100%;overflow-y:auto;overscroll-behavior:contain;}',
      '.lts-root{padding:18px 24px 48px;max-width:1200px;margin:0 auto;color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.55;}',
      '.lts-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;}',
      '.lts-header-main{min-width:0;}',
      '.lts-title{font-size:19px;font-weight:750;letter-spacing:-.02em;margin:0 0 3px;background:linear-gradient(100deg,var(--dsw-alias-label-primary) 35%,var(--dsw-alias-brand-primary));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}',
      '.lts-meta{color:var(--dsw-alias-label-secondary);font-size:11.5px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;}',
      '.lts-sub{color:var(--dsw-alias-label-secondary);font-size:12px;}',
      '.lts-spin{color:var(--dsw-alias-brand-primary);}',
      '.lts-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}',
      '.lts-auto{display:flex;gap:6px;align-items:center;color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer;user-select:none;}',
      '.lts-auto input{accent-color:var(--dsw-alias-brand-primary);}',
      '.lts-btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);border-radius:9px;padding:6px 14px;cursor:pointer;font-size:12px;font-weight:550;transition:all .15s ease;}',
      '.lts-btn:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);transform:translateY(-1px);}',
      '.lts-btn:active{transform:translateY(0);}',
      '.lts-btn:disabled{opacity:.5;cursor:default;transform:none;}',
      '.lts-btn-primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:#fff;}',
      '.lts-btn-primary:hover{color:#fff;filter:brightness(1.1);box-shadow:0 4px 14px rgba(91,141,239,.35);}',
      '.lts-export-msg{font-size:11.5px;color:var(--dsw-alias-state-success-primary);margin-top:6px;word-break:break-all;max-width:360px;text-align:right;}',
      '.lts-toolbar{position:sticky;top:-18px;z-index:30;margin:12px -24px 0;padding:26px 24px 0;background:var(--dsw-alias-bg-base);border-bottom:1px solid var(--dsw-alias-border-l1);}',
      '.lts-filters{display:flex;gap:6px;align-items:center;flex-wrap:wrap;}',
      '.lts-filter-label{color:var(--dsw-alias-label-secondary);font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;margin-right:2px;font-weight:600;}',
      '.lts-chip{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);border-radius:8px;padding:3px 11px;cursor:pointer;font-size:12px;font-weight:500;transition:all .15s ease;}',
      '.lts-chip:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);transform:translateY(-1px);}',
      '.lts-chip-on{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:#fff;box-shadow:0 2px 10px rgba(91,141,239,.3);}',
      '.lts-chip-on:hover{color:#fff;}',
      '.lts-select{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:3px 8px;font-size:12px;cursor:pointer;outline:none;transition:border-color .15s;margin-left:10px;}',
      '.lts-select:hover{border-color:var(--dsw-alias-border-l2);}',
      '.lts-select:focus{border-color:var(--dsw-alias-brand-primary);}',
      '.lts-search{position:relative;display:inline-flex;align-items:center;margin-left:8px;}',
      '.lts-search-input{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:4px 24px 4px 10px;font-size:12px;width:130px;outline:none;transition:all .18s ease;}',
      '.lts-search-input::placeholder{color:var(--dsw-alias-label-secondary);opacity:.7;}',
      '.lts-search-input:focus{border-color:var(--dsw-alias-brand-primary);width:180px;box-shadow:0 0 0 2px rgba(91,141,239,.15);}',
      '.lts-search-clear{position:absolute;right:3px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:11px;padding:2px 5px;border-radius:4px;}',
      '.lts-search-clear:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);}',
      '.lts-active-filters{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:8px;}',
      '.lts-fchip{border:1px solid var(--dsw-alias-brand-primary);background:transparent;color:var(--dsw-alias-brand-primary);border-radius:7px;padding:2px 9px;font-size:11px;cursor:pointer;transition:all .12s;font-weight:500;}',
      '.lts-fchip:hover{background:var(--dsw-alias-brand-primary);color:#fff;}',
      '.lts-fchip-clear{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);}',
      '.lts-fchip-clear:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.lts-tabs{display:inline-flex;gap:2px;margin:10px 0 8px;padding:3px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:11px;flex-wrap:wrap;}',
      '.lts-tab{border:none;background:transparent;color:var(--dsw-alias-label-secondary);padding:5px 15px;cursor:pointer;font-size:12.5px;font-weight:500;border-radius:8px;transition:all .15s ease;}',
      '.lts-tab:hover{color:var(--dsw-alias-label-primary);}',
      '.lts-tab-on{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-weight:650;box-shadow:0 1px 4px rgba(0,0,0,.14);}',
      '.lts-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:10px;margin:12px 0;}',
      '.lts-card{position:relative;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;padding:13px 15px 12px;min-width:0;overflow:hidden;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease;}',
      '.lts-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.09);border-color:var(--dsw-alias-border-l2);}',
      '.lts-card::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--lts-acc,#5b8def),transparent 85%);opacity:.9;}',
      '.lts-card-label{color:var(--dsw-alias-label-secondary);font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;font-weight:600;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.lts-card-value{font-size:23px;font-weight:700;letter-spacing:-.02em;line-height:1.15;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.lts-card-delta{display:flex;align-items:center;gap:2px;margin-top:2px;height:17px;white-space:nowrap;overflow:hidden;}',
      '.lts-card-delta .lts-delta{margin-left:0;}',
      '.lts-card-delta-label{font-size:10px;color:var(--dsw-alias-label-secondary);}',
      '.lts-card-extra{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.lts-section{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:16px;padding:14px 16px;margin:10px 0;}',
      '.lts-section h3{margin:0 0 12px;font-size:13.5px;font-weight:650;display:flex;align-items:center;flex-wrap:wrap;}',
      '.lts-section h3::before{content:"";width:3px;height:14px;border-radius:2px;background:linear-gradient(180deg,#5b8def,#a97bef);margin-right:9px;flex:none;}',
      '.lts-section-note{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:400;margin-left:10px;display:inline-flex;align-items:center;gap:4px;}',
      '.lts-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}',
      '.lts-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--dsw-alias-label-secondary);margin-bottom:10px;}',
      '.lts-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px;}',
      '.lts-donut-wrap{display:flex;gap:18px;align-items:center;flex-wrap:wrap;}',
      '.lts-legend-list{display:flex;flex-direction:column;gap:2px;font-size:12px;min-width:200px;flex:1;}',
      '.lts-legend-item{display:flex;align-items:center;gap:9px;cursor:pointer;padding:4px 8px;border-radius:8px;transition:all .12s ease;}',
      '.lts-legend-item:hover{background:var(--dsw-alias-bg-layer-2);transform:translateX(2px);}',
      '.lts-legend-item-on{background:var(--dsw-alias-bg-layer-2);}',
      '.lts-legend-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;}',
      '.lts-legend-val{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap;font-size:11.5px;}',
      '.lts-hbar-row{display:flex;align-items:center;gap:12px;margin:7px 0;padding:2px 4px;border-radius:8px;transition:background .12s;}',
      '.lts-hbar-click{cursor:pointer;}',
      '.lts-hbar-click:hover{background:var(--dsw-alias-bg-layer-2);}',
      '.lts-hbar-click:hover .lts-hbar-fill{filter:brightness(1.15);}',
      '.lts-hbar-label{width:225px;min-width:0;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;}',
      '.lts-hbar-track{flex:1;height:10px;background:var(--dsw-alias-bg-layer-2);border-radius:99px;overflow:hidden;}',
      '.lts-hbar-fill{height:100%;border-radius:99px;transition:width .3s ease,filter .12s;}',
      '.lts-hbar-val{width:96px;text-align:right;font-size:12px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary);white-space:nowrap;font-weight:550;}',
      '.lts-tip{position:absolute;z-index:40;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:9px 12px;font-size:11.5px;line-height:1.65;pointer-events:none;box-shadow:0 8px 24px rgba(0,0,0,.2);min-width:150px;max-width:220px;color:var(--dsw-alias-label-primary);}',
      '.lts-tip-title{font-weight:650;margin-bottom:2px;}',
      '.lts-tip-hint{color:var(--dsw-alias-label-secondary);font-size:10px;margin-top:3px;}',
      '.lts-heat{display:flex;gap:3px;overflow-x:auto;padding:2px 0 4px;}',
      '.lts-heat-months{display:flex;gap:3px;font-size:9px;color:var(--dsw-alias-label-secondary);margin-bottom:3px;}',
      '.lts-heat-month{width:11px;flex:none;overflow:visible;white-space:nowrap;}',
      '.lts-heat-col{display:flex;flex-direction:column;gap:3px;}',
      '.lts-heat-cell{width:11px;height:11px;border-radius:3px;background:var(--dsw-alias-bg-layer-2);transition:transform .1s ease;}',
      '.lts-heat-cell:hover{transform:scale(1.3);}',
      '.lts-heat-click{cursor:pointer;}',
      '.lts-heat-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:6px;flex-wrap:wrap;}',
      '.lts-heat-hint{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:4px;}',
      '.lts-heat-scale{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--dsw-alias-label-secondary);}',
      '.lts-heat-scale i{width:10px;height:10px;border-radius:3px;background:var(--dsw-alias-brand-primary);display:inline-block;}',
      '.lts-daysel{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary);}',
      '.lts-dayclose{margin-left:auto;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:7px;padding:2px 10px;font-size:11px;cursor:pointer;transition:all .12s;}',
      '.lts-dayclose:hover{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary);}',
      '.lts-delta{font-size:11px;margin-left:8px;white-space:nowrap;font-weight:600;}',
      '.lts-delta-up{color:var(--dsw-alias-state-error-primary);}',
      '.lts-delta-down{color:var(--dsw-alias-state-success-primary);}',
      '.lts-delta-flat{color:var(--dsw-alias-label-secondary);font-weight:400;}',
      '.lts-period-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}',
      '.lts-period-card{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:12px 14px;background:var(--dsw-alias-bg-layer-2);}',
      '.lts-period-title{font-size:11px;color:var(--dsw-alias-label-secondary);margin-bottom:8px;font-weight:650;text-transform:uppercase;letter-spacing:.06em;}',
      '.lts-period-row{display:flex;justify-content:space-between;align-items:center;font-size:12.5px;padding:3px 0;gap:8px;border-bottom:1px dashed var(--dsw-alias-border-l1);}',
      '.lts-period-row:last-child{border-bottom:none;}',
      '.lts-cmp-track{display:inline-block;width:110px;height:7px;border-radius:99px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);overflow:hidden;vertical-align:middle;margin-right:9px;}',
      '.lts-cmp-bar{display:block;height:100%;border-radius:99px;}',
      '.lts-chart-scroll{overflow-x:auto;}',
      '.lts-table-scroll{overflow-x:auto;border-radius:10px;}',
      '.lts-table{width:100%;border-collapse:collapse;font-size:12px;}',
      '.lts-table th,.lts-table td{padding:6px 9px;text-align:right;border-bottom:1px solid var(--dsw-alias-border-l1);white-space:nowrap;}',
      '.lts-table th{cursor:pointer;user-select:none;color:var(--dsw-alias-label-secondary);font-weight:600;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--dsw-alias-border-l2);transition:color .12s;}',
      '.lts-table th:hover{color:var(--dsw-alias-brand-primary);}',
      '.lts-table tbody tr{transition:background .1s;}',
      '.lts-table tbody tr:hover td{background:var(--dsw-alias-bg-layer-2);}',
      '.lts-table tfoot td{border-top:1px solid var(--dsw-alias-border-l2);border-bottom:none;font-weight:650;background:var(--dsw-alias-bg-layer-1);}',
      '.lts-mono{font-variant-numeric:tabular-nums;}',
      '.lts-strong{font-weight:650;}',
      '.lts-model{max-width:260px;overflow:hidden;text-overflow:ellipsis;}',
      '.lts-pill{display:inline-block;padding:2px 9px;border-radius:7px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);font-size:11px;max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;font-weight:500;}',
      '.lts-expand td{background:var(--dsw-alias-bg-layer-2);text-align:left !important;padding:12px 14px;}',
      '.lts-expand-hint{font-size:11px;color:var(--dsw-alias-label-secondary);margin-bottom:8px;font-weight:500;}',
      '.lts-src-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;}',
      '.lts-src{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:11px 13px;background:var(--dsw-alias-bg-layer-2);transition:transform .15s ease,border-color .15s ease;}',
      '.lts-src:hover{transform:translateY(-1px);border-color:var(--dsw-alias-border-l2);}',
      '.lts-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px;vertical-align:1px;}',
      '.lts-dot-ok{background:var(--dsw-alias-state-success-primary);box-shadow:0 0 6px var(--dsw-alias-state-success-primary);}',
      '.lts-dot-error{background:var(--dsw-alias-state-error-primary);box-shadow:0 0 6px var(--dsw-alias-state-error-primary);}',
      '.lts-dot-no-data{background:var(--dsw-alias-state-warn-primary);opacity:.8;}',
      '.lts-dot-missing{background:var(--dsw-alias-label-secondary);opacity:.4;}',
      '.lts-dot-pending{background:var(--dsw-alias-label-secondary);opacity:.6;}',
      '.lts-dot-archived{background:var(--dsw-alias-brand-primary);box-shadow:0 0 6px var(--dsw-alias-brand-primary);}',
      '.lts-src-status{color:var(--dsw-alias-label-secondary);font-size:11px;margin-left:7px;}',
      '.lts-src-detail{color:var(--dsw-alias-label-secondary);font-size:11.5px;margin-top:5px;line-height:1.5;}',
      '.lts-src-error{color:var(--dsw-alias-state-error-primary);font-size:11px;margin-top:4px;word-break:break-all;}',
      '.lts-empty{color:var(--dsw-alias-label-secondary);padding:24px;text-align:center;font-size:12.5px;}',
      '.lts-error-banner{border:1px solid var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);border-radius:12px;padding:10px 14px;margin:12px 0;font-size:12px;background:var(--dsw-alias-bg-layer-1);}',
      '.lts-note{color:var(--dsw-alias-label-secondary);font-size:11px;margin-top:12px;padding:12px 16px;border-left:3px solid var(--dsw-alias-border-l2);border-radius:0 10px 10px 0;background:var(--dsw-alias-bg-layer-1);line-height:1.8;}',
      '@media (max-width: 900px){.lts-grid2,.lts-period-grid{grid-template-columns:1fr;}.lts-hbar-label{width:140px;}}'
    ].join('\n')

    ctx.effect(function () {
      const el = document.createElement('style')
      el.setAttribute('data-dsh-agent-token-stats', '')
      el.textContent = CSS
      document.head.appendChild(el)
      return function () {
        if (el.parentNode) el.parentNode.removeChild(el)
      }
    }, 'token-stats styles')

    const uiCache = { data: null, tab: 'overview', range: 30, agent: 'all', gran: 'day', auto: true, sort: null, vendorF: 'all', modelQ: '' }

    function pad2(n) { return (n < 10 ? '0' : '') + String(n) }
    function fmtNum(n) {
      n = Number(n) || 0
      const abs = Math.abs(n)
      if (abs >= 1000000000) return (n / 1000000000).toFixed(2) + 'B'
      if (abs >= 1000000) return (n / 1000000).toFixed(2) + 'M'
      if (abs >= 1000) return (n / 1000).toFixed(1) + 'K'
      return String(Math.round(n))
    }
    function fmtInt(n) {
      const s = String(Math.round(Number(n) || 0))
      let out = ''
      let c = 0
      for (let i = s.length - 1; i >= 0; i--) {
        out = s.charAt(i) + out
        c++
        if (c % 3 === 0 && i > 0) out = ',' + out
      }
      return out
    }
    function fmtPct(x) {
      const v = Number(x)
      return (Number.isFinite(v) ? (v * 100).toFixed(1) : '0.0') + '%'
    }
    function fmtCost(c) {
      c = Number(c) || 0
      if (c <= 0) return '$0'
      return '$' + (c < 1 ? c.toFixed(4) : c.toFixed(2))
    }
    function fmtTime(ms) {
      if (!(ms > 0)) return '—'
      const d = new Date(ms)
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes())
    }
    function dayOffset(days) {
      const d = new Date(Date.now() + days * 86400000)
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())
    }
    function weekKey(dayStr) {
      const parts = String(dayStr).split('-')
      if (parts.length !== 3) return dayStr
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      const dow = (d.getDay() + 6) % 7
      const mon = new Date(d.getTime() - dow * 86400000)
      return mon.getFullYear() + '-' + pad2(mon.getMonth() + 1) + '-' + pad2(mon.getDate())
    }
    function shortPath(p) {
      if (typeof p !== 'string' || p === '') return '(未知)'
      const home = p.match(/^\/Users\/[^/]+/)
      let t = p
      if (home) t = '~' + p.slice(home[0].length)
      const parts = t.split('/')
      if (parts.length <= 4) return t
      return '…/' + parts.slice(-3).join('/')
    }

    function PanelIcon(props) {
      const size = Number(props && props.size) || 18
      return React.createElement('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        style: { display: 'block', opacity: props && props.active ? 1 : 0.78 }
      },
        React.createElement('path', { d: 'M3 21h18' }),
        React.createElement('rect', { x: '5.5', y: '11', width: '3.4', height: '7', rx: '0.9', fill: 'currentColor', stroke: 'none' }),
        React.createElement('rect', { x: '10.8', y: '5.5', width: '3.4', height: '12.5', rx: '0.9', fill: 'currentColor', stroke: 'none', opacity: 0.72 }),
        React.createElement('rect', { x: '16.1', y: '8.5', width: '3.4', height: '9.5', rx: '0.9', fill: 'currentColor', stroke: 'none', opacity: 0.5 })
      )
    }

    function DeltaBadge(props) {
      const h = React.createElement
      const cur = Number(props.cur) || 0
      const prev = Number(props.prev) || 0
      if (prev <= 0 && cur <= 0) return h('span', { className: 'lts-delta lts-delta-flat' }, '—')
      if (prev <= 0) return h('span', { className: 'lts-delta lts-delta-up' }, '▲ 新增')
      const pct = (cur - prev) / prev
      if (Math.abs(pct) < 0.0005) return h('span', { className: 'lts-delta lts-delta-flat' }, '· 持平')
      const up = pct > 0
      return h('span', { className: 'lts-delta ' + (up ? 'lts-delta-up' : 'lts-delta-down') }, (up ? '▲ +' : '▼ ') + (pct * 100).toFixed(1) + '%')
    }

    function Donut(props) {
      const h = React.createElement
      const size = props.size || 168
      const thickness = props.thickness || 24
      const raw = Array.isArray(props.slices) ? props.slices : []
      const slices = []
      let total = 0
      for (let i = 0; i < raw.length; i++) {
        if (raw[i].value > 0) { slices.push(raw[i]); total += raw[i].value }
      }
      const [hover, setHover] = React.useState(-1)
      if (total <= 0) return h('div', { className: 'lts-empty' }, '暂无数据')
      const r = (size - thickness) / 2
      const circ = 2 * Math.PI * r
      let acc = 0
      const arcs = []
      for (let i = 0; i < slices.length; i++) {
        const s = slices[i]
        const dash = (s.value / total) * circ
        const segGap = slices.length > 1 ? Math.min(4, dash * 0.18) : 0
        const visible = Math.max(0.5, dash - segGap)
        const isHov = hover === i
        const dim = hover >= 0 && !isHov
        arcs.push(h('circle', {
          key: 'a' + i,
          cx: size / 2,
          cy: size / 2,
          r: r,
          fill: 'none',
          stroke: s.color,
          strokeWidth: isHov ? thickness + 5 : thickness,
          strokeDasharray: visible + ' ' + (circ - visible),
          strokeDashoffset: -acc,
          transform: 'rotate(-90 ' + (size / 2) + ' ' + (size / 2) + ')',
          opacity: dim ? 0.32 : 1,
          style: { cursor: props.onPick ? 'pointer' : 'default', transition: 'stroke-width .15s ease, opacity .15s ease' },
          onMouseEnter: function () { setHover(i) },
          onClick: props.onPick ? function () { props.onPick(s.label) } : undefined
        }))
        acc += dash
      }
      const hv = hover >= 0 ? slices[hover] : null
      arcs.push(h('text', { key: 'tv', x: size / 2, y: size / 2 - 2, textAnchor: 'middle', fontSize: hv === null ? 19 : 14, fontWeight: 700, letterSpacing: '-0.02em', fill: 'var(--dsw-alias-label-primary)' }, hv === null ? (props.centerValue || fmtNum(total)) : fmtNum(hv.value) + ' · ' + ((hv.value / total) * 100).toFixed(1) + '%'))
      arcs.push(h('text', { key: 'tl', x: size / 2, y: size / 2 + 17, textAnchor: 'middle', fontSize: 9.5, letterSpacing: '0.05em', fill: 'var(--dsw-alias-label-secondary)' }, hv === null ? (props.centerLabel || '') : (hv.label.length > 14 ? hv.label.slice(0, 14) + '…' : hv.label)))
      const legend = h('div', { className: 'lts-legend-list' }, slices.slice(0, 8).map(function (s, i) {
        return h('div', {
          key: s.label,
          className: 'lts-legend-item' + (hover === i ? ' lts-legend-item-on' : ''),
          onClick: props.onPick ? function () { props.onPick(s.label) } : undefined,
          onMouseEnter: function () { setHover(i) },
          onMouseLeave: function () { setHover(-1) }
        },
          h('i', { style: { background: s.color, display: 'inline-block', width: 10, height: 10, borderRadius: 3, flex: 'none' } }),
          h('span', { className: 'lts-legend-name' }, s.label),
          h('span', { className: 'lts-legend-val' }, ((s.value / total) * 100).toFixed(1) + '% · ' + fmtNum(s.value)))
      }))
      return h('div', { className: 'lts-donut-wrap' },
        h('svg', { width: size, height: size, style: { flex: 'none' }, onMouseLeave: function () { setHover(-1) } }, arcs),
        legend)
    }

    function HBars(props) {
      const h = React.createElement
      const items = Array.isArray(props.items) ? props.items : []
      if (items.length === 0) return h('div', { className: 'lts-empty' }, '暂无数据')
      let max = 1
      for (let i = 0; i < items.length; i++) if (items[i].value > max) max = items[i].value
      return h('div', null, items.map(function (it, i) {
        const pct = Math.max(1.5, (it.value / max) * 100)
        return h('div', {
          key: (it.key || it.label) + i,
          className: 'lts-hbar-row' + (props.onPick ? ' lts-hbar-click' : ''),
          title: it.title || (it.label + ': ' + fmtNum(it.value)),
          onClick: props.onPick ? function () { props.onPick(it) } : undefined
        },
          h('div', { className: 'lts-hbar-label' }, it.label),
          h('div', { className: 'lts-hbar-track' }, h('div', { className: 'lts-hbar-fill', style: { width: pct + '%', background: it.color || 'var(--dsw-alias-brand-primary)' } })),
          h('div', { className: 'lts-hbar-val' }, props.valueFmt ? props.valueFmt(it.value) : fmtNum(it.value)))
      }))
    }

    function Heatmap(props) {
      const h = React.createElement
      const days = Array.isArray(props.days) ? props.days : []
      const dayMap = {}
      for (let i = 0; i < days.length; i++) dayMap[days[i].day] = days[i]
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const start = new Date(today.getTime() - 181 * 86400000)
      const startDow = (start.getDay() + 6) % 7
      const cellStart = new Date(start.getTime() - startDow * 86400000)
      const totalCols = Math.ceil((182 + startDow) / 7)
      const cols = []
      const months = []
      let lastMonth = -1
      for (let c = 0; c < totalCols; c++) {
        const cells = []
        const colDate = new Date(cellStart.getTime() + c * 7 * 86400000)
        const mo = colDate.getMonth()
        if (mo !== lastMonth) { months.push((mo + 1) + '月'); lastMonth = mo } else { months.push('') }
        for (let r = 0; r < 7; r++) {
          const t = cellStart.getTime() + (c * 7 + r) * 86400000
          if (t > today.getTime()) {
            cells.push(h('div', { key: 'e' + r, className: 'lts-heat-cell', style: { background: 'transparent' } }))
            continue
          }
          const dd = new Date(t)
          const key = dd.getFullYear() + '-' + pad2(dd.getMonth() + 1) + '-' + pad2(dd.getDate())
          const entry = dayMap[key]
          const v = entry ? entry.total : 0
          if (v > 0) {
            const maxTotal = props.max > 0 ? props.max : 1
            const ratio = v / maxTotal
            const opacity = ratio > 0.66 ? 1 : ratio > 0.33 ? 0.72 : ratio > 0.1 ? 0.45 : 0.22
            cells.push(h('div', {
              key: key,
              className: 'lts-heat-cell' + (props.onPickDay ? ' lts-heat-click' : ''),
              title: key + ' · ' + fmtNum(v) + ' tokens · ' + fmtInt(entry.n) + ' 次请求' + (props.onPickDay ? ' · 点击查看当日明细' : ''),
              style: { background: 'var(--dsw-alias-brand-primary)', opacity: opacity },
              onClick: props.onPickDay ? function () { props.onPickDay(key) } : undefined
            }))
          } else {
            cells.push(h('div', { key: key, className: 'lts-heat-cell', title: key + ' · 无活动' }))
          }
        }
        cols.push(h('div', { key: 'c' + c, className: 'lts-heat-col' }, cells))
      }
      return h('div', null,
        h('div', { className: 'lts-heat-months' }, months.map(function (ml, ci) {
          return h('div', { key: 'm' + ci, className: 'lts-heat-month' }, ml)
        })),
        h('div', { className: 'lts-heat' }, cols),
        h('div', { className: 'lts-heat-foot' },
          h('div', { className: 'lts-heat-hint', style: { marginTop: 0 } }, '最近 26 周 · 颜色越深当日 token 越多 · 悬停查看详情(不受时间筛选影响)'),
          h('div', { className: 'lts-heat-scale' }, '少',
            h('i', { style: { opacity: 0.15 } }),
            h('i', { style: { opacity: 0.35 } }),
            h('i', { style: { opacity: 0.6 } }),
            h('i', { style: { opacity: 1 } }),
            '多')))
    }

    function MiniBars(props) {
      const h = React.createElement
      const days = (Array.isArray(props.days) ? props.days : []).slice(-45)
      if (days.length === 0) return h('span', { className: 'lts-heat-hint' }, '无每日数据')
      const barW = 8
      const gap = 3
      const chartH = 56
      let max = 1
      for (let i = 0; i < days.length; i++) if (days[i].total > max) max = days[i].total
      const bars = []
      for (let i = 0; i < days.length; i++) {
        const d = days[i]
        const bh = Math.max(1, (d.total / max) * chartH)
        bars.push(h('rect', {
          key: i,
          x: i * (barW + gap),
          y: chartH - bh,
          width: barW,
          height: bh,
          rx: 1,
          fill: props.color || 'var(--dsw-alias-brand-primary)'
        }, h('title', null, d.day + ' · ' + fmtNum(d.total))))
      }
      return h('svg', { width: days.length * (barW + gap), height: chartH + 4, style: { display: 'block' } }, bars)
    }

    function TrendChart(props) {
      const h = React.createElement
      const days = Array.isArray(props.days) ? props.days : []
      const [hov, setHov] = React.useState(-1)
      if (days.length === 0) return h('div', { className: 'lts-empty' }, '当前范围暂无数据')
      const shown = days.slice(-60)
      const barW = 15
      const gap = 4
      const chartH = 150
      let maxTotal = 1
      for (let i = 0; i < shown.length; i++) {
        if (shown[i].total > maxTotal) maxTotal = shown[i].total
      }
      const width = shown.length * (barW + gap) + gap
      const bars = []
      for (let g = 1; g <= 3; g++) {
        const gy = chartH - (chartH * g) / 4
        bars.push(h('line', { key: 'grid' + g, x1: 0, y1: gy, x2: width, y2: gy, stroke: 'var(--dsw-alias-border-l1)', strokeWidth: 1, strokeDasharray: '3 5' }))
      }
      for (let idx = 0; idx < shown.length; idx++) {
        const d = shown[idx]
        const x = gap + idx * (barW + gap)
        bars.push(h('rect', { key: 'hl' + idx, x: x - gap / 2, y: 0, width: barW + gap, height: chartH, fill: hov === idx ? 'var(--dsw-alias-bg-layer-2)' : 'transparent', pointerEvents: 'none' }))
        const segs = [
          { v: d.cr, color: '#5b8def' },
          { v: d.cw, color: '#a97bef' },
          { v: d.i, color: '#e8a23d' },
          { v: d.tt, color: '#c9a86a' },
          { v: d.r, color: '#7f8c9b' },
          { v: d.o, color: '#3ecf8e' }
        ]
        let y = chartH
        for (let sg = 0; sg < segs.length; sg++) {
          const seg = segs[sg]
          if (!(seg.v > 0)) continue
          const segH = Math.max(1, (seg.v / maxTotal) * chartH)
          y -= segH
          bars.push(h('rect', { key: 's' + idx + '-' + sg, x: x, y: y, width: barW, height: segH, fill: seg.color, rx: 2, pointerEvents: 'none', opacity: hov >= 0 && hov !== idx ? 0.45 : 1, style: { transition: 'opacity .12s' } }))
        }
        const showLabel = idx % 7 === 0 || idx === shown.length - 1
        if (showLabel) {
          bars.push(h('text', { key: 'l' + idx, x: x + barW / 2, y: chartH + 14, textAnchor: 'middle', fontSize: 9, fill: 'var(--dsw-alias-label-secondary)', pointerEvents: 'none' }, d.day.slice(5)))
        }
        bars.push(h('rect', {
          key: 'hit' + idx,
          x: x - gap / 2,
          y: 0,
          width: barW + gap,
          height: chartH + 18,
          fill: 'transparent',
          style: { cursor: props.onPickDay ? 'pointer' : 'default' },
          onMouseEnter: function () { setHov(idx) },
          onClick: props.onPickDay ? function () { props.onPickDay(d.day) } : undefined
        }))
      }
      let tip = null
      if (hov >= 0 && shown[hov] !== undefined) {
        const d = shown[hov]
        const tx = gap + hov * (barW + gap)
        const flip = tx > width - 185
        const pos = { top: 6 }
        if (flip) { pos.right = width - tx - barW } else { pos.left = tx }
        tip = h('div', { className: 'lts-tip', style: pos },
          h('div', { className: 'lts-tip-title' }, d.day + (props.gran === 'week' ? '(周起始)' : '')),
          h('div', null, '总计 ' + fmtNum(d.total) + ' · ' + fmtInt(d.n) + ' 次请求'),
          d.cr > 0 ? h('div', null, '缓存读 ' + fmtNum(d.cr)) : null,
          d.cw > 0 ? h('div', null, '缓存写 ' + fmtNum(d.cw)) : null,
          d.i > 0 ? h('div', null, '输入 ' + fmtNum(d.i)) : null,
          d.o > 0 ? h('div', null, '输出 ' + fmtNum(d.o)) : null,
          d.r > 0 ? h('div', null, '推理 ' + fmtNum(d.r)) : null,
          d.tt > 0 ? h('div', null, '仅总量 ' + fmtNum(d.tt)) : null,
          props.onPickDay ? h('div', { className: 'lts-tip-hint' }, '点击查看当日明细') : null)
      }
      return h('div', { className: 'lts-chart-scroll' },
        h('div', { style: { position: 'relative', width: width } },
          h('svg', { width: width, height: chartH + 22, style: { display: 'block' }, onMouseLeave: function () { setHov(-1) } }, bars),
          tip))
    }

    function Dashboard() {
      const h = React.createElement
      const [data, setData] = React.useState(uiCache.data)
      const [error, setError] = React.useState(null)
      const [loading, setLoading] = React.useState(false)
      const [agent, setAgent] = React.useState(uiCache.agent)
      const [range, setRange] = React.useState(uiCache.range)
      const [auto, setAuto] = React.useState(uiCache.auto)
      const [sort, setSort] = React.useState(uiCache.sort || { key: 'total', desc: true })
      const [exporting, setExporting] = React.useState(false)
      const [exportMsg, setExportMsg] = React.useState(null)
      const [tab, setTab] = React.useState(uiCache.tab)
      const [gran, setGran] = React.useState(uiCache.gran)
      const [vendorF, setVendorF] = React.useState(uiCache.vendorF)
      const [modelQ, setModelQ] = React.useState(uiCache.modelQ)
      const [daySel, setDaySel] = React.useState(null)
      const [expanded, setExpanded] = React.useState(null)

      React.useEffect(function () {
        uiCache.tab = tab
        uiCache.range = range
        uiCache.agent = agent
        uiCache.gran = gran
        uiCache.auto = auto
        uiCache.sort = sort
        uiCache.vendorF = vendorF
        uiCache.modelQ = modelQ
      }, [tab, range, agent, gran, auto, sort, vendorF, modelQ])

      const load = React.useCallback(function (refresh) {
        setLoading(true)
        fetch('/agent-token-stats/data' + (refresh === true ? '?refresh=1' : ''), { headers: { accept: 'application/json' } }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status)
          return r.json()
        }).then(
          function (res) { uiCache.data = res; setData(res); setError(null); setLoading(false) },
          function (e) { setError(String((e && e.message) || e)); setLoading(false) }
        )
      }, [])

      const doExport = React.useCallback(function () {
        setExporting(true)
        fetch('/agent-token-stats/export', { headers: { accept: 'application/json' } }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status)
          return r.json()
        }).then(
          function (res) {
            setExportMsg('已导出 ' + (res && res.path ? res.path : '') + '(' + (res && res.rows ? res.rows : 0) + ' 行)')
            setExporting(false)
          },
          function (e) {
            setExportMsg('导出失败: ' + String((e && e.message) || e))
            setExporting(false)
          }
        )
      }, [])

      React.useEffect(function () { load(false) }, [load])
      React.useEffect(function () {
        if (!auto) return undefined
        const id = window.setInterval(function () { load(false) }, 120000)
        return function () { window.clearInterval(id) }
      }, [auto, load])

      const view = React.useMemo(function () {
        if (data === null || !data || !Array.isArray(data.rows)) return null
        const cutoff = range > 0 ? dayOffset(-(range - 1)) : ''
        const mq = modelQ.trim().toLowerCase()
        const prevStart = range > 0 ? dayOffset(-(2 * range - 1)) : ''
        const prevEnd = range > 0 ? dayOffset(-range) : ''
        const totals = { n: 0, i: 0, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 0, ec: 0, total: 0, prompt: 0, hit: 0 }
        const prevTotals = { n: 0, i: 0, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 0, ec: 0, total: 0, prompt: 0, hit: 0 }
        const vendors = new Map()
        const models = new Map()
        const days = new Map()
        const daysAll = new Map()
        const agents = new Map()
        const rows = data.rows
        for (let idx = 0; idx < rows.length; idx++) {
          const r = rows[idx]
          if (agent !== 'all' && r.a !== agent) continue
          if (vendorF !== 'all' && r.v !== vendorF) continue
          if (mq !== '' && String(r.m).toLowerCase().indexOf(mq) === -1) continue
          const rtt = r.tt || 0
          const t = r.i + r.o + r.r + r.cr + r.cw + rtt
          if (r.d !== '') {
            let da = daysAll.get(r.d)
            if (da === undefined) { da = { day: r.d, n: 0, total: 0 }; daysAll.set(r.d, da) }
            da.n += r.n
            da.total += t
          }
          const inCur = cutoff === '' || (r.d !== '' && r.d >= cutoff)
          if (!inCur) {
            if (prevStart !== '' && r.d !== '' && r.d >= prevStart && r.d <= prevEnd) {
              prevTotals.n += r.n
              prevTotals.i += r.i
              prevTotals.o += r.o
              prevTotals.r += r.r
              prevTotals.cr += r.cr
              prevTotals.cw += r.cw
              prevTotals.tt += rtt
              prevTotals.c += r.c
              prevTotals.ec += r.ec || 0
              prevTotals.total += t
            }
            continue
          }
          totals.n += r.n
          totals.i += r.i
          totals.o += r.o
          totals.r += r.r
          totals.cr += r.cr
          totals.cw += r.cw
          totals.tt += rtt
          totals.c += r.c
          totals.ec += r.ec || 0
          totals.total += t

          let ag = agents.get(r.a)
          if (ag === undefined) { ag = { id: r.a, n: 0, total: 0, i: 0, cr: 0, cw: 0, c: 0, ec: 0, hit: 0 }; agents.set(r.a, ag) }
          ag.n += r.n
          ag.total += t
          ag.i += r.i
          ag.cr += r.cr
          ag.cw += r.cw
          ag.c += r.c
          ag.ec += r.ec || 0

          let v = vendors.get(r.v)
          if (v === undefined) {
            v = { name: r.v, n: 0, i: 0, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 0, ec: 0, total: 0, models: new Set() }
            vendors.set(r.v, v)
          }
          v.n += r.n
          v.i += r.i
          v.o += r.o
          v.r += r.r
          v.cr += r.cr
          v.cw += r.cw
          v.tt += rtt
          v.c += r.c
          v.ec += r.ec || 0
          v.total += t
          v.models.add(r.a + '|' + r.m)

          const mKey = r.a + '|' + r.p + '|' + r.v + '|' + r.m
          let m = models.get(mKey)
          if (m === undefined) {
            m = { a: r.a, p: r.p, v: r.v, m: r.m, n: 0, i: 0, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 0, ec: 0, total: 0, prompt: 0, hit: 0 }
            models.set(mKey, m)
          }
          m.n += r.n
          m.i += r.i
          m.o += r.o
          m.r += r.r
          m.cr += r.cr
          m.cw += r.cw
          m.tt += rtt
          m.c += r.c
          m.ec += r.ec || 0
          m.total += t

          if (r.d !== '') {
            let dd = days.get(r.d)
            if (dd === undefined) {
              dd = { day: r.d, n: 0, i: 0, o: 0, r: 0, cr: 0, cw: 0, tt: 0, total: 0 }
              days.set(r.d, dd)
            }
            dd.n += r.n
            dd.i += r.i
            dd.o += r.o
            dd.r += r.r
            dd.cr += r.cr
            dd.cw += r.cw
            dd.tt += rtt
            dd.total += t
          }
        }
        totals.prompt = totals.i + totals.cr + totals.cw
        totals.hit = totals.prompt > 0 ? totals.cr / totals.prompt : 0
        prevTotals.prompt = prevTotals.i + prevTotals.cr + prevTotals.cw
        prevTotals.hit = prevTotals.prompt > 0 ? prevTotals.cr / prevTotals.prompt : 0

        const vendorList = []
        vendors.forEach(function (v) {
          const prompt = v.i + v.cr + v.cw
          vendorList.push({ name: v.name, n: v.n, total: v.total, cr: v.cr, tt: v.tt, c: v.c, ec: v.ec, modelCount: v.models.size, hit: prompt > 0 ? v.cr / prompt : 0 })
        })
        vendorList.sort(function (a, b) { return b.total - a.total })
        const vendorColors = {}
        for (let i = 0; i < vendorList.length; i++) vendorColors[vendorList[i].name] = PALETTE[i % PALETTE.length]

        const modelList = []
        models.forEach(function (m) {
          m.prompt = m.i + m.cr + m.cw
          m.hit = m.prompt > 0 ? m.cr / m.prompt : 0
          modelList.push(m)
        })
        const topModels = modelList.slice().sort(function (a, b) { return b.total - a.total }).slice(0, 8)
        const tableTotals = { count: modelList.length, n: 0, i: 0, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 0, ec: 0, total: 0, prompt: 0, hit: 0 }
        for (let tti = 0; tti < modelList.length; tti++) {
          const mm = modelList[tti]
          tableTotals.n += mm.n
          tableTotals.i += mm.i
          tableTotals.o += mm.o
          tableTotals.r += mm.r
          tableTotals.cr += mm.cr
          tableTotals.cw += mm.cw
          tableTotals.tt += mm.tt
          tableTotals.c += mm.c
          tableTotals.ec += mm.ec
          tableTotals.total += mm.total
          tableTotals.prompt += mm.prompt
        }
        tableTotals.hit = tableTotals.prompt > 0 ? tableTotals.cr / tableTotals.prompt : 0
        const sk = sort.key
        modelList.sort(function (x, y) {
          let cmp
          if (sk === 'a' || sk === 'p' || sk === 'v' || sk === 'm') cmp = String(x[sk]).localeCompare(String(y[sk]))
          else cmp = (Number(x[sk]) || 0) - (Number(y[sk]) || 0)
          return sort.desc ? -cmp : cmp
        })

        const dayList = []
        days.forEach(function (d) { dayList.push(d) })
        dayList.sort(function (a, b) { return a.day < b.day ? -1 : a.day > b.day ? 1 : 0 })

        const weekMap = new Map()
        for (let i = 0; i < dayList.length; i++) {
          const d = dayList[i]
          const wk = weekKey(d.day)
          let w = weekMap.get(wk)
          if (w === undefined) { w = { day: wk, n: 0, i: 0, o: 0, r: 0, cr: 0, cw: 0, tt: 0, total: 0 }; weekMap.set(wk, w) }
          w.n += d.n
          w.i += d.i
          w.o += d.o
          w.r += d.r
          w.cr += d.cr
          w.cw += d.cw
          w.tt += d.tt
          w.total += d.total
        }
        const weekList = []
        weekMap.forEach(function (w) { weekList.push(w) })
        weekList.sort(function (a, b) { return a.day < b.day ? -1 : a.day > b.day ? 1 : 0 })

        const daysAllList = []
        let daysAllMax = 1
        daysAll.forEach(function (d) {
          daysAllList.push(d)
          if (d.total > daysAllMax) daysAllMax = d.total
        })
        daysAllList.sort(function (a, b) { return a.day < b.day ? -1 : a.day > b.day ? 1 : 0 })

        const agentList = []
        agents.forEach(function (a) {
          const prompt = a.i + a.cr + a.cw
          a.hit = prompt > 0 ? a.cr / prompt : 0
          agentList.push(a)
        })
        agentList.sort(function (x, y) { return y.total - x.total })

        return {
          totals: totals,
          prevTotals: prevTotals,
          vendors: vendorList,
          vendorColors: vendorColors,
          models: modelList.slice(0, 200),
          modelCountAll: modelList.length,
          topModels: topModels,
          days: dayList,
          weeks: weekList,
          daysAll: daysAllList,
          daysAllMax: daysAllMax,
          agentList: agentList,
          activeDays: dayList.length,
          tableTotals: tableTotals
        }
      }, [data, agent, range, sort, vendorF, modelQ])

      const projects = React.useMemo(function () {
        if (data === null || !data || !Array.isArray(data.projects)) return []
        return data.projects.filter(function (p) {
          return agent === 'all' || p.a === agent
        }).slice(0, 20)
      }, [data, agent])

      const chipAgents = React.useMemo(function () {
        const set = new Map()
        if (data !== null && data && Array.isArray(data.rows)) {
          for (let i = 0; i < data.rows.length; i++) {
            const r = data.rows[i]
            set.set(r.a, (set.get(r.a) || 0) + r.n)
          }
        }
        const out = []
        set.forEach(function (n, a) { out.push({ id: a, n: n }) })
        out.sort(function (x, y) { return y.n - x.n })
        return out
      }, [data])

      const vendorOpts = React.useMemo(function () {
        const set = {}
        if (data !== null && data && Array.isArray(data.rows)) {
          for (let i = 0; i < data.rows.length; i++) set[data.rows[i].v] = true
        }
        return Object.keys(set).sort()
      }, [data])

      const dayDetail = React.useMemo(function () {
        if (daySel === null || data === null || !data || !Array.isArray(data.rows)) return null
        const map = new Map()
        for (let i = 0; i < data.rows.length; i++) {
          const r = data.rows[i]
          if (r.d !== daySel) continue
          const k = r.a + '|' + r.m
          let e = map.get(k)
          if (e === undefined) {
            e = { a: r.a, v: r.v, m: r.m, n: 0, i: 0, o: 0, r: 0, cr: 0, cw: 0, tt: 0, total: 0 }
            map.set(k, e)
          }
          e.n += r.n
          e.i += r.i
          e.o += r.o
          e.r += r.r
          e.cr += r.cr
          e.cw += r.cw
          e.tt += r.tt || 0
          e.total += r.i + r.o + r.r + r.cr + r.cw + (r.tt || 0)
        }
        const list = []
        map.forEach(function (e) { list.push(e) })
        list.sort(function (a, b) { return b.total - a.total })
        return list
      }, [daySel, data])

      function modelSeries(m) {
        const out = []
        const rows = data !== null && data && Array.isArray(data.rows) ? data.rows : []
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i]
          if (r.a === m.a && r.p === m.p && r.v === m.v && r.m === m.m && r.d !== '') {
            out.push({ day: r.d, total: r.i + r.o + r.r + r.cr + r.cw + (r.tt || 0) })
          }
        }
        out.sort(function (x, y) { return x.day < y.day ? -1 : x.day > y.day ? 1 : 0 })
        return out
      }

      const rangeLabel = range === 0 ? '全部时间' : '近 ' + range + ' 天'

      const cards = view === null ? [] : [
        { label: '总 Tokens', value: fmtNum(view.totals.total), extra: fmtInt(view.totals.total), cur: view.totals.total, prev: view.prevTotals.total, acc: '#5b8def' },
        { label: '缓存命中率', value: fmtPct(view.totals.hit), extra: '缓存读 ÷ 提示词总量', cur: view.totals.hit, prev: view.prevTotals.hit, acc: '#3ecf8e' },
        { label: '输入(未缓存)', value: fmtNum(view.totals.i), extra: fmtInt(view.totals.i), cur: view.totals.i, prev: view.prevTotals.i, acc: '#e8a23d' },
        { label: '输出', value: fmtNum(view.totals.o), extra: '推理 ' + fmtNum(view.totals.r), cur: view.totals.o, prev: view.prevTotals.o, acc: '#8fbf4b' },
        { label: '缓存读', value: fmtNum(view.totals.cr), extra: fmtInt(view.totals.cr), cur: view.totals.cr, prev: view.prevTotals.cr, acc: '#5b8def' },
        { label: '缓存写', value: fmtNum(view.totals.cw), extra: fmtInt(view.totals.cw), cur: view.totals.cw, prev: view.prevTotals.cw, acc: '#a97bef' },
        { label: '费用(上报)', value: fmtCost(view.totals.c), extra: '另估算 +' + fmtCost(view.totals.ec), cur: view.totals.c, prev: view.prevTotals.c, acc: '#f78fb3' },
        { label: '请求数', value: fmtInt(view.totals.n), extra: '活跃 ' + view.activeDays + ' 天', cur: view.totals.n, prev: view.prevTotals.n, acc: '#4bc0c0' }
      ]

      const cols = [
        { key: 'a', label: 'Agent', num: false },
        { key: 'v', label: '厂商', num: false },
        { key: 'p', label: 'Provider', num: false },
        { key: 'm', label: '模型', num: false },
        { key: 'n', label: '请求', num: true },
        { key: 'i', label: '输入', num: true },
        { key: 'o', label: '输出', num: true },
        { key: 'r', label: '推理', num: true },
        { key: 'cr', label: '缓存读', num: true },
        { key: 'cw', label: '缓存写', num: true },
        { key: 'tt', label: '仅总量', num: true },
        { key: 'total', label: '合计', num: true },
        { key: 'hit', label: '命中率', num: true },
        { key: 'c', label: '费用', num: true },
        { key: 'ec', label: '估算$', num: true }
      ]

      function legendItem(color, label) {
        return h('span', { key: label }, h('i', { style: { background: color } }), label)
      }

      function cmpBar(v, max, color) {
        return h('span', { className: 'lts-cmp-track' },
          h('span', { className: 'lts-cmp-bar', style: { width: Math.max(2, (v / max) * 100) + '%', background: color } }))
      }

      function periodCard(title, t, showDelta, base) {
        const items = [
          ['总 Tokens', fmtNum(t.total), t.total, base ? base.total : 0],
          ['请求数', fmtInt(t.n), t.n, base ? base.n : 0],
          ['输入(未缓存)', fmtNum(t.i), t.i, base ? base.i : 0],
          ['输出', fmtNum(t.o), t.o, base ? base.o : 0],
          ['缓存读', fmtNum(t.cr), t.cr, base ? base.cr : 0],
          ['缓存命中率', fmtPct(t.hit), t.hit, base ? base.hit : 0],
          ['费用(上报)', fmtCost(t.c), t.c, base ? base.c : 0],
          ['费用(估算)', fmtCost(t.ec), t.ec, base ? base.ec : 0]
        ]
        return h('div', { className: 'lts-period-card' },
          h('div', { className: 'lts-period-title' }, title),
          items.map(function (it) {
            return h('div', { key: it[0], className: 'lts-period-row' },
              h('span', null, it[0]),
              h('span', null, it[1], showDelta ? h(DeltaBadge, { cur: it[2], prev: it[3] }) : null))
          }))
      }

      const ledgerInfo = data !== null && data.ledger ? data.ledger : null

      let body = null
      if (view === null) {
        body = h('div', { className: 'lts-empty' }, error !== null ? '暂无数据' : '正在扫描本地对话记录,首次加载约需 10~30 秒…')
      } else {
        let maxAgentT = 1
        let maxAgentN = 1
        for (let i = 0; i < view.agentList.length; i++) {
          if (view.agentList[i].total > maxAgentT) maxAgentT = view.agentList[i].total
          if (view.agentList[i].n > maxAgentN) maxAgentN = view.agentList[i].n
        }
        const agentRows = view.agentList.map(function (a) {
          return h('tr', { key: a.id },
            h('td', { style: { textAlign: 'left' } }, AGENT_LABELS[a.id] || a.id),
            h('td', { style: { textAlign: 'left' } }, cmpBar(a.total, maxAgentT, '#5b8def'), h('span', { className: 'lts-mono' }, fmtNum(a.total))),
            h('td', { style: { textAlign: 'left' } }, cmpBar(a.n, maxAgentN, '#3ecf8e'), h('span', { className: 'lts-mono' }, fmtInt(a.n))),
            h('td', { style: { textAlign: 'left' } }, cmpBar(a.hit, 1, '#e8a23d'), h('span', { className: 'lts-mono' }, fmtPct(a.hit))),
            h('td', { style: { textAlign: 'left' }, className: 'lts-mono' }, (a.c > 0 ? fmtCost(a.c) : '—') + (a.ec > 0 ? ' +估' + fmtCost(a.ec) : '')))
        })

        const modelRows = []
        for (let mi = 0; mi < view.models.length; mi++) {
          const m = view.models[mi]
          const mKey = m.a + '|' + m.p + '|' + m.v + '|' + m.m
          modelRows.push(h('tr', {
            key: mKey,
            style: { cursor: 'pointer' },
            onClick: function () { setExpanded(expanded === mKey ? null : mKey) }
          },
            h('td', { style: { textAlign: 'left' } }, (expanded === mKey ? '▾ ' : '▸ ') + (AGENT_LABELS[m.a] || m.a)),
            h('td', { style: { textAlign: 'left' } }, m.v),
            h('td', { style: { textAlign: 'left' } }, m.p),
            h('td', { style: { textAlign: 'left' } }, h('span', { className: 'lts-pill', title: m.m }, m.m)),
            h('td', { className: 'lts-mono' }, fmtInt(m.n)),
            h('td', { className: 'lts-mono' }, m.i > 0 ? fmtNum(m.i) : '—'),
            h('td', { className: 'lts-mono' }, m.o > 0 ? fmtNum(m.o) : '—'),
            h('td', { className: 'lts-mono' }, m.r > 0 ? fmtNum(m.r) : '—'),
            h('td', { className: 'lts-mono' }, m.cr > 0 ? fmtNum(m.cr) : '—'),
            h('td', { className: 'lts-mono' }, m.cw > 0 ? fmtNum(m.cw) : '—'),
            h('td', { className: 'lts-mono' }, m.tt > 0 ? fmtNum(m.tt) : '—'),
            h('td', { className: 'lts-mono lts-strong' }, fmtNum(m.total)),
            h('td', { className: 'lts-mono' }, m.prompt > 0 ? fmtPct(m.hit) : '—'),
            h('td', { className: 'lts-mono' }, m.c > 0 ? fmtCost(m.c) : '—'),
            h('td', { className: 'lts-mono' }, m.ec > 0 ? fmtCost(m.ec) : '—')))
          if (expanded === mKey) {
            modelRows.push(h('tr', { key: mKey + '-x', className: 'lts-expand' },
              h('td', { colSpan: 15 },
                h('div', { className: 'lts-expand-hint' }, (AGENT_LABELS[m.a] || m.a) + ' · ' + m.m + ' — 每日总量(最近 45 个活跃日)'),
                h(MiniBars, { days: modelSeries(m), color: view.vendorColors[m.v] || 'var(--dsw-alias-brand-primary)' }))))
          }
        }

        const overviewTab = h('div', null,
          h('div', { className: 'lts-cards' }, cards.map(function (c) {
            return h('div', { key: c.label, className: 'lts-card', style: { '--lts-acc': c.acc } },
              h('div', { className: 'lts-card-label' }, c.label),
              h('div', { className: 'lts-card-value' }, c.value),
              range > 0
                ? h('div', { className: 'lts-card-delta' }, h(DeltaBadge, { cur: c.cur, prev: c.prev }), h('span', { className: 'lts-card-delta-label' }, '较上期'))
                : h('div', { className: 'lts-card-delta' }),
              h('div', { className: 'lts-card-extra' }, c.extra))
          })),
          h('div', { className: 'lts-grid2' },
            h('div', { className: 'lts-section' },
              h('h3', null, '厂商份额', h('span', { className: 'lts-section-note' }, '点击图例可筛选')),
              h(Donut, {
                slices: view.vendors.map(function (v) {
                  return { label: v.name, value: v.total, color: view.vendorColors[v.name] }
                }),
                centerLabel: '总 Tokens',
                onPick: function (name) { setVendorF(vendorF === name ? 'all' : name) }
              })),
            h('div', { className: 'lts-section' },
              h('h3', null, '提示词构成与命中率'),
              h(Donut, {
                slices: [
                  { label: '缓存读(命中)', value: view.totals.cr, color: '#5b8def' },
                  { label: '未缓存输入', value: view.totals.i, color: '#e8a23d' },
                  { label: '缓存写', value: view.totals.cw, color: '#a97bef' }
                ],
                centerValue: fmtPct(view.totals.hit),
                centerLabel: '缓存命中率'
              }))),
          h('div', { className: 'lts-section' },
            h('h3', null, 'Top 模型(按总 Tokens)', h('span', { className: 'lts-section-note' }, '点击条形 → 明细页筛选该模型')),
            h(HBars, {
              items: view.topModels.map(function (m, i) {
                return {
                  label: m.m,
                  raw: m.m,
                  value: m.total,
                  color: PALETTE[i % PALETTE.length],
                  title: (AGENT_LABELS[m.a] || m.a) + ' · ' + m.m + ' · ' + fmtInt(m.total) + ' tokens · ' + fmtInt(m.n) + ' 次请求 · 命中率 ' + fmtPct(m.hit)
                }
              }),
              onPick: function (it) { setModelQ(it.raw); setTab('detail') }
            })))

        const trendTab = h('div', null,
          h('div', { className: 'lts-section' },
            h('h3', null, 'Token 趋势(堆叠)',
              h('span', { className: 'lts-section-note' },
                h('button', { className: 'lts-chip' + (gran === 'day' ? ' lts-chip-on' : ''), onClick: function () { setGran('day') } }, '按日'),
                ' ',
                h('button', { className: 'lts-chip' + (gran === 'week' ? ' lts-chip-on' : ''), onClick: function () { setGran('week') } }, '按周'))),
            h('div', { className: 'lts-legend' },
              legendItem('#5b8def', '缓存读'),
              legendItem('#a97bef', '缓存写'),
              legendItem('#e8a23d', '输入'),
              legendItem('#c9a86a', '仅总量'),
              legendItem('#7f8c9b', '推理'),
              legendItem('#3ecf8e', '输出')),
            h(TrendChart, { days: gran === 'week' ? view.weeks : view.days, gran: gran, onPickDay: function (ds) { setDaySel(ds) } })),
          h('div', { className: 'lts-section' },
            h('h3', null, '活跃热力图'),
            h(Heatmap, { days: view.daysAll, max: view.daysAllMax, onPickDay: function (ds) { setDaySel(ds) } })))

        const compareTab = h('div', null,
          h('div', { className: 'lts-section' },
            h('h3', null, '时间段对比',
              h('span', { className: 'lts-section-note' }, range === 0 ? '选择近 7/30/90 天以启用环比' : '上期 = 当前窗口再往前一个等长周期')),
            h('div', { className: 'lts-period-grid' },
              periodCard('当前(' + rangeLabel + ')', view.totals, range > 0, view.prevTotals),
              range > 0
                ? periodCard('上期(再往前 ' + range + ' 天)', view.prevTotals, false, null)
                : h('div', { className: 'lts-period-card' },
                  h('div', { className: 'lts-period-title' }, '上期'),
                  h('div', { className: 'lts-heat-hint' }, '当前为「全部时间」,无环比对象')))),
          h('div', { className: 'lts-section' },
            h('h3', null, 'Agent 横向对比(当前范围)'),
            agentRows.length === 0
              ? h('div', { className: 'lts-empty' }, '暂无数据')
              : h('div', { className: 'lts-table-scroll' },
                h('table', { className: 'lts-table' },
                  h('thead', null, h('tr', null,
                    h('th', { style: { textAlign: 'left' } }, 'Agent'),
                    h('th', { style: { textAlign: 'left' } }, '总 Tokens'),
                    h('th', { style: { textAlign: 'left' } }, '请求数'),
                    h('th', { style: { textAlign: 'left' } }, '缓存命中率'),
                    h('th', { style: { textAlign: 'left' } }, '费用'))),
                  h('tbody', null, agentRows)))),
          h('div', { className: 'lts-section' },
            h('h3', null, '厂商总量对比', h('span', { className: 'lts-section-note' }, '点击条形筛选该厂商')),
            h(HBars, {
              items: view.vendors.slice(0, 10).map(function (v) {
                return {
                  label: v.name,
                  raw: v.name,
                  value: v.total,
                  color: view.vendorColors[v.name],
                  title: v.name + ' · ' + fmtInt(v.total) + ' tokens · ' + v.modelCount + ' 个模型 · 命中率 ' + fmtPct(v.hit)
                }
              }),
              onPick: function (it) { setVendorF(vendorF === it.raw ? 'all' : it.raw) }
            })))

        const detailTab = h('div', null,
          h('div', { className: 'lts-section' },
            h('h3', null, '模型明细(' + view.models.length + (view.modelCountAll > view.models.length ? ' / ' + view.modelCountAll : '') + ')',
              h('span', { className: 'lts-section-note' }, '点击表头排序 · 点击行展开每日趋势')),
            h('div', { className: 'lts-table-scroll' },
              h('table', { className: 'lts-table' },
                h('thead', null, h('tr', null, cols.map(function (col) {
                  return h('th', {
                    key: col.key,
                    style: col.num ? undefined : { textAlign: 'left' },
                    onClick: function () {
                      setSort(function (s) {
                        return s.key === col.key ? { key: col.key, desc: !s.desc } : { key: col.key, desc: true }
                      })
                    }
                  }, col.label + (sort.key === col.key ? (sort.desc ? ' ↓' : ' ↑') : ''))
                }))),
                h('tbody', null, modelRows),
                h('tfoot', null,
                  h('tr', null,
                    h('td', { style: { textAlign: 'left' }, colSpan: 4 }, '合计 · 当前筛选 ' + view.tableTotals.count + ' 个模型'),
                    h('td', { className: 'lts-mono' }, fmtInt(view.tableTotals.n)),
                    h('td', { className: 'lts-mono' }, fmtNum(view.tableTotals.i)),
                    h('td', { className: 'lts-mono' }, fmtNum(view.tableTotals.o)),
                    h('td', { className: 'lts-mono' }, fmtNum(view.tableTotals.r)),
                    h('td', { className: 'lts-mono' }, fmtNum(view.tableTotals.cr)),
                    h('td', { className: 'lts-mono' }, fmtNum(view.tableTotals.cw)),
                    h('td', { className: 'lts-mono' }, fmtNum(view.tableTotals.tt)),
                    h('td', { className: 'lts-mono lts-strong' }, fmtNum(view.tableTotals.total)),
                    h('td', { className: 'lts-mono' }, fmtPct(view.tableTotals.hit)),
                    h('td', { className: 'lts-mono' }, fmtCost(view.tableTotals.c)),
                    h('td', { className: 'lts-mono' }, fmtCost(view.tableTotals.ec))))))),
          h('div', { className: 'lts-section' },
            h('h3', null, '项目/目录 Top 20(全部时间)'),
            projects.length === 0
              ? h('div', { className: 'lts-empty' }, '暂无数据')
              : h('div', { className: 'lts-table-scroll' },
                h('table', { className: 'lts-table' },
                  h('thead', null, h('tr', null,
                    h('th', { style: { textAlign: 'left' } }, 'Agent'),
                    h('th', { style: { textAlign: 'left' } }, '项目'),
                    h('th', null, '请求'),
                    h('th', null, '总 Tokens'),
                    h('th', { style: { textAlign: 'left' } }, '最近活动'))),
                  h('tbody', null, projects.map(function (p, i) {
                    return h('tr', { key: p.a + '|' + p.name + '|' + i },
                      h('td', { style: { textAlign: 'left' } }, AGENT_LABELS[p.a] || p.a),
                      h('td', { style: { textAlign: 'left' }, className: 'lts-model', title: p.name }, shortPath(p.name)),
                      h('td', { className: 'lts-mono' }, fmtInt(p.n)),
                      h('td', { className: 'lts-mono lts-strong' }, fmtNum(p.total)),
                      h('td', { style: { textAlign: 'left' } }, fmtTime(p.lastAt)))
                  }))))))

        const sourcesTab = h('div', null,
          h('div', { className: 'lts-section' },
            h('h3', null, '数据源状态'),
            h('div', { className: 'lts-src-grid' }, (data.sources || []).map(function (s) {
              return h('div', { key: s.id, className: 'lts-src' },
                h('div', null,
                  h('span', { className: 'lts-dot lts-dot-' + s.status }),
                  h('strong', null, s.label),
                  h('span', { className: 'lts-src-status' }, STATUS_LABELS[s.status] || s.status)),
                h('div', { className: 'lts-src-detail' }, s.detail || ''),
                s.lastActivityAt > 0 ? h('div', { className: 'lts-src-detail' }, '最近活动 ' + fmtTime(s.lastActivityAt)) : null,
                s.error ? h('div', { className: 'lts-src-error' }, String(s.error).slice(0, 200)) : null)
            }))),
          h('div', { className: 'lts-note' }, '统计口径:合计 = 输入 + 输出 + 推理 + 缓存读 + 缓存写 + 仅总量;命中率 = 缓存读 ÷ (输入 + 缓存读 + 缓存写);续接会话的重复消息已按消息 ID 去重。台账采用增量棘轮合并:每个「来源×模型×日」只累加正增量,重复扫描不会重复计数,源日志删除后历史自动留存(状态显示为「历史留存」)。CodeWhale 只有会话级总量并按创建日归属;WorkBuddy 上报的输入可能已含缓存命中部分;Claude Code 的本地网关未回传 usage,请求数计入但 token 为 0。Cursor(IDE)的请求数/换算费用来自官方 usageData,token 明细来自对话气泡的 tokenCount(仅部分版本记录,多模型会话按请求数比例分摊),费用为按 API 价折算,订阅用户实际不按此扣费。「估算$」为内置参考价目表(按模型族匹配,USD/百万 token)对未上报费用来源的估算,价目可能滞后于真实定价,仅作参考;上报费用与估算费用永不混算。Codex 按会话级 token_count 快照归属到会话起始日;fork/续接会话在消息 ID 之外另按「时间戳×模型×token 指纹」复合去重。Hermes 接入 state.db sessions 表(token 列有数据后自动入账);通义灵码聊天内容加密,仅能探测会话/请求数;Pi 解析器已预置,产生会话后自动接入。'))

        const dayDetailSection = daySel === null ? null : h('div', { className: 'lts-section lts-daysel' },
          h('h3', null, '📅 ' + daySel + ' 当日明细',
            h('span', { className: 'lts-section-note' }, (dayDetail === null ? 0 : dayDetail.length) + ' 个模型 · 含全部来源(不受筛选影响)'),
            h('button', { className: 'lts-dayclose', onClick: function () { setDaySel(null) } }, '✕ 关闭')),
          dayDetail === null || dayDetail.length === 0
            ? h('div', { className: 'lts-empty' }, '当日无记录')
            : h('div', { className: 'lts-table-scroll' },
              h('table', { className: 'lts-table' },
                h('thead', null, h('tr', null,
                  h('th', { style: { textAlign: 'left' } }, 'Agent'),
                  h('th', { style: { textAlign: 'left' } }, '厂商'),
                  h('th', { style: { textAlign: 'left' } }, '模型'),
                  h('th', null, '请求'),
                  h('th', null, '输入'),
                  h('th', null, '输出'),
                  h('th', null, '推理'),
                  h('th', null, '缓存读'),
                  h('th', null, '合计'))),
                h('tbody', null, dayDetail.slice(0, 60).map(function (e, i) {
                  return h('tr', { key: i },
                    h('td', { style: { textAlign: 'left' } }, AGENT_LABELS[e.a] || e.a),
                    h('td', { style: { textAlign: 'left' } }, e.v),
                    h('td', { style: { textAlign: 'left' } }, h('span', { className: 'lts-pill', title: e.m }, e.m)),
                    h('td', { className: 'lts-mono' }, fmtInt(e.n)),
                    h('td', { className: 'lts-mono' }, e.i > 0 ? fmtNum(e.i) : '—'),
                    h('td', { className: 'lts-mono' }, e.o > 0 ? fmtNum(e.o) : '—'),
                    h('td', { className: 'lts-mono' }, e.r > 0 ? fmtNum(e.r) : '—'),
                    h('td', { className: 'lts-mono' }, e.cr > 0 ? fmtNum(e.cr) : '—'),
                    h('td', { className: 'lts-mono lts-strong' }, fmtNum(e.total)))
                })))))

        body = h('div', null,
          h('div', { className: 'lts-toolbar' },
            h('div', { className: 'lts-filters' },
              h('span', { className: 'lts-filter-label' }, '来源'),
              h('button', { className: 'lts-chip' + (agent === 'all' ? ' lts-chip-on' : ''), onClick: function () { setAgent('all') } }, '全部'),
              chipAgents.map(function (a) {
                return h('button', { key: a.id, className: 'lts-chip' + (agent === a.id ? ' lts-chip-on' : ''), onClick: function () { setAgent(agent === a.id ? 'all' : a.id) } }, AGENT_LABELS[a.id] || a.id)
              }),
              h('span', { className: 'lts-filter-label', style: { marginLeft: '10px' } }, '时间'),
              [7, 30, 90, 0].map(function (d) {
                return h('button', { key: 'r' + d, className: 'lts-chip' + (range === d ? ' lts-chip-on' : ''), onClick: function () { setRange(d) } }, d === 0 ? '全部' : '近 ' + d + ' 天')
              }),
              h('select', { className: 'lts-select', value: vendorF, onChange: function (e) { setVendorF(e.target.value) }, title: '按厂商筛选(也可点击环形图/厂商条形)' },
                h('option', { value: 'all' }, '全部厂商'),
                vendorOpts.map(function (v) { return h('option', { key: v, value: v }, v) })),
              h('div', { className: 'lts-search' },
                h('input', { className: 'lts-search-input', type: 'text', placeholder: '搜索模型…', value: modelQ, onChange: function (e) { setModelQ(e.target.value) } }),
                modelQ !== '' ? h('button', { className: 'lts-search-clear', onClick: function () { setModelQ('') } }, '✕') : null)),
            (agent !== 'all' || vendorF !== 'all' || modelQ.trim() !== '' || range !== 30)
              ? h('div', { className: 'lts-active-filters' },
                h('span', { className: 'lts-filter-label' }, '已筛选'),
                agent !== 'all' ? h('button', { key: 'fa', className: 'lts-fchip', onClick: function () { setAgent('all') } }, (AGENT_LABELS[agent] || agent) + ' ✕') : null,
                vendorF !== 'all' ? h('button', { key: 'fv', className: 'lts-fchip', onClick: function () { setVendorF('all') } }, '厂商: ' + vendorF + ' ✕') : null,
                modelQ.trim() !== '' ? h('button', { key: 'fm', className: 'lts-fchip', onClick: function () { setModelQ('') } }, '模型含「' + modelQ.trim() + '」✕') : null,
                range !== 30 ? h('button', { key: 'fr', className: 'lts-fchip', onClick: function () { setRange(30) } }, rangeLabel + ' ✕') : null,
                h('button', { key: 'fc', className: 'lts-fchip lts-fchip-clear', onClick: function () { setAgent('all'); setVendorF('all'); setModelQ(''); setRange(30) } }, '清空全部'))
              : null,
            h('div', { className: 'lts-tabs' }, TABS.map(function (t) {
              return h('button', { key: t.id, className: 'lts-tab' + (tab === t.id ? ' lts-tab-on' : ''), onClick: function () { setTab(t.id) } }, t.label)
            }))),
          dayDetailSection,
          view.totals.total === 0 && view.totals.n === 0
            ? h('div', { className: 'lts-empty' }, '当前筛选范围内无数据 —— 可点「清空全部」,或把时间切到「全部」查看历史来源')
            : null,
          tab === 'overview' ? overviewTab : null,
          tab === 'trend' ? trendTab : null,
          tab === 'compare' ? compareTab : null,
          tab === 'detail' ? detailTab : null,
          tab === 'sources' ? sourcesTab : null)
      }

      return h('div', { className: 'lts-scroll' },
        h('div', { className: 'lts-root' },
          h('div', { className: 'lts-header' },
            h('div', { className: 'lts-header-main' },
              h('h1', { className: 'lts-title' }, 'Agent Token 用量看板'),
              h('div', { className: 'lts-meta' },
                data !== null
                  ? h('span', {
                    title: ledgerInfo !== null
                      ? (ledgerInfo.persisted
                        ? '📒 台账: ' + ledgerInfo.path + '(保存于 ' + fmtTime(ledgerInfo.savedAt) + ')· 删除聊天记录后历史统计仍保留'
                        : '⚠️ 台账保存失败: ' + String(ledgerInfo.error || '未知错误'))
                      : ''
                  }, '更新于 ' + fmtTime(data.generatedAt) + ' · ' + (data.sources || []).filter(function (s) { return s.status === 'ok' || s.status === 'archived' }).length + ' 路数据源' + (ledgerInfo !== null ? (ledgerInfo.persisted ? ' · 📒 台账已持久化' : ' · ⚠️ 台账保存失败') : ''))
                  : h('span', null, '正在加载…'),
                loading && data !== null ? h('span', { className: 'lts-spin' }, '刷新中…') : null)),
            h('div', null,
              h('div', { className: 'lts-actions' },
                h('label', { className: 'lts-auto' },
                  h('input', { type: 'checkbox', checked: auto, onChange: function (e) { setAuto(e.target.checked) } }),
                  '自动刷新(2 分钟)'),
                h('button', { className: 'lts-btn', disabled: exporting, onClick: doExport }, exporting ? '导出中…' : '导出 CSV'),
                h('button', { className: 'lts-btn lts-btn-primary', disabled: loading, onClick: function () { load(true) } }, loading ? '刷新中…' : '立即刷新')),
              exportMsg !== null ? h('div', { className: 'lts-export-msg' }, exportMsg) : null)),
          error !== null ? h('div', { className: 'lts-error-banner' }, '刷新失败: ' + error + (data !== null ? '(正在显示上次数据)' : '')) : null,
          body))
    }

    slots.inject('main', function () {
      slots.register({ name: 'main', key: 'llm-token-stats' }, function () {
        return React.createElement(Dashboard)
      })
    })
    slots.inject('sidebar.panellist', function () {
      slots.register({ name: 'sidebar.panellist', id: 'llm-token-stats', label: 'Token 用量', order: 60 }, function (props) {
        return React.createElement(PanelIcon, props)
      })
    })

    }
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
