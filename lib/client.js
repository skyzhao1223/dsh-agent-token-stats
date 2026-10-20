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
      { id: 'sessions', label: '会话' },
      { id: 'sources', label: '数据源' }
    ]
    // host 的 /sessions 只支持这三个来源。
    const SESSION_AGENTS = ['opencode', 'codewhale', 'cursor']
    // 顶部筛选器对哪些页有意义:会话页用自己的来源选择,数据源页永远展示全部来源。
    const FILTER_TABS = { overview: true, trend: true, compare: true, detail: true, sessions: false, sources: false }

    const CSS = [
      '.lts-scroll{height:100%;overflow-y:auto;overscroll-behavior:contain;}',
      // 主题对齐:这个 harness 里 --dsw-alias-brand-primary 是「强反差中性色」
      // (亮 #0f1115 / 暗 #f9fafb),拿它当填充色再配 #fff 文字,暗色下就是白底白字
      // (对比度 1.05)。填充控件一律 label-primary 打底 + bg-base 文字,与原生主按钮
      // 完全一致;状态色只用于填充/描边,文本另配深/浅两套变体。
      '.lts-root{--lts-ok:#15803d;--lts-warn:#b45309;--lts-err:#b91c1c;--lts-sh-1:0 1px 4px rgba(0,0,0,.14);--lts-sh-2:0 8px 24px rgba(0,0,0,.09);--lts-sh-3:0 8px 24px rgba(0,0,0,.2);--lts-glow:0 2px 10px rgba(0,0,0,.18);--lts-ring:rgba(15,17,21,.16);--lts-pad-x:24px;padding:18px var(--lts-pad-x) 48px;max-width:1200px;margin:0 auto;color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.55;}',
      'body[data-ds-dark-theme] .lts-root{--lts-ok:#4ade80;--lts-warn:#fbbf24;--lts-err:#f87171;--lts-sh-1:0 1px 4px rgba(0,0,0,.45);--lts-sh-2:0 8px 24px rgba(0,0,0,.5);--lts-sh-3:0 10px 28px rgba(0,0,0,.6);--lts-glow:0 2px 10px rgba(0,0,0,.5);--lts-ring:rgba(249,250,251,.22);}',
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
      '.lts-btn-primary{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base);}',
      '.lts-btn-primary:hover{color:var(--dsw-alias-bg-base);opacity:.9;box-shadow:0 4px 14px var(--lts-glow);}',
      '.lts-toolbar{position:sticky;top:-18px;z-index:30;margin:12px calc(-1 * var(--lts-pad-x)) 0;padding:26px var(--lts-pad-x) 0;background:var(--dsw-alias-bg-base);border-bottom:1px solid var(--dsw-alias-border-l1);}',
      '.lts-filters{display:flex;gap:6px;align-items:center;flex-wrap:wrap;}',
      '.lts-filter-label{color:var(--dsw-alias-label-secondary);font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;margin-right:2px;font-weight:600;}',
      '.lts-chip{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);border-radius:8px;padding:3px 11px;cursor:pointer;font-size:12px;font-weight:500;transition:all .15s ease;}',
      '.lts-chip:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);transform:translateY(-1px);}',
      '.lts-chip-on{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base);box-shadow:0 2px 10px var(--lts-glow);}',
      '.lts-chip-on:hover{color:var(--dsw-alias-bg-base);}',
      '.lts-select{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:3px 8px;font-size:12px;cursor:pointer;outline:none;transition:border-color .15s;margin-left:10px;}',
      '.lts-select:hover{border-color:var(--dsw-alias-border-l2);}',
      '.lts-select:focus{border-color:var(--dsw-alias-brand-primary);}',
      '.lts-search{position:relative;display:inline-flex;align-items:center;margin-left:8px;}',
      '.lts-search-input{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:4px 24px 4px 10px;font-size:12px;width:130px;outline:none;transition:all .18s ease;}',
      '.lts-search-input::placeholder{color:var(--dsw-alias-label-secondary);opacity:.7;}',
      '.lts-search-input:focus{border-color:var(--dsw-alias-brand-primary);width:180px;box-shadow:0 0 0 2px var(--lts-ring);}',
      '.lts-search-clear{position:absolute;right:3px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:11px;padding:2px 5px;border-radius:4px;}',
      '.lts-search-clear:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);}',
      '.lts-active-filters{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:8px;}',
      '.lts-fchip{border:1px solid var(--dsw-alias-brand-primary);background:transparent;color:var(--dsw-alias-brand-primary);border-radius:7px;padding:2px 9px;font-size:11px;cursor:pointer;transition:all .12s;font-weight:500;}',
      '.lts-fchip:hover{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base);}',
      '.lts-fchip-clear{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);}',
      '.lts-fchip-clear:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.lts-tabs{display:inline-flex;gap:2px;margin:10px 0 8px;padding:3px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:11px;flex-wrap:wrap;}',
      '.lts-tab{border:none;background:transparent;color:var(--dsw-alias-label-secondary);padding:5px 15px;cursor:pointer;font-size:12.5px;font-weight:500;border-radius:8px;transition:all .15s ease;}',
      '.lts-tab:hover{color:var(--dsw-alias-label-primary);}',
      '.lts-tab-on{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-weight:650;box-shadow:var(--lts-sh-1);}',
      '.lts-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:10px;margin:12px 0;}',
      '.lts-card{position:relative;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;padding:13px 15px 12px;min-width:0;overflow:hidden;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease;}',
      '.lts-card:hover{transform:translateY(-2px);box-shadow:var(--lts-sh-2);border-color:var(--dsw-alias-border-l2);}',
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
      '.lts-tip{position:fixed;z-index:1000;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:9px 12px;font-size:11.5px;line-height:1.65;pointer-events:none;box-shadow:var(--lts-sh-3);min-width:150px;max-width:220px;color:var(--dsw-alias-label-primary);}',
      '.lts-tip-title{font-weight:650;margin-bottom:2px;}',
      '.lts-tip-hint{color:var(--dsw-alias-label-secondary);font-size:10px;margin-top:3px;}',
      '.lts-heat{display:flex;gap:3px;overflow-x:auto;padding:5px 3px 7px;}',
      '.lts-heat-months{display:flex;gap:3px;font-size:9px;color:var(--dsw-alias-label-secondary);margin-bottom:3px;padding:0 3px;}',
      '.lts-heat-month{width:11px;flex:none;overflow:visible;white-space:nowrap;}',
      '.lts-heat-col{display:flex;flex-direction:column;gap:3px;}',
      '.lts-heat-cell{width:11px;height:11px;border-radius:3px;background:var(--dsw-alias-bg-layer-2);transition:transform .1s ease;}',
      '.lts-heat-cell:hover{transform:scale(1.3);}',
      '.lts-heat-click{cursor:pointer;}',
      '.lts-heat-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:6px;flex-wrap:wrap;}',
      '.lts-heat-hint{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:4px;}',
      '.lts-heat-scale{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--dsw-alias-label-secondary);}',
      '.lts-heat-scale i{width:10px;height:10px;border-radius:3px;background:var(--dsw-alias-brand-primary);display:inline-block;}',
      // 兜底值:实际偏移由 JS 在滚动那一刻量吸顶工具条的真实高度后内联覆盖
      // (窄屏筛选器换行 → 工具条更高,写死一个更小的值只会让明细藏到工具条底下)。
      '.lts-daysel{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary);scroll-margin-top:130px;}',
      '.lts-dayclose{margin-left:auto;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:7px;padding:2px 10px;font-size:11px;cursor:pointer;transition:all .12s;}',
      '.lts-dayclose:hover{color:var(--lts-err);border-color:var(--lts-err);}',
      '.lts-delta{font-size:11px;margin-left:8px;white-space:nowrap;font-weight:600;}',
      '.lts-delta-up{color:var(--lts-err);}',
      '.lts-delta-down{color:var(--lts-ok);}',
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
      '.lts-src-error{color:var(--lts-err);font-size:11px;margin-top:4px;word-break:break-all;}',
      '.lts-empty{color:var(--dsw-alias-label-secondary);padding:24px;text-align:center;font-size:12.5px;}',
      '.lts-error-banner{border:1px solid var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);border-radius:12px;padding:10px 14px;margin:12px 0;font-size:12px;background:var(--dsw-alias-bg-layer-1);}',
      '.lts-note{color:var(--dsw-alias-label-secondary);font-size:11px;margin-top:12px;padding:12px 16px;border-left:3px solid var(--dsw-alias-border-l2);border-radius:0 10px 10px 0;background:var(--dsw-alias-bg-layer-1);line-height:1.8;}',
      '.lts-budget-banner{border:1px solid var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-state-error-primary);border-radius:12px;padding:10px 14px;margin:10px 0;font-size:12.5px;font-weight:600;}',
      '.lts-drift-badge{color:var(--lts-warn);font-size:10.5px;margin-left:6px;font-weight:650;cursor:help;}',
      '.lts-lang-btn{min-width:44px;text-align:center;}',
      // —— UX 补充:原生可聚焦控件(按钮/输入/下拉/页签)统一焦点环,不改布局;页签另有方向键。
      // 注意:热力格、条形图、图例、表格行/表头是 div/tr/th + onClick,仍然只支持鼠标 ——
      // 把 180 个热力格塞进 tab 序列比不给更糟,所以这里不宣称「全键盘可达」。
      '.lts-root button:focus-visible,.lts-root [tabindex]:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px;}',
      '.lts-select:focus-visible,.lts-search-input:focus-visible{box-shadow:0 0 0 2px var(--lts-ring);}',
      '.lts-chip:disabled{opacity:.45;cursor:default;transform:none;color:var(--dsw-alias-label-secondary);}',
      '.lts-chip:disabled:hover{border-color:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);transform:none;}',
      '.lts-chip-dim{opacity:.55;}',
      // —— UX 补充:首屏骨架(用主题的 bg-skeleton,按同结构铺位,避免「只有一行字」的空等)
      '.lts-sk{background:var(--dsw-alias-bg-skeleton,var(--dsw-alias-bg-layer-2));border-radius:7px;position:relative;overflow:hidden;}',
      '.lts-sk::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,var(--dsw-alias-bg-layer-2),transparent);animation:lts-sweep 1.5s ease-in-out infinite;}',
      '@keyframes lts-sweep{100%{transform:translateX(100%)}}',
      '.lts-sk-card{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;padding:13px 15px 12px;}',
      '.lts-sk-h{height:10px;width:56%;margin-bottom:10px;}',
      '.lts-sk-v{height:22px;width:72%;margin-bottom:10px;}',
      '.lts-sk-s{height:9px;width:40%;}',
      '.lts-sk-section{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:16px;padding:14px 16px;margin:10px 0;}',
      '.lts-sk-row{height:11px;margin:0 0 9px;}',
      // —— UX 补充:扫描 / 数据新鲜度状态条
      '.lts-status{display:flex;align-items:center;gap:9px;flex-wrap:wrap;font-size:12px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:12px;padding:8px 13px;margin:10px 0;color:var(--dsw-alias-label-secondary);}',
      '.lts-status-strong{color:var(--dsw-alias-label-primary);font-weight:600;}',
      '.lts-pulse{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-brand-primary);flex:none;animation:lts-pulse 1.4s ease-in-out infinite;}',
      '@keyframes lts-pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}',
      // —— UX 补充:导出/报告反馈改成右下角轻提示(原先贴在页头,和点击处隔着整页)
      '.lts-toast{position:fixed;right:18px;bottom:18px;z-index:1200;max-width:min(420px,calc(100vw - 36px));background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:10px 13px;box-shadow:var(--lts-sh-3);font-size:12px;color:var(--dsw-alias-label-primary);display:flex;gap:10px;align-items:flex-start;animation:lts-in .18s ease-out;}',
      '.lts-toast-ok{border-color:var(--lts-ok);}',
      '.lts-toast-err{border-color:var(--lts-err);}',
      '@keyframes lts-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
      '.lts-toast-main{min-width:0;word-break:break-all;line-height:1.5;}',
      '.lts-toast-hint{color:var(--dsw-alias-label-secondary);font-size:10.5px;margin-top:3px;}',
      '.lts-toast-x{border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:12px;padding:0 3px;flex:none;border-radius:5px;}',
      '.lts-toast-x:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);}',
      // —— UX 补充:空状态卡片(把「暂无数据」换成可操作的一屏说明)
      '.lts-empty-panel{border:1px dashed var(--dsw-alias-border-l2);border-radius:16px;padding:26px 20px;margin:14px 0;text-align:center;background:var(--dsw-alias-bg-layer-1);}',
      '.lts-empty-title{font-size:13.5px;font-weight:650;color:var(--dsw-alias-label-primary);margin-bottom:6px;}',
      '.lts-empty-body{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.7;}',
      '.lts-empty-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px;}',
      '.lts-daymore{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:7px;padding:2px 10px;font-size:11px;cursor:pointer;margin-left:8px;}',
      '.lts-daymore:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary);}',
      '@media (max-width: 900px){.lts-grid2,.lts-period-grid{grid-template-columns:1fr;}.lts-hbar-label{width:140px;}}',
      // 窄屏(侧栏/分屏窗口):内边距走变量,工具条的负外边距跟着一起收,不留横向空隙
      '@media (max-width: 640px){.lts-root{--lts-pad-x:14px;padding-top:14px;padding-bottom:36px;font-size:12.5px;}.lts-toolbar{padding-top:20px;}.lts-title{font-size:17px;}.lts-cards{grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:8px;}.lts-card{padding:11px 12px 10px;}.lts-card-value{font-size:19px;}.lts-hbar-label{width:104px;font-size:11.5px;}.lts-hbar-val{width:72px;font-size:11.5px;}.lts-section{padding:12px 13px;}.lts-tabs{display:flex;flex-wrap:nowrap;overflow-x:auto;}.lts-tab{padding:5px 11px;white-space:nowrap;}.lts-toast{right:10px;left:10px;bottom:10px;max-width:none;}}',
      '@media (prefers-reduced-motion: reduce){.lts-root,.lts-root *{transition:none !important;animation:none !important;}.lts-card:hover,.lts-src:hover,.lts-chip:hover,.lts-btn:hover,.lts-legend-item:hover,.lts-heat-cell:hover{transform:none !important;}}'
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

    const uiCache = { data: null, tab: 'overview', range: 30, agent: 'all', gran: 'day', auto: true, sort: null, vendorF: 'all', modelQ: '', lang: 'zh', mergeAgent: true }

    let LANG = uiCache.lang
    // 展示币种由 host 的 currency 块决定(默认 USD),费用格式随之变化
    let CURRENCY = { display: 'USD', symbol: '$', unit: 'USD', reported: 'USD', fx: 0, fxMissing: false }
    const STRINGS = {
      zh: {
        'k12': '(未知)',
        'k13': '▲ 新增',
        'k14': '· 持平',
        'k15': '暂无数据',
        'k17': ' 次请求',
        'k18': ' · 点击查看当日明细',
        'k19': ' · 无活动',
        'k20': '最近 26 周 · 颜色越深当日 token 越多 · 悬停查看详情(不受时间筛选影响)',
        'k21': '少',
        'k22': '多',
        'k23': '无每日数据',
        'k24': '当前范围暂无数据',
        'k25': '(周起始)',
        'k26': '总计 ',
        'k27': '缓存读 ',
        'k28': '缓存写 ',
        'k29': '输入 ',
        'k30': '输出 ',
        'k31': '推理 ',
        'k32': '仅总量 ',
        'k33': '点击查看当日明细',
        'k34': '已导出 ',
        'k35': ' 行)',
        'k36': '导出失败: ',
        'k37': '已导出月报: ',
        'k38': '已导出周报: ',
        'k39': '报表导出失败: ',
        'k40': '全部时间',
        'k41': '近 ',
        'k42': ' 天',
        'k43': '总 Tokens',
        'k44': '缓存命中率',
        'k45': '缓存读 ÷ 提示词总量',
        'k46': '输入(未缓存)',
        'k47': '输出',
        'k48': '缓存读',
        'k49': '缓存写',
        'k50': '费用(上报)',
        'k51': '另估算 +',
        'k52': '请求数',
        'k53': '活跃 ',
        'k54': '厂商',
        'k55': '模型',
        'k56': '请求',
        'k57': '输入',
        'k58': '推理',
        'k59': '仅总量',
        'k60': '合计',
        'k61': '命中率',
        'k62': '费用',
        'k63': '估算',
        'k64': '费用(估算)',
        'k65': '今日 tokens ',
        'k66': ' 已超预算 ',
        'k67': '本月 tokens ',
        'k68': '今日费用 $',
        'k69': ' 已超预算 $',
        'k70': '本月费用 $',
        'k71': '正在扫描本地对话记录,首次加载约需 10~30 秒…',
        'k72': ' +估',
        'k73': ' — 每日总量(最近 45 个活跃日)',
        'k74': '较上期',
        'k75': '厂商份额',
        'k76': '点击图例可筛选',
        'k77': '提示词构成与命中率',
        'k78': '缓存读(命中)',
        'k79': '未缓存输入',
        'k80': 'Top 模型(按总 Tokens)',
        'k81': '点击条形 → 明细页筛选该模型',
        'k82': ' 次请求 · 命中率 ',
        'k83': 'API 额度 / 余额',
        'k84': '查询中…',
        'k85': '立即查询',
        'k86': '尚未查询。配置方式:在 ~/.agent-token-stats/quota.json 写入 {"deepseek":{"apiKey":"sk-..."},"kimi":{"apiKey":"..."}}(或设环境变量 DEEPSEEK_API_KEY / MOONSHOT_API_KEY)。密钥仅存本机、仅用于调用官方余额接口。',
        'k87': '可用 ',
        'k88': ' / 总额 ',
        'k89': '未配置 API Key',
        'k90': '查询失败: ',
        'k91': 'Token 趋势(堆叠)',
        'k92': '按日',
        'k93': '按周',
        'k94': '活跃热力图',
        'k95': '时间段对比',
        'k96': '选择近 7/30/90 天以启用环比',
        'k97': '上期 = 当前窗口再往前一个等长周期',
        'k98': '导出周报',
        'k99': '导出月报',
        'k100': '当前(',
        'k101': '上期(再往前 ',
        'k102': ' 天)',
        'k103': '上期',
        'k104': '当前为「全部时间」,无环比对象',
        'k105': 'Agent 横向对比(当前范围)',
        'k106': '厂商总量对比',
        'k107': '点击条形筛选该厂商',
        'k108': ' 个模型 · 命中率 ',
        'k109': '模型明细(',
        'k110': '点击表头排序 · 点击行展开每日趋势',
        'k111': '合计 · 当前筛选 ',
        'k112': ' 个模型',
        'k113': '项目/目录 Top 20(全部时间)',
        'k114': '项目',
        'k115': '最近活动',
        'k116': '会话浏览器',
        'k117': 'Cursor(较慢)',
        'k118': '加载中(Cursor 库较大,首次约 1 分钟,结果缓存 30 分钟)…',
        'k119': '加载中…',
        'k120': '加载失败: ',
        'k121': '无会话数据',
        'k122': '消息',
        'k123': '(无标题)',
        'k124': '数据源状态',
        'k125': '源文件持续在更新(',
        'k126': '),但解析出的最近活动停在 ',
        'k127': ' —— 日志格式可能已变化,请反馈给插件作者!',
        'k128': '⚠ 疑似格式漂移',
        'k129': '最近活动 ',
        'k130': '统计口径:合计 = 输入 + 输出 + 推理 + 缓存读 + 缓存写 + 仅总量;命中率 = 缓存读 ÷ (输入 + 缓存读 + 缓存写);续接会话的重复消息已按消息 ID 去重。台账采用增量棘轮合并:每个「来源×模型×日」只累加正增量,重复扫描不会重复计数,源日志删除后历史自动留存(状态显示为「历史留存」)。CodeWhale 只有会话级总量并按创建日归属;WorkBuddy 上报的输入可能已含缓存命中部分;Claude Code 的本地网关未回传 usage,请求数计入但 token 为 0。Cursor(IDE)的请求数/换算费用来自官方 usageData,token 明细来自对话气泡的 tokenCount(仅部分版本记录,多模型会话按请求数比例分摊),费用为按 API 价折算,订阅用户实际不按此扣费。「估算」为参考价目表(模型名子串匹配、细分行优先,默认 USD/百万 token)对未上报费用来源的估算;金额按 pricing.json 的 display 币种展示,跨币种用 fx 换算(缺 fx 则原样显示并提示);推理 token 按输出价(或规则里的 rt)计入;价目可能滞后于真实定价,仅作参考,上报费用与估算费用永不混算。Codex 按会话级 token_count 快照归属到会话起始日;fork/续接会话在消息 ID 之外另按「时间戳×模型×token 指纹」复合去重。Hermes 接入 state.db sessions 表(token 列有数据后自动入账);通义灵码聊天内容加密,仅能探测会话/请求数;Pi 解析器已预置,产生会话后自动接入。',
        'k131': ' 当日明细',
        'k132': ' 个模型 · 含全部来源(不受筛选影响)',
        'k133': '✕ 关闭',
        'k134': '当日无记录',
        'k135': '来源',
        'k136': '全部',
        'k137': '时间',
        'k138': '按厂商筛选(也可点击环形图/厂商条形)',
        'k139': '全部厂商',
        'k140': '搜索模型…',
        'k141': '已筛选',
        'k142': '厂商: ',
        'k143': '模型含「',
        'k144': '清空全部',
        'k145': '🔴 预算告警: ',
        'k147': 'Agent Token 用量看板',
        'k148': '📒 台账: ',
        'k149': '(保存于 ',
        'k150': ')· 删除聊天记录后历史统计仍保留',
        'k151': '⚠️ 台账保存失败: ',
        'k152': '未知错误',
        'k153': '更新于 ',
        'k154': ' 路数据源',
        'k155': ' · 📒 台账已持久化',
        'k156': ' · ⚠️ 台账保存失败',
        'k157': '正在加载…',
        'k158': '刷新中…',
        'k161': '自动刷新(2 分钟)',
        'k162': '导出中…',
        'k163': '导出 CSV',
        'k164': '立即刷新',
        'k165': '刷新失败: ',
        'k166': '(正在显示上次数据)',
        'k167': 'Token 用量',
        'tab.overview': '总览',
        'tab.trend': '趋势分析',
        'tab.compare': '对比分析',
        'tab.detail': '模型明细',
        'tab.sessions': '会话',
        'tab.sources': '数据源',
        'st.ok': '已统计',
        'st.no-data': '无 token 数据',
        'st.missing': '未找到',
        'st.error': '出错',
        'st.pending': '等待解析',
        'st.archived': '历史留存',
        'k168': '」✕',
        'k169': '跨 Agent 合并',
        'k172': 'Agent 拆分',
        'k173': ' · 费用单位 ',
        'k174': ' · ⚠️ 缺 fx,跨币种金额未换算',
        'k175': '后台扫描中',
        'k176': '正在读取本地日志,下面先显示台账快照,扫完自动更新。',
        'k177': '正在加载看板…',
        'k178': '刚刚',
        'k179': ' 分钟前',
        'k180': ' 小时前',
        'k181': ' 天前',
        'k182': '筛选不适用于当前页',
        'k183': '「数据源」页始终展示全部来源的状态,上方筛选只作用于统计页。',
        'k184': '「会话」页用自己的来源选择,顶部筛选不作用于会话列表。',
        'k185': '清空筛选',
        'k186': '切到「全部时间」',
        'k187': '当前筛选范围内没有数据',
        'k188': '可以清空筛选,或把时间范围切到「全部」,以包含更早的历史来源。',
        'k189': '显示前 ',
        'k190': ' 条 · 共 ',
        'k191': ' 条',
        'k192': '展开全部',
        'k193': '收起',
        'k194': '该来源暂无会话数据',
        'k195': '关闭提示',
        'k196': '按 Esc 关闭',
        'k197': '清空搜索'
      },
      en: {
        'k12': '(unknown)',
        'k13': '▲ new',
        'k14': '· flat',
        'k15': 'No data',
        'k17': ' requests',
        'k18': ' · click for day detail',
        'k19': ' · no activity',
        'k20': 'Last 26 weeks · darker = more tokens that day · hover for details (ignores time filter)',
        'k21': 'Less',
        'k22': 'More',
        'k23': 'No daily data',
        'k24': 'No data in current range',
        'k25': ' (week start)',
        'k26': 'Total ',
        'k27': 'Cache read ',
        'k28': 'Cache write ',
        'k29': 'Input ',
        'k30': 'Output ',
        'k31': 'Reasoning ',
        'k32': 'Total-only ',
        'k33': 'Click for day detail',
        'k34': 'Exported ',
        'k35': ' rows)',
        'k36': 'Export failed: ',
        'k37': 'Monthly report exported: ',
        'k38': 'Weekly report exported: ',
        'k39': 'Report export failed: ',
        'k40': 'All time',
        'k41': 'Last ',
        'k42': ' days',
        'k43': 'Total Tokens',
        'k44': 'Cache Hit Rate',
        'k45': 'cache read ÷ total prompt',
        'k46': 'Input (uncached)',
        'k47': 'Output',
        'k48': 'Cache Read',
        'k49': 'Cache Write',
        'k50': 'Cost (reported)',
        'k51': 'est. +',
        'k52': 'Requests',
        'k53': 'Active ',
        'k54': 'Vendor',
        'k55': 'Model',
        'k56': 'Reqs',
        'k57': 'Input',
        'k58': 'Reason',
        'k59': 'Total-only',
        'k60': 'Total',
        'k61': 'Hit Rate',
        'k62': 'Cost',
        'k63': 'Est. ',
        'k64': 'Cost (est.)',
        'k65': 'Daily tokens ',
        'k66': ' exceeded budget ',
        'k67': 'Monthly tokens ',
        'k68': 'Daily cost $',
        'k69': ' over budget $',
        'k70': 'Monthly cost $',
        'k71': 'Scanning local conversation logs, first load takes ~10-30s…',
        'k72': ' +est',
        'k73': ' — daily totals (last 45 active days)',
        'k74': 'vs prev',
        'k75': 'Vendor Share',
        'k76': 'click legend to filter',
        'k77': 'Prompt Composition & Hit Rate',
        'k78': 'Cache read (hit)',
        'k79': 'Uncached input',
        'k80': 'Top Models (by Total Tokens)',
        'k81': 'click a bar → filter it in Model Detail',
        'k82': ' requests · hit rate ',
        'k83': 'API Quota / Balance',
        'k84': 'Checking…',
        'k85': 'Check now',
        'k86': 'Not checked yet. Configure ~/.agent-token-stats/quota.json: {"deepseek":{"apiKey":"sk-..."},"kimi":{"apiKey":"..."}} (or env DEEPSEEK_API_KEY / MOONSHOT_API_KEY). Keys stay local and only call the official balance API.',
        'k87': 'Available ',
        'k88': ' / total ',
        'k89': 'API key not configured',
        'k90': 'Query failed: ',
        'k91': 'Token Trend (stacked)',
        'k92': 'Daily',
        'k93': 'Weekly',
        'k94': 'Activity Heatmap',
        'k95': 'Period Comparison',
        'k96': 'pick Last 7/30/90 days to enable period-over-period',
        'k97': 'previous = the equally-sized window right before',
        'k98': 'Weekly report',
        'k99': 'Monthly report',
        'k100': 'Current (',
        'k101': 'Previous (',
        'k102': ' more days back)',
        'k103': 'Previous',
        'k104': 'Current range is "All time"; no comparison window',
        'k105': 'Agent Comparison (current range)',
        'k106': 'Vendor Totals',
        'k107': 'click a bar to filter this vendor',
        'k108': ' models · hit rate ',
        'k109': 'Model Detail (',
        'k110': 'click headers to sort · click a row to expand its daily trend',
        'k111': 'Total · filtered ',
        'k112': ' models',
        'k113': 'Projects / Directories Top 20 (all time)',
        'k114': 'Project',
        'k115': 'Last Activity',
        'k116': 'Session Explorer',
        'k117': 'Cursor (slow)',
        'k118': 'Loading (Cursor DB is large, ~1 min first time, cached 30 min)…',
        'k119': 'Loading…',
        'k120': 'Load failed: ',
        'k121': 'No session data',
        'k122': 'Msgs',
        'k123': '(untitled)',
        'k124': 'Data Source Status',
        'k125': 'Source files keep updating (',
        'k126': ') but parsed activity stopped at ',
        'k127': ' — the log format may have changed; please report to the plugin author!',
        'k128': '⚠ possible schema drift',
        'k129': 'Last activity ',
        'k130': 'Methodology: total = input + output + reasoning + cache read + cache write + total-only; hit rate = cache read ÷ (input + cache read + cache write); duplicate messages from resumed sessions are deduplicated by message ID. The ledger uses incremental ratchet merging: each source × model × day key only accumulates positive deltas, so rescans never double-count and history survives source-log deletion (status "Archived"). CodeWhale has session-level totals attributed to creation day; WorkBuddy reported input may already include cached portions; Claude Code local gateway never returned usage, so requests count but tokens are 0. Cursor (IDE) requests / converted costs come from official usageData; token detail comes from bubble tokenCount (only some versions record it; multi-model sessions split tokens by request share); costs are API-price equivalents — subscription users are not actually billed this way. "Est." uses the reference price list (model-name substring, specific rows win, USD per 1M by default) for sources without reported cost; amounts are shown in the pricing.json `display` currency, converted across currencies with `fx` (no fx → shown as-is with a warning); reasoning tokens are billed at the output rate (or the rule `rt` field); rates may lag real pricing and are for reference only, and reported vs estimated costs are never mixed. Codex attributes session-level snapshots to session start day; forked sessions are deduplicated by message ID plus a timestamp × model × token fingerprint. Hermes reads its state.db sessions table; Lingma content is encrypted so only session/request counts are probed; the Pi parser is pre-installed and on standby.',
        'k131': ' day detail',
        'k132': ' models · all sources (ignores filters)',
        'k133': '✕ Close',
        'k134': 'No records for this day',
        'k135': 'Source',
        'k136': 'All',
        'k137': 'Time',
        'k138': 'Filter by vendor (or click donut / vendor bars)',
        'k139': 'All vendors',
        'k140': 'Search models…',
        'k141': 'Filters',
        'k142': 'Vendor: ',
        'k143': 'Model contains "',
        'k144': 'Clear all',
        'k145': '🔴 Budget alert: ',
        'k147': 'Agent Token Usage Dashboard',
        'k148': '📒 Ledger: ',
        'k149': '(saved ',
        'k150': ') · history survives chat-log deletion',
        'k151': '⚠️ Ledger save failed: ',
        'k152': 'unknown error',
        'k153': 'Updated ',
        'k154': ' sources',
        'k155': ' · 📒 ledger persisted',
        'k156': ' · ⚠️ ledger save failed',
        'k157': 'Loading…',
        'k158': 'Refreshing…',
        'k161': 'Auto-refresh (2 min)',
        'k162': 'Exporting…',
        'k163': 'Export CSV',
        'k164': 'Refresh now',
        'k165': 'Refresh failed: ',
        'k166': '(showing last data)',
        'k167': 'Token Usage',
        'tab.overview': 'Overview',
        'tab.trend': 'Trends',
        'tab.compare': 'Compare',
        'tab.detail': 'Model Detail',
        'tab.sessions': 'Sessions',
        'tab.sources': 'Sources',
        'st.ok': 'Collected',
        'st.no-data': 'No token data',
        'st.missing': 'Not found',
        'st.error': 'Error',
        'st.pending': 'Pending',
        'st.archived': 'Archived',
        'k168': '" ✕',
        'k169': 'Merge across agents',
        'k172': 'Agent breakdown',
        'k173': ' · cost unit ',
        'k175': 'Background scan running',
        'k176': 'Reading local logs — showing the ledger snapshot first; it updates when the scan finishes.',
        'k177': 'Loading dashboard…',
        'k178': 'just now',
        'k179': 'm ago',
        'k180': 'h ago',
        'k181': 'd ago',
        'k182': 'Filters do not apply on this tab',
        'k183': 'The Sources tab always shows every source\'s status; the filters above apply to the analytics tabs only.',
        'k184': 'The Sessions tab has its own source selector; the filters above do not apply to the session list.',
        'k185': 'Clear filters',
        'k186': 'Switch to All time',
        'k187': 'No data in the current filters',
        'k188': 'Clear the filters, or switch the range to All to include older historical sources.',
        'k189': 'showing first ',
        'k190': ' of ',
        'k191': ' rows',
        'k192': 'Show all',
        'k193': 'Collapse',
        'k194': 'No sessions recorded for this source',
        'k195': 'Dismiss',
        'k196': 'Esc to dismiss',
        'k197': 'Clear search',
        'k174': ' · ⚠️ fx missing, cross-currency amounts unconverted'
      }
    }
    // NOTE: named TR/TRS (not t/ts) because several render scopes bind local
    // variables called t (e.g. periodCard's totals argument) — a translation
    // function named t crashed the whole panel tree with "t is not a function".
    function TRS(key, fallback) {
      const d = STRINGS[LANG] !== undefined ? STRINGS[LANG] : STRINGS.zh
      if (d[key] !== undefined) return d[key]
      if (STRINGS.zh[key] !== undefined) return STRINGS.zh[key]
      return fallback !== undefined ? fallback : key
    }
    function TR(key) { return TRS(key, key) }

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
      const v = Number(c) || 0
      const sym = CURRENCY.symbol !== undefined ? CURRENCY.symbol : '$'
      if (v <= 0) return sym + '0'
      return sym + (v < 1 ? v.toFixed(4) : v.toFixed(2))
    }
    function fmtMoneyPlain(v) {
      const n = Number(v) || 0
      const sym = CURRENCY.symbol !== undefined ? CURRENCY.symbol : '$'
      return sym + (n < 1 ? n.toFixed(4) : n.toFixed(2))
    }
    // 相对时间:meta 行里「更新于 3 分钟前」比绝对时间戳更能说明数据新不新。
    function fmtAgo(ms, nowMs) {
      const now = Number(nowMs) > 0 ? Number(nowMs) : Date.now()
      const diff = now - Number(ms)
      if (!(diff > 0)) return TR('k178')
      const min = Math.floor(diff / 60000)
      if (min < 1) return TR('k178')
      if (min < 60) return min + TR('k179')
      const hr = Math.floor(min / 60)
      if (hr < 24) return hr + TR('k180')
      return Math.floor(hr / 24) + TR('k181')
    }
    function syncCurrency(res) {
      const c = res !== null && res !== undefined && typeof res === 'object' ? res.currency : null
      if (c === null || c === undefined || typeof c !== 'object') return
      CURRENCY = {
        display: typeof c.display === 'string' && c.display !== '' ? c.display : 'USD',
        symbol: typeof c.symbol === 'string' && c.symbol !== '' ? c.symbol : '$',
        unit: typeof c.unit === 'string' ? c.unit : 'USD',
        reported: typeof c.reported === 'string' ? c.reported : 'USD',
        fx: Number(c.fx) > 0 ? Number(c.fx) : 0,
        fxMissing: c.fxMissing === true
      }
    }
    function currencyNote(res) {
      const c = res !== null && res !== undefined && typeof res === 'object' ? res.currency : null
      if (c === null || c === undefined) return ''
      const code = typeof c.display === 'string' ? c.display : 'USD'
      let note = TR('k173') + code
      if (Number(c.fx) > 0 && code !== 'USD') note += ' · fx 1 USD = ' + Number(c.fx) + ' ' + code
      if (c.fxMissing === true) note += TR('k174')
      return note
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
      if (typeof p !== 'string' || p === '') return TR('k12')
      const home = p.match(/^\/Users\/[^/]+/)
      let t = p
      if (home) t = '~' + p.slice(home[0].length)
      const parts = t.split('/')
      if (parts.length <= 4) return t
      return '…/' + parts.slice(-3).join('/')
    }

    // 首屏骨架:按真实卡片/分区的形状铺位,让「正在加载」有结构感而不是一行字。
    function Skeleton() {
      const h = React.createElement
      const sk = function (cls, style, key) { return h('div', { key: key, className: 'lts-sk ' + cls, style: style }) }
      return h('div', { className: 'lts-skeleton', 'aria-hidden': 'true' },
        h('div', { className: 'lts-cards' }, [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) {
          return h('div', { key: 'c' + i, className: 'lts-sk-card' },
            sk('lts-sk-h', null, 'h'),
            sk('lts-sk-v', null, 'v'),
            sk('lts-sk-s', null, 's'))
        })),
        h('div', { className: 'lts-grid2' }, [0, 1].map(function (i) {
          return h('div', { key: 'g' + i, className: 'lts-sk-section' },
            sk('lts-sk-h', { width: '30%' }, 'h'),
            h('div', { key: 'b', className: 'lts-sk', style: { height: 150, borderRadius: 12 } }))
        })),
        h('div', { className: 'lts-sk-section' },
          sk('lts-sk-h', { width: '24%' }, 'h'),
          [0, 1, 2, 3, 4].map(function (i) { return sk('lts-sk-row', { width: (92 - i * 11) + '%' }, 'r' + i) })))
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
        role: 'img',
        'aria-label': TR('k167'),
        style: { display: 'block', opacity: props && props.active ? 1 : 0.78 }
      },
        React.createElement('title', null, TR('k167')),
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
      if (prev <= 0) return h('span', { className: 'lts-delta lts-delta-up' }, TR('k13'))
      const pct = (cur - prev) / prev
      if (Math.abs(pct) < 0.0005) return h('span', { className: 'lts-delta lts-delta-flat' }, TR('k14'))
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
      if (total <= 0) return h('div', { className: 'lts-empty' }, TR('k15'))
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
        h('svg', { width: size, height: size, style: { flex: 'none', overflow: 'visible' }, onMouseLeave: function () { setHover(-1) } }, arcs),
        legend)
    }

    function HBars(props) {
      const h = React.createElement
      const items = Array.isArray(props.items) ? props.items : []
      if (items.length === 0) return h('div', { className: 'lts-empty' }, TR('k15'))
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
        if (mo !== lastMonth) { months.push(LANG === 'zh' ? (mo + 1) + '月' : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mo]); lastMonth = mo } else { months.push('') }
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
              title: key + ' · ' + fmtNum(v) + ' tokens · ' + fmtInt(entry.n) + TR('k17') + (props.onPickDay ? TR('k18') : ''),
              style: { background: 'var(--dsw-alias-brand-primary)', opacity: opacity },
              onClick: props.onPickDay ? function () { props.onPickDay(key) } : undefined
            }))
          } else {
            cells.push(h('div', { key: key, className: 'lts-heat-cell', title: key + TR('k19') }))
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
          h('div', { className: 'lts-heat-hint', style: { marginTop: 0 } }, TR('k20')),
          h('div', { className: 'lts-heat-scale' }, TR('k21'),
            h('i', { style: { opacity: 0.15 } }),
            h('i', { style: { opacity: 0.35 } }),
            h('i', { style: { opacity: 0.6 } }),
            h('i', { style: { opacity: 1 } }),
            TR('k22'))))
    }

    function MiniBars(props) {
      const h = React.createElement
      const days = (Array.isArray(props.days) ? props.days : []).slice(-45)
      if (days.length === 0) return h('span', { className: 'lts-heat-hint' }, TR('k23'))
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
      const [hov, setHov] = React.useState(null)
      if (days.length === 0) return h('div', { className: 'lts-empty' }, TR('k24'))
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
        bars.push(h('rect', { key: 'hl' + idx, x: x - gap / 2, y: 0, width: barW + gap, height: chartH, fill: hov !== null && hov.idx === idx ? 'var(--dsw-alias-bg-layer-2)' : 'transparent', pointerEvents: 'none' }))
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
          bars.push(h('rect', { key: 's' + idx + '-' + sg, x: x, y: y, width: barW, height: segH, fill: seg.color, rx: 2, pointerEvents: 'none', opacity: hov !== null && hov.idx !== idx ? 0.45 : 1, style: { transition: 'opacity .12s' } }))
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
          onMouseEnter: function (e) { setHov({ idx: idx, x: e.clientX, y: e.clientY }) },
          onMouseMove: function (e) { setHov({ idx: idx, x: e.clientX, y: e.clientY }) },
          onClick: props.onPickDay ? function () { props.onPickDay(d.day) } : undefined
        }))
      }
      let tip = null
      if (hov !== null && shown[hov.idx] !== undefined) {
        const d = shown[hov.idx]
        const vw = window.innerWidth
        const vh = window.innerHeight
        const flipX = hov.x + 210 > vw
        const pos = { top: Math.max(8, Math.min(hov.y + 14, vh - 200)) }
        if (flipX) { pos.right = Math.max(8, vw - hov.x + 14) } else { pos.left = hov.x + 14 }
        tip = h('div', { className: 'lts-tip', style: pos },
          h('div', { className: 'lts-tip-title' }, d.day + (props.gran === 'week' ? TR('k25') : '')),
          h('div', null, TR('k26') + fmtNum(d.total) + ' · ' + fmtInt(d.n) + TR('k17')),
          d.cr > 0 ? h('div', null, TR('k27') + fmtNum(d.cr)) : null,
          d.cw > 0 ? h('div', null, TR('k28') + fmtNum(d.cw)) : null,
          d.i > 0 ? h('div', null, TR('k29') + fmtNum(d.i)) : null,
          d.o > 0 ? h('div', null, TR('k30') + fmtNum(d.o)) : null,
          d.r > 0 ? h('div', null, TR('k31') + fmtNum(d.r)) : null,
          d.tt > 0 ? h('div', null, TR('k32') + fmtNum(d.tt)) : null,
          props.onPickDay ? h('div', { className: 'lts-tip-hint' }, TR('k33')) : null)
      }
      return h('div', { className: 'lts-chart-scroll' },
        h('div', { style: { position: 'relative', width: width } },
          h('svg', { width: width, height: chartH + 22, style: { display: 'block' }, onMouseLeave: function () { setHov(null) } }, bars),
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
      const [toast, setToast] = React.useState(null)
      const [tab, setTab] = React.useState(uiCache.tab)
      const [gran, setGran] = React.useState(uiCache.gran)
      const [vendorF, setVendorF] = React.useState(uiCache.vendorF)
      const [modelQ, setModelQ] = React.useState(uiCache.modelQ)
      const [daySel, setDaySel] = React.useState(null)
      const [dayAll, setDayAll] = React.useState(false)
      const [expanded, setExpanded] = React.useState(null)
      const [sessAgent, setSessAgent] = React.useState(SESSION_AGENTS.indexOf(uiCache.agent) !== -1 ? uiCache.agent : 'opencode')
      const [sessData, setSessData] = React.useState(null)
      const [sessLoading, setSessLoading] = React.useState(false)
      const [sessError, setSessError] = React.useState(null)
      const [quota, setQuota] = React.useState(null)
      const [quotaLoading, setQuotaLoading] = React.useState(false)
      const [lang, setLang] = React.useState(uiCache.lang)
      const [mergeAgent, setMergeAgent] = React.useState(uiCache.mergeAgent)
      const [now, setNow] = React.useState(Date.now())
      const searchRef = React.useRef(null)
      const dayRef = React.useRef(null)
      const toolbarRef = React.useRef(null)
      const tabRefs = React.useRef({})
      const sessPick = React.useRef(false)
      const toastTimer = React.useRef(null)

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

      const scanTimer = React.useRef(null)
      const scanRetry = React.useRef(0)
      const load = React.useCallback(function (refresh, silent) {
        const quiet = silent === true
        if (!quiet) setLoading(true)
        fetch('/agent-token-stats/data' + (refresh === true ? '?refresh=1' : ''), { headers: { accept: 'application/json' } }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status)
          return r.json()
        }).then(
          function (res) {
            uiCache.data = res; syncCurrency(res); setData(res); setError(null)
            // 静默通道(2 分钟定时 + 扫描轮询)不许碰 loading:否则会把手动刷新
            // 正转着的「刷新中…」抹掉,按钮又能点 -> 重复刷新。
            if (!quiet) setLoading(false)
            scanRetry.current = 0
            if (scanTimer.current !== null) { window.clearTimeout(scanTimer.current); scanTimer.current = null }
            if (res !== null && res !== undefined && res.scanning === true) {
              // host 已在后台扫描(冷启动走了台账快照/手动刷新已排队):几秒后再取,扫完自动停
              scanTimer.current = window.setTimeout(function () { scanTimer.current = null; load(false, true) }, 5000)
            }
          },
          function (e) {
            if (!quiet) { setLoading(false); setError(String((e && e.message) || e)) }
            if (quiet && e !== undefined) {
              // 静默失败不能把轮询停掉:host 可能还在扫,状态条要留在原地等结果。
              // 有上限地重试,避免服务不可用时无限空转。
              if (scanRetry.current < 4 && scanTimer.current === null) {
                scanRetry.current++
                scanTimer.current = window.setTimeout(function () { scanTimer.current = null; load(false, true) }, 15000)
              }
            }
          }
        )
      }, [])
      React.useEffect(function () {
        return function () { if (scanTimer.current !== null) window.clearTimeout(scanTimer.current) }
      }, [])

      // 「更新于 3 分钟前」要会走字:每 30s 抖一次时钟(只重渲染,不重新取数)。
      React.useEffect(function () {
        const id = window.setInterval(function () { setNow(Date.now()) }, 30000)
        return function () { window.clearInterval(id) }
      }, [])

      const showToast = React.useCallback(function (kind, text) {
        if (toastTimer.current !== null) { window.clearTimeout(toastTimer.current); toastTimer.current = null }
        setToast({ kind: kind, text: text })
        toastTimer.current = window.setTimeout(function () {
          toastTimer.current = null
          setToast(null)
        }, kind === 'err' ? 12000 : 6000)
      }, [])
      React.useEffect(function () {
        return function () { if (toastTimer.current !== null) window.clearTimeout(toastTimer.current) }
      }, [])

      // 点热力图/趋势图下钻:细节区在页头附近,不滚过去用户会以为「点了没反应」。
      // 吸顶工具条会盖住视口顶部,盖住的量随筛选器是否换行而变,所以滚动前现量一次高度写进
      // scroll-margin-top(工具条 top:-18px,所以可见遮挡 = 高度 - 18)。
      React.useEffect(function () {
        if (daySel === null) return undefined
        setDayAll(false)
        const id = window.setTimeout(function () {
          const el = dayRef.current
          if (el === null || el === undefined || typeof el.scrollIntoView !== 'function') return
          const bar = toolbarRef.current
          if (bar !== null && bar !== undefined && typeof bar.getBoundingClientRect === 'function' && el.style !== null && typeof el.style === 'object') {
            const rect = bar.getBoundingClientRect()
            const h = rect !== null && rect !== undefined ? Number(rect.height) : 0
            if (h > 0) el.style.scrollMarginTop = Math.max(0, Math.round(h) - 18) + 'px'
          }
          let smooth = true
          try { smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) } catch (e2) { smooth = true }
          el.scrollIntoView({ block: 'nearest', behavior: smooth ? 'smooth' : 'auto' })
        }, 0)
        return function () { window.clearTimeout(id) }
      }, [daySel])

      // 键盘:Esc 依次收起提示 → 清空搜索 → 关闭当日明细;「/」聚焦搜索框。
      // 这个监听挂在 window 上,所以必须只认「本插件的搜索框」(e.target === searchRef.current),
      // 不能看见任何 INPUT 就当成自己的 —— 否则在自动刷新勾选框上按 Esc 会莫名清掉模型筛选。
      React.useEffect(function () {
        function onKey(e) {
          if (e === null || e === undefined) return
          const t = e.target
          const tag = t !== null && t !== undefined && t.tagName !== undefined ? String(t.tagName) : ''
          const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t !== null && t !== undefined && t.isContentEditable === true)
          const searchEl = searchRef.current
          const inSearch = searchEl !== null && searchEl !== undefined && t === searchEl
          // 「文本框」只算真正输入文字的那些:勾选框/单选框上的 Esc 不该被当成打字场景。
          const isTextEntry = tag === 'TEXTAREA' || (t !== null && t !== undefined && t.isContentEditable === true) ||
            (tag === 'INPUT' && ['checkbox', 'radio', 'button', 'submit', 'range'].indexOf(String(t.type || 'text')) === -1)
          const focusIsNeutral = t === null || t === undefined || tag === 'BODY' || tag === 'HTML'
          if (e.key === 'Escape') {
            if (toast !== null) { setToast(null); return }
            if (inSearch && modelQ !== '') { setModelQ(''); return }
            if (isTextEntry && !inSearch) return // 别的输入框:Esc 归它自己,别越权改筛选
            if (daySel !== null) { setDaySel(null); return }
            if (modelQ !== '' && focusIsNeutral) { setModelQ(''); return }
            return
          }
          if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
            if (searchEl !== null && searchEl !== undefined && typeof searchEl.focus === 'function') { e.preventDefault(); searchEl.focus() }
          }
        }
        window.addEventListener('keydown', onKey)
        return function () { window.removeEventListener('keydown', onKey) }
      }, [toast, daySel, modelQ])

      const doExport = React.useCallback(function () {
        setExporting(true)
        fetch('/agent-token-stats/export', { headers: { accept: 'application/json' } }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status)
          return r.json()
        }).then(
          function (res) {
            showToast('ok', TR('k34') + (res && res.path ? res.path : '') + '(' + (res && res.rows ? res.rows : 0) + TR('k35'))
            setExporting(false)
          },
          function (e) {
            showToast('err', TR('k36') + String((e && e.message) || e))
            setExporting(false)
          }
        )
      }, [showToast])

      React.useEffect(function () {
        uiCache.lang = lang
        LANG = lang
      }, [lang])

      React.useEffect(function () {
        uiCache.mergeAgent = mergeAgent
      }, [mergeAgent])

      React.useEffect(function () {
        if (tab !== 'sessions') return undefined
        let cancelled = false
        setSessLoading(true)
        fetch('/agent-token-stats/sessions?agent=' + encodeURIComponent(sessAgent) + '&limit=100', { headers: { accept: 'application/json' } }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status)
          return r.json()
        }).then(
          function (res) { if (!cancelled) { setSessData(res); setSessError(null); setSessLoading(false) } },
          function (e) { if (!cancelled) { setSessError(String((e && e.message) || e)); setSessLoading(false) } }
        )
        return function () { cancelled = true }
      }, [tab, sessAgent])

      const loadQuota = React.useCallback(function () {
        setQuotaLoading(true)
        fetch('/agent-token-stats/quota', { headers: { accept: 'application/json' } }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status)
          return r.json()
        }).then(
          function (res) { setQuota(res); setQuotaLoading(false) },
          function () { setQuotaLoading(false) }
        )
      }, [])

      const doReport = React.useCallback(function (gran) {
        fetch('/agent-token-stats/report?gran=' + gran, { headers: { accept: 'application/json' } }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status)
          return r.json()
        }).then(function (res) {
          const blob = new Blob([res.markdown], { type: 'text/markdown;charset=utf-8' })
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = res.filename || ('token-report-' + gran + '.md')
          document.body.appendChild(a)
          a.click()
          const fname = a.download
          setTimeout(function () { URL.revokeObjectURL(a.href); if (a.parentNode) a.parentNode.removeChild(a) }, 500)
          showToast('ok', (gran === 'month' ? TR('k37') : TR('k38')) + fname)
        }, function (e) {
          showToast('err', TR('k39') + String((e && e.message) || e))
        })
      }, [showToast])

      React.useEffect(function () { syncCurrency(data) }, [data])
      React.useEffect(function () { load(false) }, [load])
      React.useEffect(function () {
        if (!auto) return undefined
        // 自动刷新走静默通道:每 2 分钟把按钮切成「刷新中…」只是闪一下,没有信息量,
        // 新鲜度交给 meta 行的「更新于 x 分钟前」表达。
        const id = window.setInterval(function () { load(false, true) }, 120000)
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

          const mKey = mergeAgent ? ('*' + r.v + '|' + r.m) : (r.a + '|' + r.p + '|' + r.v + '|' + r.m)
          let m = models.get(mKey)
          if (m === undefined) {
            m = { a: r.a, p: r.p, v: r.v, m: r.m, n: 0, i: 0, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 0, ec: 0, total: 0, prompt: 0, hit: 0, agents: new Map(), providers: new Map() }
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
          m.providers.set(r.p, (m.providers.get(r.p) || 0) + t)
          let ba = m.agents.get(r.a)
          if (ba === undefined) {
            ba = { n: 0, i: 0, o: 0, r: 0, cr: 0, cw: 0, tt: 0, c: 0, ec: 0, total: 0 }
            m.agents.set(r.a, ba)
          }
          ba.n += r.n
          ba.i += r.i
          ba.o += r.o
          ba.r += r.r
          ba.cr += r.cr
          ba.cw += r.cw
          ba.tt += rtt
          ba.c += r.c
          ba.ec += r.ec || 0
          ba.total += t

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
          const agentRows = []
          m.agents.forEach(function (ba2, aid) {
            const bp = ba2.i + ba2.cr + ba2.cw
            agentRows.push({ id: aid, n: ba2.n, total: ba2.total, hit: bp > 0 ? ba2.cr / bp : 0, c: ba2.c, ec: ba2.ec })
          })
          agentRows.sort(function (x, y) { return y.total - x.total })
          m.agentRows = agentRows
          m.aList = agentRows.map(function (x) { return x.id })
          if (m.aList.length > 1) {
            const labels = m.aList.map(function (aid) { return AGENT_LABELS[aid] || aid })
            m.a = labels.length > 2 ? labels.slice(0, 2).join('+') + '+' + (labels.length - 2) : labels.join('+')
            m.aFull = labels.join(', ')
          } else {
            m.aFull = AGENT_LABELS[m.aList[0] !== undefined ? m.aList[0] : m.a] || m.a
          }
          let bestP = ''
          let bestPt = -1
          m.providers.forEach(function (pt, pk) { if (pt > bestPt) { bestPt = pt; bestP = pk } })
          if (m.providers.size > 1) m.p = bestP + ' +' + (m.providers.size - 1)
          else if (bestP !== '') m.p = bestP
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
      }, [data, agent, range, sort, vendorF, modelQ, mergeAgent])

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

      // 会话页只有三个来源能取会话。默认选中「有数据」的那个(此前写死 opencode,
      // 没在用 OpenCode 的人打开会话页只会看到「无会话数据」,还得自己猜哪个能点)。
      const sessCounts = React.useMemo(function () {
        const m = {}
        for (let i = 0; i < chipAgents.length; i++) m[chipAgents[i].id] = chipAgents[i].n
        return m
      }, [chipAgents])
      React.useEffect(function () {
        if (sessPick.current) return
        if (tab !== 'sessions') return
        if (agent !== 'all' && SESSION_AGENTS.indexOf(agent) !== -1) { setSessAgent(agent); return }
        if ((sessCounts[sessAgent] || 0) > 0) return
        for (let i = 0; i < SESSION_AGENTS.length; i++) {
          if ((sessCounts[SESSION_AGENTS[i]] || 0) > 0) { setSessAgent(SESSION_AGENTS[i]); return }
        }
      }, [tab, agent, chipAgents, sessAgent])

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
        const byDay = new Map()
        const rows = data !== null && data && Array.isArray(data.rows) ? data.rows : []
        const loose = (m.aList && m.aList.length > 1) || (m.providers && m.providers.size > 1)
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i]
          if (r.d === '') continue
          const hitRow = loose ? (r.v === m.v && r.m === m.m) : (r.a === m.a && r.p === m.p && r.v === m.v && r.m === m.m)
          if (hitRow) byDay.set(r.d, (byDay.get(r.d) || 0) + r.i + r.o + r.r + r.cr + r.cw + (r.tt || 0))
        }
        const out = []
        byDay.forEach(function (total, day) { out.push({ day: day, total: total }) })
        out.sort(function (x, y) { return x.day < y.day ? -1 : x.day > y.day ? 1 : 0 })
        return out
      }

      const rangeLabel = range === 0 ? TR('k40') : TR('k41') + range + TR('k42')

      const cards = view === null ? [] : [
        { label: TR('k43'), value: fmtNum(view.totals.total), extra: fmtInt(view.totals.total), cur: view.totals.total, prev: view.prevTotals.total, acc: '#5b8def' },
        { label: TR('k44'), value: fmtPct(view.totals.hit), extra: TR('k45'), cur: view.totals.hit, prev: view.prevTotals.hit, acc: '#3ecf8e' },
        { label: TR('k46'), value: fmtNum(view.totals.i), extra: fmtInt(view.totals.i), cur: view.totals.i, prev: view.prevTotals.i, acc: '#e8a23d' },
        { label: TR('k47'), value: fmtNum(view.totals.o), extra: TR('k31') + fmtNum(view.totals.r), cur: view.totals.o, prev: view.prevTotals.o, acc: '#8fbf4b' },
        { label: TR('k48'), value: fmtNum(view.totals.cr), extra: fmtInt(view.totals.cr), cur: view.totals.cr, prev: view.prevTotals.cr, acc: '#5b8def' },
        { label: TR('k49'), value: fmtNum(view.totals.cw), extra: fmtInt(view.totals.cw), cur: view.totals.cw, prev: view.prevTotals.cw, acc: '#a97bef' },
        { label: TR('k50'), value: fmtCost(view.totals.c), extra: TR('k51') + fmtCost(view.totals.ec), cur: view.totals.c, prev: view.prevTotals.c, acc: '#f78fb3' },
        { label: TR('k52'), value: fmtInt(view.totals.n), extra: TR('k53') + view.activeDays + TR('k42'), cur: view.totals.n, prev: view.prevTotals.n, acc: '#4bc0c0' }
      ]

      const cols = [
        { key: 'a', label: 'Agent', num: false },
        { key: 'v', label: TR('k54'), num: false },
        { key: 'p', label: 'Provider', num: false },
        { key: 'm', label: TR('k55'), num: false },
        { key: 'n', label: TR('k56'), num: true },
        { key: 'i', label: TR('k57'), num: true },
        { key: 'o', label: TR('k47'), num: true },
        { key: 'r', label: TR('k58'), num: true },
        { key: 'cr', label: TR('k48'), num: true },
        { key: 'cw', label: TR('k49'), num: true },
        { key: 'tt', label: TR('k59'), num: true },
        { key: 'total', label: TR('k60'), num: true },
        { key: 'hit', label: TR('k61'), num: true },
        { key: 'c', label: TR('k62'), num: true },
        { key: 'ec', label: TR('k63'), num: true }
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
          [TR('k43'), fmtNum(t.total), t.total, base ? base.total : 0],
          [TR('k52'), fmtInt(t.n), t.n, base ? base.n : 0],
          [TR('k46'), fmtNum(t.i), t.i, base ? base.i : 0],
          [TR('k47'), fmtNum(t.o), t.o, base ? base.o : 0],
          [TR('k48'), fmtNum(t.cr), t.cr, base ? base.cr : 0],
          [TR('k44'), fmtPct(t.hit), t.hit, base ? base.hit : 0],
          [TR('k50'), fmtCost(t.c), t.c, base ? base.c : 0],
          [TR('k64'), fmtCost(t.ec), t.ec, base ? base.ec : 0]
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

      const budgetAlert = React.useMemo(function () {
        if (data === null || !data || !data.budget || !data.budget.config || !data.budget.use) return null
        const cfg = data.budget.config
        const u = data.budget.use
        const items = []
        if (cfg.dailyTokens > 0 && u.dayTokens > cfg.dailyTokens) items.push(TR('k65') + fmtNum(u.dayTokens) + TR('k66') + fmtNum(cfg.dailyTokens))
        if (cfg.monthlyTokens > 0 && u.monthTokens > cfg.monthlyTokens) items.push(TR('k67') + fmtNum(u.monthTokens) + TR('k66') + fmtNum(cfg.monthlyTokens))
        if (cfg.dailyCost > 0 && u.dayCost > cfg.dailyCost) items.push(TR('k68') + fmtMoneyPlain(u.dayCost) + TR('k69') + fmtMoneyPlain(cfg.dailyCost))
        if (cfg.monthlyCost > 0 && u.monthCost > cfg.monthlyCost) items.push(TR('k70') + fmtMoneyPlain(u.monthCost) + TR('k69') + fmtMoneyPlain(cfg.monthlyCost))
        return items.length > 0 ? items : null
      }, [data])

      const isEmpty = view !== null && view.totals.total === 0 && view.totals.n === 0

      let body = null
      if (view === null) {
        // 首屏:按真实版式铺骨架 + 一行状态说明,而不是一屏空白里孤零零一句「正在加载」
        body = h('div', null,
          h('div', { className: 'lts-status', role: 'status' },
            error !== null ? null : h('span', { className: 'lts-pulse' }),
            h('span', { className: 'lts-status-strong' }, error !== null ? TR('k15') : TR('k177')),
            error !== null ? null : h('span', null, TR('k71'))),
          error === null ? h(Skeleton, null) : null)
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
            h('td', { style: { textAlign: 'left' }, className: 'lts-mono' }, (a.c > 0 ? fmtCost(a.c) : '—') + (a.ec > 0 ? TR('k72') + fmtCost(a.ec) : '')))
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
            h('td', { style: { textAlign: 'left' }, title: m.aFull }, (expanded === mKey ? '▾ ' : '▸ ') + (AGENT_LABELS[m.a] || m.a)),
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
                h('div', { className: 'lts-expand-hint' }, (AGENT_LABELS[m.a] || m.a) + ' · ' + m.m + TR('k73')),
                m.agentRows && m.agentRows.length > 1
                  ? h('div', { style: { margin: '2px 0 10px' } },
                    h('div', { className: 'lts-heat-hint', style: { margin: '0 0 4px' } }, TR('k172')),
                    h('table', { className: 'lts-table' },
                      h('thead', null, h('tr', null,
                        h('th', { style: { textAlign: 'left' } }, 'Agent'),
                        h('th', null, TR('k56')),
                        h('th', null, TR('k60')),
                        h('th', null, TR('k61')),
                        h('th', null, TR('k62')))),
                      h('tbody', null, m.agentRows.map(function (ar) {
                        return h('tr', { key: ar.id },
                          h('td', { style: { textAlign: 'left' } }, AGENT_LABELS[ar.id] || ar.id),
                          h('td', { className: 'lts-mono' }, fmtInt(ar.n)),
                          h('td', { className: 'lts-mono' }, fmtNum(ar.total)),
                          h('td', { className: 'lts-mono' }, ar.hit > 0 ? fmtPct(ar.hit) : '—'),
                          h('td', { className: 'lts-mono' }, ar.c > 0 ? fmtCost(ar.c) : ar.ec > 0 ? TR('k63') + fmtMoneyPlain(ar.ec) : '—'))
                      }))))
                  : null,
                h(MiniBars, { days: modelSeries(m), color: view.vendorColors[m.v] || 'var(--dsw-alias-brand-primary)' }))))
          }
        }

        const overviewTab = h('div', null,
          h('div', { className: 'lts-cards' }, cards.map(function (c) {
            return h('div', { key: c.label, className: 'lts-card', style: { '--lts-acc': c.acc } },
              h('div', { className: 'lts-card-label' }, c.label),
              h('div', { className: 'lts-card-value' }, c.value),
              range > 0
                ? h('div', { className: 'lts-card-delta' }, h(DeltaBadge, { cur: c.cur, prev: c.prev }), h('span', { className: 'lts-card-delta-label' }, TR('k74')))
                : h('div', { className: 'lts-card-delta' }),
              h('div', { className: 'lts-card-extra' }, c.extra))
          })),
          h('div', { className: 'lts-grid2' },
            h('div', { className: 'lts-section' },
              h('h3', null, TR('k75'), h('span', { className: 'lts-section-note' }, TR('k76'))),
              h(Donut, {
                slices: view.vendors.map(function (v) {
                  return { label: v.name, value: v.total, color: view.vendorColors[v.name] }
                }),
                centerLabel: TR('k43'),
                onPick: function (name) { setVendorF(vendorF === name ? 'all' : name) }
              })),
            h('div', { className: 'lts-section' },
              h('h3', null, TR('k77')),
              h(Donut, {
                slices: [
                  { label: TR('k78'), value: view.totals.cr, color: '#5b8def' },
                  { label: TR('k79'), value: view.totals.i, color: '#e8a23d' },
                  { label: TR('k49'), value: view.totals.cw, color: '#a97bef' }
                ],
                centerValue: fmtPct(view.totals.hit),
                centerLabel: TR('k44')
              }))),
          h('div', { className: 'lts-section' },
            h('h3', null, TR('k80'), h('span', { className: 'lts-section-note' }, TR('k81'),
              h('button', { className: 'lts-chip' + (mergeAgent ? ' lts-chip-on' : ''), onClick: function () { setMergeAgent(!mergeAgent) } }, TR('k169') + (mergeAgent ? ' ✓' : '')))),
            h(HBars, {
              items: view.topModels.map(function (m, i) {
                return {
                  label: m.m,
                  raw: m.m,
                  value: m.total,
                  color: PALETTE[i % PALETTE.length],
                  title: (AGENT_LABELS[m.a] || m.a) + ' · ' + m.m + ' · ' + fmtInt(m.total) + ' tokens · ' + fmtInt(m.n) + TR('k82') + fmtPct(m.hit)
                }
              }),
              onPick: function (it) { setModelQ(it.raw); setTab('detail') }
            })),
          h('div', { className: 'lts-section' },
            h('h3', null, TR('k83'),
              h('span', { className: 'lts-section-note' },
                h('button', { className: 'lts-chip', disabled: quotaLoading, onClick: loadQuota }, quotaLoading ? TR('k84') : TR('k85')))),
            quota === null
              ? h('div', { className: 'lts-heat-hint', style: { marginTop: 0 } }, TR('k86'))
              : h('div', { className: 'lts-src-grid' }, (quota.quotas || []).map(function (q) {
                return h('div', { key: q.provider, className: 'lts-src' },
                  h('div', null, h('strong', null, q.provider === 'deepseek' ? 'DeepSeek' : q.provider === 'kimi' ? 'Kimi / Moonshot' : q.provider)),
                  q.ok
                    ? h('div', { className: 'lts-src-detail' }, TR('k87') + (q.currency || '') + ' ' + q.available + (q.total !== null && q.total !== undefined ? TR('k88') + q.total : ''))
                    : h('div', { className: 'lts-src-detail' }, q.unconfigured ? TR('k89') : TR('k90') + (q.error || '')))
              }))))

        const trendTab = h('div', null,
          h('div', { className: 'lts-section' },
            h('h3', null, TR('k91'),
              h('span', { className: 'lts-section-note' },
                h('button', { className: 'lts-chip' + (gran === 'day' ? ' lts-chip-on' : ''), onClick: function () { setGran('day') } }, TR('k92')),
                ' ',
                h('button', { className: 'lts-chip' + (gran === 'week' ? ' lts-chip-on' : ''), onClick: function () { setGran('week') } }, TR('k93')))),
            h('div', { className: 'lts-legend' },
              legendItem('#5b8def', TR('k48')),
              legendItem('#a97bef', TR('k49')),
              legendItem('#e8a23d', TR('k57')),
              legendItem('#c9a86a', TR('k59')),
              legendItem('#7f8c9b', TR('k58')),
              legendItem('#3ecf8e', TR('k47'))),
            h(TrendChart, { days: gran === 'week' ? view.weeks : view.days, gran: gran, onPickDay: function (ds) { setDaySel(ds) } })),
          h('div', { className: 'lts-section' },
            h('h3', null, TR('k94')),
            h(Heatmap, { days: view.daysAll, max: view.daysAllMax, onPickDay: function (ds) { setDaySel(ds) } })))

        const compareTab = h('div', null,
          h('div', { className: 'lts-section' },
            h('h3', null, TR('k95'),
              h('span', { className: 'lts-section-note' }, range === 0 ? TR('k96') : TR('k97'),
                h('button', { className: 'lts-chip', onClick: function () { doReport('week') } }, TR('k98')),
                h('button', { className: 'lts-chip', onClick: function () { doReport('month') } }, TR('k99')))),
            h('div', { className: 'lts-period-grid' },
              periodCard(TR('k100') + rangeLabel + ')', view.totals, range > 0, view.prevTotals),
              range > 0
                ? periodCard(TR('k101') + range + TR('k102'), view.prevTotals, false, null)
                : h('div', { className: 'lts-period-card' },
                  h('div', { className: 'lts-period-title' }, TR('k103')),
                  h('div', { className: 'lts-heat-hint' }, TR('k104'))))),
          h('div', { className: 'lts-section' },
            h('h3', null, TR('k105')),
            agentRows.length === 0
              ? h('div', { className: 'lts-empty' }, TR('k15'))
              : h('div', { className: 'lts-table-scroll' },
                h('table', { className: 'lts-table' },
                  h('thead', null, h('tr', null,
                    h('th', { style: { textAlign: 'left' } }, 'Agent'),
                    h('th', { style: { textAlign: 'left' } }, TR('k43')),
                    h('th', { style: { textAlign: 'left' } }, TR('k52')),
                    h('th', { style: { textAlign: 'left' } }, TR('k44')),
                    h('th', { style: { textAlign: 'left' } }, TR('k62')))),
                  h('tbody', null, agentRows)))),
          h('div', { className: 'lts-section' },
            h('h3', null, TR('k106'), h('span', { className: 'lts-section-note' }, TR('k107'))),
            h(HBars, {
              items: view.vendors.slice(0, 10).map(function (v) {
                return {
                  label: v.name,
                  raw: v.name,
                  value: v.total,
                  color: view.vendorColors[v.name],
                  title: v.name + ' · ' + fmtInt(v.total) + ' tokens · ' + v.modelCount + TR('k108') + fmtPct(v.hit)
                }
              }),
              onPick: function (it) { setVendorF(vendorF === it.raw ? 'all' : it.raw) }
            })))

        const detailTab = h('div', null,
          h('div', { className: 'lts-section' },
            h('h3', null, TR('k109') + view.models.length + (view.modelCountAll > view.models.length ? ' / ' + view.modelCountAll : '') + ')',
              h('span', { className: 'lts-section-note' }, TR('k110'),
                h('button', { className: 'lts-chip' + (mergeAgent ? ' lts-chip-on' : ''), onClick: function () { setMergeAgent(!mergeAgent) } }, TR('k169') + (mergeAgent ? ' ✓' : '')))),
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
                    h('td', { style: { textAlign: 'left' }, colSpan: 4 }, TR('k111') + view.tableTotals.count + TR('k112')),
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
            h('h3', null, TR('k113')),
            projects.length === 0
              ? h('div', { className: 'lts-empty' }, TR('k15'))
              : h('div', { className: 'lts-table-scroll' },
                h('table', { className: 'lts-table' },
                  h('thead', null, h('tr', null,
                    h('th', { style: { textAlign: 'left' } }, 'Agent'),
                    h('th', { style: { textAlign: 'left' } }, TR('k114')),
                    h('th', null, TR('k56')),
                    h('th', null, TR('k43')),
                    h('th', { style: { textAlign: 'left' } }, TR('k115')))),
                  h('tbody', null, projects.map(function (p, i) {
                    return h('tr', { key: p.a + '|' + p.name + '|' + i },
                      h('td', { style: { textAlign: 'left' } }, AGENT_LABELS[p.a] || p.a),
                      h('td', { style: { textAlign: 'left' }, className: 'lts-model', title: p.name }, shortPath(p.name)),
                      h('td', { className: 'lts-mono' }, fmtInt(p.n)),
                      h('td', { className: 'lts-mono lts-strong' }, fmtNum(p.total)),
                      h('td', { style: { textAlign: 'left' } }, fmtTime(p.lastAt)))
                  }))))))

        const sessAny = (function () {
          for (let i = 0; i < SESSION_AGENTS.length; i++) if ((sessCounts[SESSION_AGENTS[i]] || 0) > 0) return true
          return false
        })()
        const sessionsTab = h('div', null,
          h('div', { className: 'lts-section' },
            h('h3', null, TR('k116'),
              h('span', { className: 'lts-section-note' }, SESSION_AGENTS.map(function (sa) {
                const has = (sessCounts[sa] || 0) > 0
                return h('button', {
                  key: sa,
                  className: 'lts-chip' + (sessAgent === sa ? ' lts-chip-on' : '') + (has ? '' : ' lts-chip-dim'),
                  title: has ? '' : TR('k194'),
                  onClick: function () { sessPick.current = true; setSessAgent(sa) }
                }, sa === 'cursor' ? TR('k117') : (AGENT_LABELS[sa] || sa))
              }))),
            sessLoading
              ? h('div', { className: 'lts-empty' }, sessAgent === 'cursor' ? TR('k118') : TR('k119'))
              : sessError !== null
                ? h('div', { className: 'lts-error-banner' }, TR('k120') + sessError)
                : sessData === null || !Array.isArray(sessData.sessions) || sessData.sessions.length === 0
                  ? h('div', { className: 'lts-empty' }, (sessCounts[sessAgent] || 0) === 0 && sessAny ? TR('k194') : TR('k121'))
                  : h('div', { className: 'lts-table-scroll' },
                    h('table', { className: 'lts-table' },
                      h('thead', null, h('tr', null,
                        h('th', { style: { textAlign: 'left' } }, TRS('tab.sessions', '会话')),
                        h('th', { style: { textAlign: 'left' } }, TR('k114')),
                        h('th', { style: { textAlign: 'left' } }, TR('k55')),
                        h('th', null, TR('k122')),
                        h('th', null, 'Tokens'),
                        h('th', null, TR('k62')),
                        h('th', { style: { textAlign: 'left' } }, TR('k115')))),
                      h('tbody', null, sessData.sessions.map(function (sn, si) {
                        const stotal = sn.i + sn.o + sn.r + sn.cr + sn.cw + (sn.tt || 0)
                        return h('tr', { key: (sn.id || '') + si },
                          h('td', { style: { textAlign: 'left' }, className: 'lts-model', title: sn.title }, sn.title !== '' ? sn.title : TR('k123')),
                          h('td', { style: { textAlign: 'left' }, className: 'lts-model', title: sn.project }, shortPath(sn.project)),
                          h('td', { style: { textAlign: 'left' } }, h('span', { className: 'lts-pill', title: sn.model }, sn.model)),
                          h('td', { className: 'lts-mono' }, sn.n > 0 ? fmtInt(sn.n) : '—'),
                          h('td', { className: 'lts-mono' }, stotal > 0 ? fmtNum(stotal) : '—'),
                          h('td', { className: 'lts-mono' }, sn.c > 0 ? fmtCost(sn.c) : '—'),
                          h('td', { style: { textAlign: 'left' } }, fmtTime(sn.updatedAt || sn.createdAt)))
                      }))))))

        const sourcesTab = h('div', null,
          h('div', { className: 'lts-section' },
            h('h3', null, TR('k124')),
            h('div', { className: 'lts-src-grid' }, (data.sources || []).map(function (s) {
              return h('div', { key: s.id, className: 'lts-src' },
                h('div', null,
                  h('span', { className: 'lts-dot lts-dot-' + s.status }),
                  h('strong', null, s.label),
                  h('span', { className: 'lts-src-status' }, TRS('st.' + s.status, STATUS_LABELS[s.status] || s.status)),
                  s.drift ? h('span', { className: 'lts-drift-badge', title: TR('k125') + fmtTime(s.fileMtimeMs) + TR('k126') + fmtTime(s.lastActivityAt) + TR('k127') }, TR('k128')) : null),
                h('div', { className: 'lts-src-detail' }, s.detail || ''),
                s.lastActivityAt > 0 ? h('div', { className: 'lts-src-detail' }, TR('k129') + fmtTime(s.lastActivityAt)) : null,
                s.error ? h('div', { className: 'lts-src-error' }, String(s.error).slice(0, 200)) : null)
            }))),
          h('div', { className: 'lts-note' }, TR('k130')))

        const dayShown = dayDetail === null ? 0 : Math.min(dayDetail.length, dayAll ? dayDetail.length : 60)
        const dayDetailSection = daySel === null ? null : h('div', { className: 'lts-section lts-daysel', ref: dayRef },
          h('h3', null, '📅 ' + daySel + TR('k131'),
            h('span', { className: 'lts-section-note' }, (dayDetail === null ? 0 : dayDetail.length) + TR('k132')),
            dayDetail !== null && dayDetail.length > 60
              ? h('button', {
                className: 'lts-daymore',
                onClick: function () { setDayAll(!dayAll) },
                title: dayAll ? TR('k193') : TR('k192')
              }, dayAll ? TR('k193') : TR('k192') + '(' + dayDetail.length + ')')
              : null,
            h('button', { className: 'lts-dayclose', onClick: function () { setDaySel(null) } }, TR('k133'))),
          dayDetail === null || dayDetail.length === 0
            ? h('div', { className: 'lts-empty' }, TR('k134'))
            : h('div', null,
              h('div', { className: 'lts-heat-hint', style: { marginTop: 0 } },
                TR('k189') + dayShown + TR('k190') + dayDetail.length + TR('k191')),
              h('div', { className: 'lts-table-scroll' },
                h('table', { className: 'lts-table' },
                  h('thead', null, h('tr', null,
                    h('th', { style: { textAlign: 'left' } }, 'Agent'),
                    h('th', { style: { textAlign: 'left' } }, TR('k54')),
                    h('th', { style: { textAlign: 'left' } }, TR('k55')),
                    h('th', null, TR('k56')),
                    h('th', null, TR('k57')),
                    h('th', null, TR('k47')),
                    h('th', null, TR('k58')),
                    h('th', null, TR('k48')),
                    h('th', null, TR('k60')))),
                  h('tbody', null, (dayAll ? dayDetail : dayDetail.slice(0, 60)).map(function (e, i) {
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
                  }))))))

        const anyFilter = agent !== 'all' || vendorF !== 'all' || modelQ.trim() !== ''
        const clearFilters = function () { setAgent('all'); setVendorF('all'); setModelQ(''); setRange(30) }

        body = h('div', null,
          h('div', { className: 'lts-toolbar', ref: toolbarRef },
            // 会话页/数据源页不吃顶栏筛选:不摆一排按了没反应的按钮,直接把话说清楚。
            FILTER_TABS[tab] === false
              ? h('div', { className: 'lts-filters', style: { gap: '8px' } },
                h('span', { className: 'lts-filter-label' }, TR('k182')),
                h('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, tab === 'sources' ? TR('k183') : TR('k184')),
                anyFilter || range !== 30 ? h('button', { className: 'lts-btn', style: { padding: '3px 10px' }, onClick: clearFilters }, TR('k185')) : null)
              : h('div', { className: 'lts-filters' },
                h('span', { className: 'lts-filter-label' }, TR('k135')),
                h('button', { className: 'lts-chip' + (agent === 'all' ? ' lts-chip-on' : ''), onClick: function () { setAgent('all') } }, TR('k136')),
                chipAgents.map(function (a) {
                  return h('button', { key: a.id, className: 'lts-chip' + (agent === a.id ? ' lts-chip-on' : ''), onClick: function () { setAgent(agent === a.id ? 'all' : a.id) } }, AGENT_LABELS[a.id] || a.id)
                }),
                h('span', { className: 'lts-filter-label', style: { marginLeft: '10px' } }, TR('k137')),
                [7, 30, 90, 0].map(function (d) {
                  return h('button', { key: 'r' + d, className: 'lts-chip' + (range === d ? ' lts-chip-on' : ''), onClick: function () { setRange(d) } }, d === 0 ? TR('k136') : TR('k41') + d + TR('k42'))
                }),
                h('select', { className: 'lts-select', value: vendorF, onChange: function (e) { setVendorF(e.target.value) }, title: TR('k138'), 'aria-label': TR('k138') },
                  h('option', { value: 'all' }, TR('k139')),
                  vendorOpts.map(function (v) { return h('option', { key: v, value: v }, v) })),
                h('div', { className: 'lts-search' },
                  h('input', {
                    className: 'lts-search-input',
                    type: 'text',
                    ref: searchRef,
                    placeholder: TR('k140'),
                    'aria-label': TR('k140'),
                    title: TR('k140'),
                    value: modelQ,
                    onChange: function (e) { setModelQ(e.target.value) }
                  }),
                  modelQ !== '' ? h('button', { className: 'lts-search-clear', onClick: function () { setModelQ('') }, title: TR('k197'), 'aria-label': TR('k197') }, '✕') : null)),
            anyFilter || range !== 30
              ? h('div', { className: 'lts-active-filters' },
                h('span', { className: 'lts-filter-label' }, TR('k141')),
                agent !== 'all' ? h('button', { key: 'fa', className: 'lts-fchip', onClick: function () { setAgent('all') } }, (AGENT_LABELS[agent] || agent) + ' ✕') : null,
                vendorF !== 'all' ? h('button', { key: 'fv', className: 'lts-fchip', onClick: function () { setVendorF('all') } }, TR('k142') + vendorF + ' ✕') : null,
                modelQ.trim() !== '' ? h('button', { key: 'fm', className: 'lts-fchip', onClick: function () { setModelQ('') } }, TR('k143') + modelQ.trim() + TR('k168')) : null,
                range !== 30 ? h('button', { key: 'fr', className: 'lts-fchip', onClick: function () { setRange(30) } }, rangeLabel + ' ✕') : null,
                h('button', { key: 'fc', className: 'lts-fchip lts-fchip-clear', onClick: clearFilters }, TR('k144')))
              : null,
            h('div', { className: 'lts-tabs', role: 'tablist' }, TABS.map(function (tb, ti) {
              return h('button', {
                key: tb.id,
                ref: function (el) { tabRefs.current[tb.id] = el },
                role: 'tab',
                id: 'lts-tab-' + tb.id,
                'aria-controls': 'lts-panel-' + tb.id,
                'aria-selected': tab === tb.id ? 'true' : 'false',
                tabIndex: tab === tb.id ? 0 : -1,
                className: 'lts-tab' + (tab === tb.id ? ' lts-tab-on' : ''),
                onClick: function () { setTab(tb.id) },
                onKeyDown: function (e) {
                  let next = -1
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (ti + 1) % TABS.length
                  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (ti - 1 + TABS.length) % TABS.length
                  else if (e.key === 'Home') next = 0
                  else if (e.key === 'End') next = TABS.length - 1
                  else return
                  e.preventDefault()
                  const id = TABS[next].id
                  setTab(id)
                  const el = tabRefs.current[id]
                  if (el !== null && el !== undefined && typeof el.focus === 'function') el.focus()
                }
              }, TRS('tab.' + tb.id, tb.label))
            }))),
          dayDetailSection,
          data !== null && data.scanning === true
            ? h('div', { className: 'lts-status', role: 'status' },
              h('span', { className: 'lts-pulse' }),
              h('span', { className: 'lts-status-strong' }, TR('k175')),
              h('span', null, TR('k176')))
            : null,
          budgetAlert !== null ? h('div', { className: 'lts-budget-banner' }, TR('k145') + budgetAlert.join('; ')) : null,
          // 筛选后一条数据都没有:只在吃筛选的统计页给一屏可操作说明,不在每个分区重复
          // 「暂无数据」。数据源页例外 —— 那正是排查「为什么没数据」的地方,必须始终可见。
          // 内容统一包在 role=tabpanel 里,与上面的 aria-controls 真正对上。
          h('div', { role: 'tabpanel', id: 'lts-panel-' + tab, 'aria-labelledby': 'lts-tab-' + tab },
            isEmpty && FILTER_TABS[tab] !== false
              ? h('div', { className: 'lts-empty-panel' },
                h('div', { className: 'lts-empty-title' }, TR('k187')),
                h('div', { className: 'lts-empty-body' }, TR('k188')),
                h('div', { className: 'lts-empty-actions' },
                  anyFilter ? h('button', { className: 'lts-btn', onClick: function () { setAgent('all'); setVendorF('all'); setModelQ('') } }, TR('k185')) : null,
                  range !== 0 ? h('button', { className: 'lts-btn lts-btn-primary', onClick: function () { setRange(0) } }, TR('k186')) : null))
              : h('div', null,
                tab === 'overview' ? overviewTab : null,
                tab === 'trend' ? trendTab : null,
                tab === 'compare' ? compareTab : null,
                tab === 'detail' ? detailTab : null,
                tab === 'sessions' ? sessionsTab : null,
                tab === 'sources' ? sourcesTab : null)))
      }

      return h('div', { className: 'lts-scroll' },
        h('div', { className: 'lts-root' },
          h('div', { className: 'lts-header' },
            h('div', { className: 'lts-header-main' },
              h('h1', { className: 'lts-title' }, TR('k147')),
              h('div', { className: 'lts-meta' },
                data !== null
                  ? h('span', {
                    title: (ledgerInfo !== null
                      ? (ledgerInfo.persisted
                        ? TR('k148') + ledgerInfo.path + TR('k149') + fmtTime(ledgerInfo.savedAt) + TR('k150')
                        : TR('k151') + String(ledgerInfo.error || TR('k152')))
                      : '') + ' · ' + TR('k153') + fmtTime(data.generatedAt)
                  }, TR('k153') + fmtAgo(data.generatedAt, now) + ' · ' + (data.sources || []).filter(function (s) { return s.status === 'ok' || s.status === 'archived' }).length + TR('k154') + (ledgerInfo !== null ? (ledgerInfo.persisted ? TR('k155') : TR('k156')) : '') + currencyNote(data))
                  : h('span', null, TR('k157')),
                loading && data !== null ? h('span', { className: 'lts-spin' }, TR('k158')) : null)),
            h('div', null,
              h('div', { className: 'lts-actions' },
                h('button', { className: 'lts-btn lts-lang-btn', onClick: function () { const next = lang === 'zh' ? 'en' : 'zh'; LANG = next; uiCache.lang = next; setLang(next) }, title: 'Switch language / 切换语言' }, lang === 'zh' ? 'EN' : '中文'),
                h('label', { className: 'lts-auto' },
                  h('input', { type: 'checkbox', checked: auto, onChange: function (e) { setAuto(e.target.checked) } }),
                  TR('k161')),
                h('button', { className: 'lts-btn', disabled: exporting, onClick: doExport }, exporting ? TR('k162') : TR('k163')),
                h('button', { className: 'lts-btn lts-btn-primary', disabled: loading, onClick: function () { load(true) } }, loading ? TR('k158') : TR('k164'))))),
          error !== null ? h('div', { className: 'lts-error-banner' }, TR('k165') + error + (data !== null ? TR('k166') : '')) : null,
          body,
          // 导出/报告的结果原先挂在页头,和「点了哪里」隔着整页;改成右下角浮层,眼看得到、Esc 能收
          toast !== null
            ? h('div', { className: 'lts-toast lts-toast-' + toast.kind },
              h('div', { className: 'lts-toast-main', role: 'status' }, toast.text,
                h('div', { className: 'lts-toast-hint' }, TR('k196'))),
              h('button', { className: 'lts-toast-x', onClick: function () { setToast(null) }, title: TR('k195'), 'aria-label': TR('k195') }, '✕'))
            : null))
    }

    slots.inject('main', function () {
      slots.register({ name: 'main', key: 'llm-token-stats' }, function () {
        return React.createElement(Dashboard)
      })
    })
    slots.inject('sidebar.panellist', function () {
      slots.register({ name: 'sidebar.panellist', id: 'llm-token-stats', label: TR('k167'), order: 60 }, function (props) {
        return React.createElement(PanelIcon, props)
      })
    })

    }
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
