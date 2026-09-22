# dsh-agent-token-stats

跨 Agent 的本地 LLM token 用量看板(DSH web profile bundle)。

- **Host 半**:扫描本机 10+ 个 AI 工具的对话记录(Claude Code / OpenCode / Cursor IDE / DSH / OpenClaw / QClaw / CodeWhale / WorkBuddy / WPS Claude / Hermes,另有 Codex / Gemini CLI / Cline / Pi 解析器待命),按「来源×供应商×模型×日」聚合,内置参考价目表做成本估算(与上报费用分列),增量棘轮合并持久化到 `~/.agent-token-stats/ledger.json`(源日志删除后历史仍留存),并在 webServer 上注册 `GET /token-stats/data`、`GET /token-stats/export` 两个 loopback 路由。
- **Client 半**:侧边栏「Token 用量」面板:概览卡(环比涨跌)、厂商/缓存构成环形图(悬停+点击筛选)、堆叠趋势图(悬停明细+点击下钻当日)、活跃热力图(点击下钻)、模型明细表(排序/搜索/展开每日走势/合计行)、时间段环比、Agent 横向对比、数据源状态页、CSV 导出、吸顶筛选工具栏、2 分钟自动刷新、秒开缓存。

## 安装

```sh
dsh plugin --profile web add file:/path/to/dsh-agent-token-stats
# 重启 web profile 生效
```

依赖:系统自带 `sqlite3`、`jq`、`zstd`(macOS 需 `brew install zstd`)。
