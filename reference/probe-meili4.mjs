const KEY = 'a60a7dadd385fec3815cfa22d8e536a98f2e80d7bddb2c6c3276b68c33d9d8b8'
const res = await fetch('https://search.mapx.org/indexes/views_en/search', {
  method: 'POST',
  headers: {
    'X-Meili-API-Key': KEY,
    'Content-Type': 'application/json',
    Origin: 'http://localhost:5173',
  },
  body: JSON.stringify({ q: '', filters: null, facetFilters: [['projects_id:MX-0SA-E4R-H05-H6Z-F3O']], facetsDistribution: ['source_keywords'], limit: 400 }),
})
console.log('status', res.status, 'acao:', res.headers.get('access-control-allow-origin'))
const j = await res.json()
console.log('hits', j.hits?.length)