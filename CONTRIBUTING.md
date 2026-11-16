# Contributing / 贡献指南

欢迎报告解析缺口、提交新来源适配或改善看板。先看 [统计边界](README.md#reliability-and-measurement-boundaries) 和 [安全说明](SECURITY.md)。

## Development

```sh
npm ci --ignore-scripts
npm test
node --check lib/index.js
node --check lib/client.js
```

Tests use isolated HOME and synthetic logs. Never use someone's real credential files or full conversation databases as committed fixtures.

## Adapter checklist

1. Describe the tool/version, file location, schema and supported platform.
2. Separate measured API requests from assistant messages, session counts and snapshots. Missing usage is **unknown**, not measured zero.
3. Do not infer per-model tokens by cost share, invent prices, or add reasoning/cache fields already included in another field without checking the source semantics.
4. Test old and new schema shapes, explicit zero vs missing values, message-ID overlap, malformed input and retained last-good data.
5. Explain event time attribution and fork/resume deduplication. Preserve existing ledger rows; schema changes need a read-only diff before any destructive migration.
6. Keep expensive scans bounded. A single unsupported source must not blank the dashboard.

## Bug reports

Use the Bug Report template with DSH/plugin/source versions, OS, the sanitized error and reproduction steps. Optional minimal schema/JSON examples should contain field names and synthetic values only.

**Do not upload:** raw conversations, full databases, API keys, cookies, auth tokens, credential configurations or unredacted screenshots. A `ledger.json` includes project/model history and is not a public fixture.

## Pull requests

Keep the scope focused, add fixtures and tests, state the verification limits and update the changelog. Real React tests are behavior regression, not pixel/theme validation. A CI pass alone does not establish complete source coverage or live profile activation.

For security concerns, avoid publishing working credentials or private records in Issues; see [SECURITY.md](SECURITY.md). Maintainer release workflows are manual. Do not add runtime installation telemetry.
