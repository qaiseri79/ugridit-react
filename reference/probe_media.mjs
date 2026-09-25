import { spawn } from 'node:child_process';

const DUMP = '/home/danielsudenfield/ugridit_react/ugridit_drupal/backup-2025-07-18T11-18-06.mysql.gz';

const stream = spawn('gzip', ['-dc', DUMP], { stdio: ['ignore', 'pipe', 'inherit'] });
const buf = [];
stream.stdout.on('data', (chunk) => buf.push(chunk));
stream.stdout.on('end', () => analyze(Buffer.concat(buf).toString('utf8')));

function analyze(text) {
  const lines = text.split('\n');
  const finds = (table) => lines.filter((l) => l.includes(`INSERT INTO \`${table}\``));
  const gets = (table) => finds(table).join('');

  // media entity rows: id, uuid, bundle...
  const mediaRows = parseRows(gets('media') && gets('media')).map((r) => r);
  console.log('-- media (id, bundle, name) relevant --');
  const wanted = [188,189,190,191,192,193,204,205,206,217,219,220,221,223,224,225,226,227,228,229,236,238,239,242,243,245,259];
  const mediaField = finds('media_field_data');
  for (const l of mediaField) {
    for (const row of parseRows(l)) {
      // id, uuid, bundle, langcode, name, created, changed, default_langcode, revision_created, etc
      const id = row[0];
      if (wanted.includes(Number(id))) {
        console.log(`  ${row[0]}\tbundle=${row[2]}\tname=${row[4] ?? row[3]}`);
      }
    }
  }
  console.log('\n-- media names seen for all ids --');
  const seen = new Set();
  for (const l of mediaField) {
    for (const row of parseRows(l)) {
      const id = Number(row[0]);
      if (id >= 184 && id <= 300 && !seen.has(id)) {
        seen.add(id);
        console.log(`  ${row[0]}\tbundle=${row[2]}\tname=${row[1]}`);
      }
    }
  }
}

// Minimal MySQL-escaped SQL row parser for VALUES tuples within one INSERT statement.
function parseRows(line) {
  const out = [];
  const start = line.indexOf('(');
  if (start < 0) return out;
  const values = line.slice(start, line.lastIndexOf(')') + 1);
  let i = 0;
  const rows = [];
  let cur = [];
  let field = '';
  let inStr = false;
  while (i < values.length) {
    const c = values[i];
    if (inStr) {
      if (c === '\\') { field += c + (values[i + 1] ?? ''); i += 2; continue; }
      if (c === "'") { inStr = false; field += c; i += 1; continue; }
      field += c; i += 1; continue;
    }
    if (c === "'") { inStr = true; field += c; i += 1; continue; }
    if (c === '(') { i += 1; continue; }
    if (c === ',') { cur.push(field); field = ''; i += 1; continue; }
    if (c === ')') {
      cur.push(field); field = '';
      rows.push(cur); cur = [];
      // skip a trailing comma if next non-space is '('
      let j = i + 1;
      while (j < values.length && (values[j] === ' ' || values[j] === '\n' || values[j] === '\r')) j += 1;
      if (values[j] === ',') { i = j + 1; while (i < values.length && values[i] === ' ') i += 1; continue; }
      i = j; continue;
    }
    field += c; i += 1;
  }
  return rows.map((r) => r.map((v) => unescapeMySql(v)));
}

function unescapeMySql(v) {
  if (!v) return v;
  if (v === 'NULL') return null;
  if (v.startsWith("'") && v.endsWith("'")) {
    let inner = v.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    // handle other escaped chars minimally
    inner = inner.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\0/g, '\0');
    return inner;
  }
  return v;
}