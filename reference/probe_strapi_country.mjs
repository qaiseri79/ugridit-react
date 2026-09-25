const url =
  'http://localhost:1337/api/countries?populate=*&filters[slug][$eq]=algeria'
const res = await fetch(url)
console.log('status', res.status)
const j = await res.json()
const c = j.data?.[0]
if (!c) { console.log('no data', JSON.stringify(j).slice(0, 500)); process.exit(0) }
console.log('name:', c.name)
console.log('mapCountryOverview:', JSON.stringify(c.mapCountryOverview))
console.log('cpOverview length:', (c.cpOverview ?? '').length)
const widgets = (c.data?.widgets ?? {})
console.log('data.widgets keys:', Object.keys(widgets).join(', ') || '(none)')
for (const [k, v] of Object.entries(widgets)) {
  if (v) console.log('  ', k, '=>', v.type, v.name)
}
console.log('data keys:', Object.keys(c.data ?? {}).join(', '))