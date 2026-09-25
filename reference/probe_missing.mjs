import fs from 'node:fs';

const p = JSON.parse(fs.readFileSync('/home/danielsudenfield/ugridit_react/reference/pilot.json', 'utf8'));
for (const probe of ['Côte', "Korea, Democratic", "Lao People's"]) {
  const c = p.countries.find((x) => x.title.startsWith(probe));
  console.log('\nPILOT', JSON.stringify({ title: c?.title, iso3: c?.iso3, nid: c?.nid, region: c?.region }));
  if (c) {
    const n = ['currentStateLandStatus', 'threatsFires', 'trendsChart1'].map((s) => `${s}:${c[s]?.type ?? 'null'}`);
    console.log('  ', n.join(' | '));
  }
}
const res = await fetch('http://localhost:1337/api/countries?filters[name][$eq]=Côte d\'Ivoire&populate=*');
const j = await res.json();
console.log('\nCM via API', JSON.stringify(j.data?.[0] ?? null, null, 1)?.slice(0, 600));