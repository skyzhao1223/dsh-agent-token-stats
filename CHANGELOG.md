# Changelog

## v1.2.0 (2026-10-20)

### Fixed
- **Cursor (IDE) 9-month data recovery**: newer Cursor builds empty local `usageData` (`{}`) and zero new bubbles' `tokenCount` (usage moved to the cloud), so the collector's WHERE filter silently dropped everything after mid-January — the schema-drift sentinel caught it (files fresh, parsed activity stale). The collector now degrades gracefully: composers without local usage/tokens are counted by assistant-bubble requests (tokens recorded 0, same treatment as the claude-code local gateway), attributed to `modelConfig.modelName` when present or `(cloud)` otherwise, day-anchored to composer creation for ratchet stability. Recovered ~215K requests (Cursor total 18K → 234K, spanning 2025-03 → 2026-10); old usageData-era accounting is untouched (identical code path), so the ledger ratchet stays consistent.
- **Drift sentinel tuning for cursor**: since cloud migration, an idle Cursor app still touches its DB files; the drift lag window for cursor is widened to 21 days (other sources keep 48h) to avoid false "schema drift" badges.

## v1.1.9 (2026-10-19)

### Changed — UX(信息架构 / 首屏 / 视觉一致性 / 侧栏与窄屏)
- **首屏不再是一屏空白加一句「正在加载」**:按真实版式铺骨架卡片与分区占位(用主题的 `--dsw-alias-bg-skeleton`),骨架出现期间不会先闪一下「暂无数据」;首次加载的 10~30 秒预期说明保留在状态条里。
- **数据新鲜度会说话**:meta 行的「更新于」改成相对时间(刚刚 / N 分钟前 / N 小时 / N 天,30 秒走一次字),绝对时间留在悬浮提示里。
- **后台扫描有正式的状态条**:扫描中显示脉动指示 + 「正在读取本地日志,下面先显示台账快照,扫完自动更新」,不再挤在 meta 行里当一行灰字。
- **自动刷新不再闪**:2 分钟一次的自动刷新改走静默通道,不再把主按钮切成「刷新中…」;只有手动刷新才有忙碌态。
- **筛选器不再骗人**:「数据源」页永远展示全部来源、「会话」页用自己的来源选择,这两页原先照旧摆着一排按了没反应的筛选控件;现在换成一句明确说明 + (有筛选时)一键清空。
- **空状态只出现一次且可操作**:筛选到空时不再每个分区各喊一遍「暂无数据」,而是给一屏说明 + 「清空筛选」/「切到『全部时间』」两个出口。
- **当日下钻不再「点了没反应」**:点热力图/趋势图后把明细区滚进视野,`scroll-margin-top` 在滚动那一刻按**吸顶工具条的实测高度**算(工具条 `top:-18px`,可用遮挡 = 高度 − 18),而不是猜一个常数 —— 窄屏筛选器换行会让工具条更高,原先的 112px 只会把明细藏到工具条底下;`prefers-reduced-motion` 下退化为瞬时滚动。超过 60 行时明确写出「显示前 60 条 · 共 N 条」并提供展开/收起——此前是静默截断。
- **导出/报告反馈搬到右下角轻提示**:结果原先挂在页头、离点击处隔着整页;现在浮层显示、6~12 秒自动消失、`Esc` 可关。
- **会话页默认选中有数据的来源**:此前写死 OpenCode,没在用 OpenCode 的人打开会话页只看到「无会话数据」;现在按台账里真实有请求的来源排序,无数据的来源淡显并标注。
- **键盘可达性**:`/` 聚焦模型搜索(`Cmd/Ctrl/Alt + /` 不劫持),`Esc` 依次收起提示 → 清空搜索 → 关闭当日明细;页签补上 `tablist`/`tab`/`tabpanel` 语义、`aria-selected`、roving `tabindex` 与 ←/→/Home/End;所有原生可聚焦控件补 `:focus-visible` 焦点环;`.lts-chip:disabled` 不再和可用态长得一样。
  - `Esc` 的边界写清楚了:只有焦点在**本插件的搜索框**里才清模型筛选;焦点在别的输入框(自动刷新勾选框、宿主自己的输入框)时不越权改筛选;焦点在别的文本域时整个快捷键让位(既不清筛选也不关明细)。
  - **诚实说明**:热力格、条形图、图例、表格行/表头仍是 `div/tr/th + onClick`,只支持鼠标 —— 把 180 个热力格塞进 tab 序列比不给更糟,所以这里不宣称「全键盘可达」。
- **无障碍与窄屏**:侧栏面板图标补 `role="img"` + `aria-label` + SVG `<title>`(属性形式的 title 浏览器不保证显示);搜索框的 ✕ 有了自己的 `aria-label`(此前借用「清空全部」,语义不对);首屏加载条也补 `role="status"`;新增 `max-width: 640px` 断点(内边距、卡片、条形标签、页签横滚),根内边距与吸顶工具条的负外边距统一由 `--lts-pad-x` 驱动,不再各写一份 24px。
- **动效克制**:新增 `prefers-reduced-motion: reduce` 分支,关闭过渡/动画与 hover 位移;下钻滚动据此在 `smooth` 与 `auto` 之间切换。

### Fixed
- **静默刷新会抹掉手动刷新的忙碌态**:2 分钟定时刷新与 5 秒扫描轮询走静默通道,但它们此前同样调用 `setLoading(false)`,会把用户刚点的「立即刷新」从「刷新中…」变回可点,导致重复刷新;静默通道现在不碰 `loading`。
- **静默轮询失败会让状态条卡死**:失败时原先会取消轮询且不再重排,host 仍在扫描时「后台扫描中」会一直挂到下一个 2 分钟;现在按 15 秒退避重试(最多 4 次),服务不可用时也不会无限空转。
- **`Esc` 越权清筛选**:键盘监听挂在 `window` 上,此前只要焦点在任何 `<input>` 上就当作在搜索框里,于是在自动刷新勾选框上按一下 `Esc` 就会清掉模型筛选;现在只在焦点确实是本插件搜索框时才生效。
- 删掉两个已经没人引用的文案键(`k146` / `k170`),中英各 192 键、零悬空。

### Added
- `scripts/verify-ux.mjs`(秒级、已进 CI):自带极小 React 垫片把 Dashboard 真渲染一遍,39 条断言覆盖上面每一项。垫片会真的调用提交阶段的 ref、真的跑 effect cleanup、并在 `runTimers` 后移除已触发的定时器 —— 所以 `searchRef.current.focus()`、`dayRef.current.scrollIntoView()`、页签 roving focus、卸载收走监听这些路径都能被断到,而不是被垫片静默跳过。
- 断言的不是「DOM 里有这个 class」而是行为:静默响应不许改手动刷新的忙碌态、静默失败必须排 15 秒重试、`Esc` 在宿主输入框上不许改筛选、`Cmd+/` 不许被劫持、`aria-controls` 必须指向真实存在的 `tabpanel`、热力格超过 60 行时「展开全部」必须真的多出行来。
- 变异自检(11 处)已复核:删掉骨架 / toast / 筛选器说明 / 数据源页豁免 / 静默 `loading` 守卫 / 15 秒退避 / `Esc` 边界 / 修饰键守卫 / `aria-controls` / `tabpanel` / 实测滚动偏移,断言分别挂在预期的那一条;`LTS_CLIENT=<file>` 可复现。这是**结构级**验证,配色与真实对比度仍需在浏览器里人工确认。

## v1.1.8 (2026-10-19)

### Added
- **展示币种与汇率**:`pricing.json` 新增 `display`(面板/报告/CSV 的币种)、`unit`(你写的价目用的币种,默认 USD)、`fx`(1 USD = fx display)。内置美元价、上报的美元费用、以及规则自带的币种都会换算到 `display` 后再展示;缺 `fx` 时**不瞎算**——原样显示并在 meta 行标注「缺 fx,跨币种金额未换算」,报告头部也写清金额单位。别名可用 `¥ / ￥ / CNY / RMB / 人民币` 或 `$ / USD / 美元`。CSV 列名随币种变化(`cost_cny` / `est_cost_cny`)并新增末列 `currency`。
- **推理 token 计费**:`rt` 字段(缺省=输出价)。此前推理 token 计入总量却**不计费**,推理模型因此被低估。
- **DeepSeek 分档价目** + **单条规则自带币种**:内置表新增 `deepseek-v4.1-flash` / `deepseek-v4-flash` / `deepseek-reasoner` 三个细分行(仍保留 `deepseek` 兜底),细分行先命中;`pricing.json` 的规则可逐条写 `unit`(例如 WPS 网关按人民币报价)。
- `scripts/verify-pricing.mjs`(秒级、已进 CI):币种换算、规则币种、细分 pattern 优先、推理计费、未命中=0、上报按美元换算、缺 fx 告警,共 7 组断言。

### Changed
- 预算告警的 cost 阈值按展示币种解读,面板里的告警金额也带上币种符号。
- 报告头部新增「金额单位 / fx」一行;方法论文案(中英)同步说明匹配顺序、币种与推理计费规则。

## v1.1.7 (2026-10-19)

### Fixed
- **Dark mode: white-on-white primary controls**. This harness's `--dsw-alias-brand-primary` is the *strong neutral* color (light `#0f1115`, dark `#f9fafb`), not a brand accent. Every filled control styled as `background: brand-primary; color: #fff` therefore collapsed to 1.05:1 in dark mode: the "立即刷新" button, the active filter chips ("全部", "跨 Agent 合并 ✓") and the count badge beside them were invisible. Fills now use `--dsw-alias-label-primary` with `--dsw-alias-bg-base` text — the same pattern the native primary button uses (measured in the live GUI: light `#0f1115` on `#fff`, dark `#f9fafb` on `#151517`).
- **Status text legibility**: `--dsw-alias-state-success/warn/error-primary` are theme-flat (`#22c55e`/`#f59e0b` in both themes), so as *text* on white they sat at 2.1–2.3:1 — period deltas, the export confirmation, the drift badge and source errors were washed out in light mode. Text now uses theme-aware inks (light `#15803d`/`#b45309`/`#b91c1c`, dark `#4ade80`/`#fbbf24`/`#f87171`); the raw state tokens still fill the status dots.
- **Dark-mode shadows**: `rgba(0,0,0,.09–.2)` elevation shadows are invisible on dark surfaces; they now follow `body[data-ds-dark-theme]` through local variables, and the focus ring / chip glow switched from a fixed blue to the theme's neutral ink.

Verified in the live GUI over CDP (emulated light + dark, computed styles on every visible element): contrast violations on this panel went from 2 classes (worst 1.05:1) to **0** in dark, and 1 class (2.28:1) to **0** in light.

## v1.1.6 (2026-10-18)

### Fixed
- **Panel open blocked for ~75s (measured 73.8s / 78.2s per open)**: `GET /agent-token-stats/data` ran a full re-collection inline before answering. Because the activity signature is newest-mtime based and Cursor/DSH/Claude Code logs are written continuously, *every* open (and every 2-minute auto-refresh) re-ran the Cursor IDE query over a 16GB `state.vscdb` (~70s) plus the DSH zstd rescan (~16s). The route now serves the in-memory result immediately and moves any rescan to the background (stale-while-revalidate); on a cold start it answers from the persisted ledger snapshot instead of waiting. Manual refresh returns instantly too and reports `scanning:true`.
- **Re-scan thrash**: activity signatures of live logs change constantly, so a 70s scan was being launched on every poll. Per-source cooldowns now bound rescan frequency (Cursor 10min, DSH 3min, Claude/OpenCode 2min, default 1min); a change observed during a cooldown keeps its stale signature and is collected when the cooldown expires, so nothing is dropped. The ledger ratchet still merges the full scan, so totals stay exact.
- **Concurrent ledger saves could corrupt the ledger**: background scan and manual refresh used the same `ledger.json.tmp`. Saves now go through a unique `mktemp` file before the atomic rename.

### Added
- **Boot-time contention**: the warm-up full scan now starts a few seconds after the profile mounts instead of during harness boot, and it no longer duplicates a scan already triggered by the first panel request.
- Client polls every 5s while the host reports `scanning:true` and shows a "后台扫描中 / Scanning…" indicator, so the panel fills in as soon as the background scan lands.
- `scripts/verify-cold-snapshot.mjs` (fast, in CI: cold first paint must come from the ledger snapshot), `scripts/verify-instant-open.mjs` (real HOME: cold/warm/forced opens must stay in the millisecond range) and `scripts/verify-cooldown.mjs` (fixture HOME: cooldown suppresses rescans, deferred signature changes are still collected).

## v1.1.5 (2026-10-09)

### Changed
- **Model totals merge across agents by default**: the Top-Models chart, model detail table and weekly/monthly report Top-10 now aggregate by vendor+model instead of agent+model ("how much did I use qwen3.8-max in total" gets one answer). A "跨 Agent 合并 / Merge across agents" toggle (detail tab + overview Top Models) restores the per-agent split; merged rows show contributing agents (e.g. `DSH+OpenCode`, full list on hover) and expand to a per-agent breakdown table (requests / total / hit rate / cost) above the daily trend. Daily trends of merged rows aggregate per day across agents and providers.

## v1.1.4 (2026-10-08)

### Fixed
- **Panel-wide white-screen crash**: the i18n translation function was named `t`, which several render scopes already bind as a local (worst case `periodCard(title, t, …)` where `t` is the period totals object). With real data rendered, `t('kNN')` hit the non-function local → TypeError → React unmounted the whole tree. Translation functions renamed to `TR`/`TRS` (collision-free); verified headlessly across all six tabs with live data, zero console errors.
- **EN toggle did not repaint**: `LANG` was synced in a post-render effect, so the first re-render still read the old language. The toggle now assigns `LANG`/`uiCache.lang` synchronously before `setLang`; verified Overview→Trends→…→Sources flip instantly and flip back.

## v1.1.3 (2026-10-08)

### Fixed
- **Shell compat shim actually awaits**: `shell.execute(spec)` resolves to a live `ShellExecution` handle; v1.1.1 tested `.result` on the still-pending promise, fell through, and read the handle's in-flight `exitCode: null` as a failure ("shell exited with code null"). Every command succeeded all along. The shim now awaits the promise, then awaits `result()` for the foreground ShellRunResult.

## v1.1.2 (2026-10-08)

### Fixed
- **DSH 0.2.0 sandbox policy for plugin shell calls**: agentless calls now default to the composition's `sandbox-policy` row (`workspace-write` at the server cwd), which denied ledger writes under `~/.agent-token-stats` and confined every log scan through seatbelt. All shell requests now carry an explicit `danger-full-access` policy (the plugin's function is machine-wide log reading plus its own data dir), with a bare-resolve fallback for 0.1.x hosts.

### Improved
- Shell failures now report full classification (exit code, signal, timedOut, aborted, effective timeout, sandbox facts, stderr excerpt, command prefix) instead of a bare exit code.
- Signature scan retries once, then degrades to full collection: one broken scan can no longer 500 the whole dashboard (collectors were already guarded).

## v1.1.1 (2026-10-08)

### Fixed
- **DSH 0.2.0 host compatibility**: the shell service renamed `run(spec)` to `execute(spec)` (returning a live handle settled via `result()`). All three call sites now go through a `shellStart()` shim supporting both API generations, so the bundle runs on 0.1.x and 0.2.x hosts.

## v1.1.0 (2026-09-22)

### Fixed
- **OpenCode storage-migration blind spot**: OpenCode moved messages from `message` to `session_message` (nested `model.id` shape) plus a `session_v2` table; the legacy table froze at migration, silently dropping all newer usage. The collector now probes `sqlite_master` and unions legacy rows with `session_message` rows strictly after the freeze point — overlap-free by construction, ratchet-consistent with existing ledger keys.
- **WAL signature gaps**: `state.vscdb-wal` (Cursor), `state.db-wal` (Hermes), `local.db-wal` (Lingma) are now watched, so WAL-only writes trigger re-collection.
- **Hover popups clipped by overflow containers**: trend tooltip is now `position: fixed` following the mouse with viewport-edge flipping; donut SVG allows overflow for the widened hover arc; heatmap padding accommodates the hover scale.

### Added
- **Session Explorer tab**: per-session title / project / model / messages / tokens / cost for OpenCode, CodeWhale and Cursor (Cursor results cached 30 min server-side).
- **Schema-drift sentinel**: a source whose files keep updating while its parsed activity stays >48h behind gets a "⚠ possible schema drift" badge — silent breakage becomes visible.
- **Claude Code auto-delete warning**: detects a missing/short `cleanupPeriodDays` and warns in the source card.
- **Budget alerts**: `~/.agent-token-stats/config.json` → `{"budgets":{"dailyTokens":N,"monthlyTokens":N,"dailyCost":N,"monthlyCost":N}}`; exceeding shows a red banner.
- **User-editable pricing**: `~/.agent-token-stats/pricing.json` → `{"rules":[{"pat":"model-substr","i":$,"o":$,"cr":$,"cw":$}]}` (USD per 1M tokens); user rules take precedence over built-ins.
- **Weekly / monthly Markdown reports**: one-click download with period-over-period deltas, per-agent / per-vendor / top-model tables.
- **API quota query**: DeepSeek balance + Kimi/Moonshot balance via `~/.agent-token-stats/quota.json` (`{"deepseek":{"apiKey":"..."},"kimi":{"apiKey":"..."}}`) or `DEEPSEEK_API_KEY` / `MOONSHOT_API_KEY` env vars; keys stay local.
- **English UI**: header `EN / 中文` toggle covering all interface chrome (host-generated source details remain Chinese).
- **CI**: dependency-free smoke workflow (`node --check` + factory/slot dry-run).

## v1.0.0 (2026-09-22)

- Initial public release: cross-agent token usage dashboard with persistent ratchet ledger, 10 parsed sources + 9 detection/standby sources, cache-hit analytics, cost estimation, comparison views, day drill-down, sticky filter toolbar, CSV export.
