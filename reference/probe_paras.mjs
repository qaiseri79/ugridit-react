import { spawn } from 'node:child_process';

const DUMP = '/home/danielsudenfield/ugridit_react/ugridit_drupal/backup-2025-07-18T11-18-06.mysql.gz';

const stream = spawn('gzip', ['-dc', DUMP], { stdio: ['ignore', 'pipe', 'inherit'] });
const buf = [];
stream.stdout.on('data', (chunk) => buf.push(chunk));
stream.stdout.on('end', () => analyze(Buffer.concat(buf).toString('utf8')));

function unescapeMySql(v) {
  if (!v || v === 'NULL') return null;
  if (v.startsWith("'") && v.endsWith("'")) {
    return v
      .slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\')
      .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
  }
  return v;
}
function parseRows(line) {
  const start = line.indexOf('(');
  if (start < 0) return [];
  const values = line.slice(start, line.lastIndexOf(')') + 1);
  const rows = [];
  let cur = [], field = '', inStr = false, i = 0;
  while (i < values.length) {
    const c = values[i];
    if (inStr) {
      if (c === '\\') { field += c + (values[i + 1] ?? ''); i += 2; continue; }
      if (c === "'") { inStr = false; field += c; }
      else field += c;
      i += 1; continue;
    }
    if (c === "'") { inStr = true; field += c; i += 1; continue; }
    if (c === '(') { i += 1; continue; }
    if (c === ',') { cur.push(field); field = ''; i += 1; continue; }
    if (c === ')') {
      cur.push(field); field = '';
      rows.push(cur.map((v) => unescapeMySql(v))); cur = [];
      let j = i + 1;
      while (j < values.length && ' \n\r'.includes(values[j])) j += 1;
      if (values[j] === ',') { i = j + 1; continue; }
      i = j; continue;
    }
    field += c; i += 1;
  }
  return rows;
}

function analyze(text) {
  const lines = text.split('\n');
  const gets = (table) => lines.filter((l) => l.includes(`INSERT INTO \`${table}\``));

  // 1. node tables containing 'iso' or flag-ish fields
  const tables = [...new Set(text.match(/`node__field_[a-z_0-9]+`/g) ?? [])];
  console.log('-- node tables with iso/flag/country hints --');
  console.log(tables.filter((t) => /iso|flag|region|socio_econom/.test(t)).join('\n'));

  // 2. paragraph table list
  const ptables = [...new Set(text.match(/`paragraph__field_[a-z_0-9]+`/g) ?? [])];
  console.log('\n-- paragraph field tables --\n' + ptables.join('\n'));

  // 3. sample paragraph rows for ids 1714, 1741, 1766, 190
  console.log('\n-- paragraphs table --');
  for (const l of gets('paragraph')) {
    const rows = parseRows(l);
    for (const r of rows.slice(0, 200)) {
      // id, type(uuid), bundle, langcode
      if ([1714, 1741, 1766, 1772, 190, 1892].includes(Number(r[0]))) {
        console.log(`  id=${r[0]} bundle=${r[2]} uuid=${r[1]?.slice(0, 20)}`);
      }
    }
  }

  // 4. paragraph__field_media sample for those paragraph ids (media refs)
  console.log('\n-- paragraph__field_media sample (all rows limited) --');
  for (const l of gets('paragraph__field_media')) {
    const rows = parseRows(l);
    for (const r of rows) {
      if ([1714, 1741, 1766, 1772, 190, 1892].includes(Number(r[3]))) {
        console.log(`  para=${r[3]} delta=${r[6]} mediaId=${r[7]}`);
      }
    }
  }
  // 5. paragraph__field_field_block (block refs) + field_image_link + field_slide_banner
  for (const t of ['paragraph__field_image_link', 'paragraph__field_field_block', 'paragraph__field_slide_banner']) {
    console.log(`\n-- ${t} sample --`);
    for (const l of gets(t)) {
      const rows = parseRows(l);
      for (const r of rows.slice(0, 12)) {
        console.log('  ' + r.join(' | ').slice(0, 160));
      }
    }
  }

  // 6. profile PDF documents field on nodes
  console.log('\n-- node tables w/ document/pdf hints --');
  console.log((tables.filter((t) => /profile_picture|document/.test(t))).join('\n') ?? 'none');
}