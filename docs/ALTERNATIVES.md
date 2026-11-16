# Related tools / 社区同类工具

Checked against public project documentation on **2026-11-16**. This is a documentation comparison, not an installation benchmark. Features, source formats and support matrices change; verify the linked documents before choosing a tool.

| Project | Main use case | Relationship to this plugin |
| --- | --- | --- |
| [AI Token Report — DSH plugin](https://github.com/zhujunzhujunzhu/ai-token-report/tree/main/packages/dsh-plugin) | DSH-embedded multi-source usage, model/project/session views, cache analysis and optional team reporting | Direct native alternative. Its documented sources include DSH, Codex, Claude Code, Trae and WorkBuddy. Optional reporting is not enabled just by using local stats; read its specific configuration/privacy docs. |
| [Sessions Insight](https://github.com/Mt-Youya/dsh-plugins/tree/main/plugins/sessions-insight) | Inspect Claude/DSH/Codex sessions and turns, context composition and compression | More about explaining session/context behavior; overlaps with session browsing, not identical to long-term multi-tool consumption tracking. |
| [ShallBay/dsh-token-stats](https://github.com/ShallBay/dsh-token-stats) | DSH token events, retries and persistent rollups | A DSH-focused alternative; multi-model/provider support is not necessarily multi-Agent-source support. |
| [JingbiaoMei/Tokdash](https://github.com/JingbiaoMei/Tokdash) | Independent local dashboard/CLI/TUI, broad client matrix, session explorer and durable SQLite history | Strong external alternative with broader interaction/distribution options. [Current source matrix](https://github.com/JingbiaoMei/Tokdash/blob/main/docs/reference/SUPPORTED_CLIENTS.md) and [retention semantics](https://github.com/JingbiaoMei/Tokdash/blob/main/docs/reference/HISTORY_RETENTION.md) should be consulted; do not claim it loses all deleted logs. |
| [ccusage](https://github.com/ccusage/ccusage) | CLI daily/monthly/session reports, JSON and cache/cost analysis across multiple tools | Prefer for terminal/script workflows. Current [application README](https://github.com/ccusage/ccusage/blob/main/apps/ccusage/README.md) is multi-source: saying “only Claude Code” would be outdated. |
| [better-ccusage](https://github.com/cobra91/better-ccusage) | Multi-tool CLI/MCP and provider pricing matching | Another script/Agent-integration alternative. Its comparisons against upstream may become stale; inspect each project's current docs independently. |

Quota/balance panels answer a different question (“how much credit remains?”). They should not be described as equivalent to historical token analytics. Likewise [ben-vargas/tokdash](https://github.com/ben-vargas/tokdash) is a different repository from JingbiaoMei/Tokdash: it aggregates ccusage snapshots across machines/SSH.

## Honest positioning

This project's focus is **a native DSH sidebar, personal cross-tool analysis, selected Chinese-tool adapters, and explicit data-quality/measurement boundaries**. It is not the first cross-Agent tracker, does not claim the most sources, and is not a provider billing system. Cursor support depends on available local fields; unknown tokens stay unknown. Historical persistence is useful but not unique, and an aggregate high-water ledger is not an event-level audit database.
