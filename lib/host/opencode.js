const identifier = name => '"' + name.replaceAll('"', '""') + '"'
const has = (schema, table, field) => schema[table]?.includes(field)

/** Build only against inspected columns. New table wins duplicate message IDs;
 * timestamps are not a migration cutoff (interleaved and backfilled IDs count). */
export function openCodeSql(schema) {
  const parts = []
  for (const table of ['session_message', 'message']) {
    if (!schema[table]) continue
    for (const required of ['id', 'data', 'time_created']) if (!has(schema, table, required)) throw new Error('Unsupported OpenCode schema: ' + table + '.' + required)
    if (table === 'session_message' && !has(schema, table, 'type')) throw new Error('Unsupported OpenCode schema: session_message.type')
    const t = identifier(table), json = suffix => "json_extract(x.data,'$." + suffix + "')"
    const modern = table === 'session_message'
    let cwd = json('path.root'), joins = ''
    if (has(schema, table, 'session_id')) {
      const paths = []
      for (const session of ['session_v2', 'session']) {
        if (has(schema, session, 'id') && has(schema, session, 'directory')) {
          const alias = session === 'session_v2' ? 'sv' : 'so'
          joins += ` LEFT JOIN ${identifier(session)} ${alias} ON ${alias}.id=x.session_id`
          paths.push(alias + '.directory')
        }
      }
      if (paths.length) cwd = 'coalesce(' + paths.concat(cwd).join(',') + ')'
    }
    const model = modern ? "coalesce(" + json('model.id') + ',' + json('modelID') + ')' : json('modelID')
    const provider = modern ? "coalesce(" + json('model.providerID') + ',' + json('providerID') + ')' : json('providerID')
    let where = modern ? "x.type='assistant'" : json('role') + "='assistant'"
    if (!modern && schema.session_message) where += " AND NOT EXISTS (SELECT 1 FROM session_message newer WHERE newer.id=x.id AND newer.type='assistant')"
    const fallback = modern && schema.message
    if (fallback) joins += " LEFT JOIN message older ON older.id=x.id AND json_extract(older.data,'$.role')='assistant'"
    const numeric = (owner, suffix) => `CASE WHEN json_type(${owner}.data,'$.${suffix}') IN ('integer','real') AND json_extract(${owner}.data,'$.${suffix}')>=0 THEN json_extract(${owner}.data,'$.${suffix}') END`
    const measured = suffix => `coalesce(${numeric('x', suffix)}${fallback ? ',' + numeric('older', suffix) : ''})`
    // An empty tokens object is unknown. Explicit numeric zero is known; keep
    // valid legacy measurements if a migrated duplicate omitted its usage.
    const tokenFields = ['input:i', 'output:o', 'reasoning:r', 'cache.read:cr', 'cache.write:cw']
    const measurements = tokenFields.map(pair => {
      const [token, alias] = pair.split(':')
      const value = fallback ? measured('tokens.' + token) : numeric('x', 'tokens.' + token)
      return { alias, value }
    })
    const known = measurements.map(item => item.value + ' IS NOT NULL').join(' OR ')
    const cost = fallback ? measured('cost') : numeric('x', 'cost')
    parts.push(`SELECT x.id AS id, ${provider} AS p, ${model} AS m, ${cwd} AS cwd, date(x.time_created/1000,'unixepoch','localtime') AS d, ` +
      measurements.map(({value,alias})=>`coalesce(${value},0) AS ${alias}`).join(', ') + `, coalesce(${cost},0) AS c, x.time_created AS la, CASE WHEN ${known} THEN 1 ELSE 0 END AS known FROM ${t} x${joins} WHERE ${where}`)
  }
  if (!parts.length) throw new Error('Unsupported OpenCode schema: no message table')
  return 'SELECT p,m,cwd,d,count(*) AS n,sum(i) AS i,sum(o) AS o,sum(r) AS r,sum(cr) AS cr,sum(cw) AS cw,sum(c) AS c,max(la) AS la,sum(known) AS known FROM (' + parts.join(' UNION ALL ') + ') GROUP BY p,m,cwd,d;'
}

export const OPEN_CODE_SCHEMA_SQL = "SELECT m.name AS table_name, p.name AS column_name FROM sqlite_master m JOIN pragma_table_info(m.name) p WHERE m.type='table' AND m.name IN ('message','session_message','session','session_v2');"
export function parseOpenCodeSchema(rows) {
  const schema = {}
  for (const row of rows) (schema[row.table_name] ||= []).push(row.column_name)
  return schema
}
