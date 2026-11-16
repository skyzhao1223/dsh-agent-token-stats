# Security and privacy

This plugin reads local agent log files and databases and writes only its own `~/.agent-token-stats` ledger/config/export directory. It does not report usage, log content, credentials, machine identifiers or installation IDs to the author.

## HTTP surface

All `/agent-token-stats/*` routes require the running DSH connection service to admit an **owner** principal, plus same-origin checks. A missing connection-admission service fails closed rather than enabling an unauthenticated compatibility path. Loopback binding or an Origin header alone is not authentication; reverse proxies must preserve DSH's authentication layer.

## Optional outbound requests

The quota action contacts the configured official DeepSeek/Moonshot balance APIs only when the user explicitly asks to check. Keys remain Host-side and are never returned to the browser. Authentication errors must not be echoed with raw credentials.

Author-side GitHub traffic archiving and npm release workflows are separate from plugin runtime. GitHub traffic counts events, not installed users. npm publication uses owner-controlled trusted publishing; neither release tokens nor authenticator secrets should be pasted into agent conversations. Revoke any token that has already been exposed.

## Data recovery

Ledger writes are locked across processes and atomically replaced. Hourly backups are validated before recovery; damaged primaries are retained for inspection. Stale lock files are not automatically removed because doing so risks releasing another process's lock. Inspect the owner PID and stop all writers before manual lock cleanup. Backups contain local model/project history and should not be uploaded with a bug report.

Report issues with sanitized error messages and schema/field names. Do not attach conversation text, credential files, full local database files, auth cookies or unsanitized screenshots.
