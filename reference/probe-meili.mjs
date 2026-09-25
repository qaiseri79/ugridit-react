const KEY = 'a60a7dadd385fec3815cfa22d8e536a98f2e80d7bddb2c6c3276b68c33d9d8b8'
const url = 'https://search.mapx.org/indexes/views_en/search'
for (const body of [
  { q: '', filters: null, facetFilters: [['projects_id:MX-0SA-E4R-H05-H6Z-F3O', 'projects_id:MX-L2W-HWZ-RIC-LM1-Y0V', 'projects_id:MX-A3M-LVK-V7S-XOT-J48']], facetsDistribution: ['source_keywords'], limit: 400 },
  { q: '', filters: 'projects_id = MX-0SA-E4R-H05-H6Z-F3O OR projects_id = MX-L2W-HWZ-RIC-LM1-Y0V OR projects_id = MX-A3M-LVK-V7S-XOT-J48', limit: 400 },
  { q: '', limit: 400 },
]) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'X-Meili-API-Key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  console.log('---')
  console.log('status', res.status, 'cors', res.headers.get('access-control-allow-origin'))
  const j = await res.json()
  if (j.hits) console.log('hits', j.hits.length, JSON.stringify(j.hits[0], null, 0).slice(0, 250))
  else console.log(JSON.stringify(j).slice(0, 400))
}