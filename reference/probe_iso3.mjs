import { spawn } from 'node:child_process';

const DUMP = '/home/danielsudenfield/ugridit_react/ugridit_drupal/backup-2025-07-18T11-18-06.mysql.gz';
const stream = spawn('gzip', ['-dc', DUMP], { stdio: ['ignore', 'pipe', 'inherit'] });
const buf = [];
stream.stdout.on('data', (chunk) => buf.push(chunk));
stream.stdout.on('end', () => analyze(Buffer.concat(buf).toString('utf8')));

function analyze(text) {
  const lines = text.split('\n');
  const wanted = new Set(['1714', '1741', '1766', '1772', '1892']);
  for (const l of lines.filter((l) => l.includes('INSERT INTO `paragraphs_item`'))) {
    const m = l.match(/\)/g);
    for (const part of l.split('),(').slice(0, 4000)) {
      const m2 = part.match(/^\(?'(\d+)','(\d+)','([a-z_0-9]+)','([a-f0-9-]+)','en'/);
      if (m2 && wanted.has(m2[1])) {
        console.log(`paragraphs_item id=${m2[1]} currentRev=${m2[2]} bundle=${m2[3]} uuid=${m2[4]}`);
      }
    }
  }
  console.log('\n-- paragraph__field_country_iso3 present? --');
  console.log(lines.some((l) => l.includes('paragraph__field_country_iso3')) ? 'yes' : 'no');
  console.log(lines.some((l) => l.includes('field_country_iso3')) ? 'iso3 strings present' : 'no iso3 strings');
  console.log('\n-- risk_metrics sample --');
  for (const l of lines.filter((l) => l.includes('INSERT INTO `paragraph__field_risk_metrics`'))) {
    console.log(l.slice(0, 500));
  }
  console.log('\n-- taxonomy term rows (countries) count & iso3 sample --');
  let n = 0;
  for (const l of lines.filter((l) => l.includes('INSERT INTO `taxonomy_term_data`'))) {
    const parts = l.split('),(');
    for (const part of parts) {
      const m = part.match(/'(\d+)','(\d+)','([a-z_0-9]+)','([a-f0-9-]+)','en'/);
      if (m) { n++; if (n <= 5) console.log(`term id=${m[1]} vid=${m[2]} name=${m[3]}`); }
    }
  }
  console.log(`total taxonomy_term_data: ~${n}`);
  // country tax vocab terms with iso3
  const iso3Rows = [];
  for (const l of lines.filter((l) => l.includes('INSERT INTO `taxonomy_term__field_country_iso3`'))) {
    const m3 = l.match(/^.*VALUES \('(?<vid>[a-z_0-9]+)','0','(?<tid>\d+)'.*'(?<iso>[A-Z0-9]{2,3})'\)/);
    if (m3) iso3Rows.push(`${m3.groups.tid}=${m3.groups.iso}`);
  }
  console.log(`iso3 term rows (first only): ${iso3Rows.slice(0, 8).join(' ')} total=${iso3Rows.length}`);
}