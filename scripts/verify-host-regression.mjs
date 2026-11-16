import { spawnSync } from 'node:child_process'
const result = spawnSync(process.execPath, ['--test', 'tests/host/core.test.mjs', 'tests/host/routes.test.mjs'], { stdio: 'inherit' })
if (result.error) throw result.error
process.exit(result.status ?? 1)
