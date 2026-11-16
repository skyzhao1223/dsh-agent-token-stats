# Roadmap / 路线图

These are priorities, not shipped promises or dates.

## Shipped in v1.3

- API-request and assistant-message semantics, unknown token disclosure.
- Schema-aware OpenCode ID deduplication and Cursor unattributed measurements.
- Cross-process ledger locking, validated backup recovery and owner-authenticated routes.
- Real React rendering regressions and panel-level error recovery.

## Highest-value next work

1. **Event-level accounting:** the aggregate high-water ledger cannot prove the exact new events after log rotation. Introduce stable event identities/incremental source checkpoints with an explicit, reversible legacy migration.
2. **Source completeness:** distinguish missing source records from missing usage fields using per-source parsing counters; keep field coverage separate from original-log coverage.
3. **Current live-GUI acceptance:** verify theme contrast, narrow screens, keyboard navigation and hover clipping on the supported DSH version. Synthetic demo screenshots are not live acceptance.
4. **Platform portability:** real Linux fixture/system tests first; Windows support only after command/path and sandbox behavior are verified.
5. **Price provenance:** maintain dates and sources for reference pricing, surface unsupported models and avoid suggesting subscription-invoice accuracy.
6. **Distribution:** npm first publication and trusted-publisher configuration require maintainer-side account actions. GitHub installation remains the current documented route.

## Non-goals

- Hidden installation/usage telemetry or credential uploads.
- Claiming perfect accuracy across every tool and version.
- Treating bubble counts as billable API requests or GitHub clone counts as installed users.
- Replacing provider invoices, account quota systems or log retention policies.
