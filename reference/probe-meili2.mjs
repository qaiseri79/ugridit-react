const KEY = 'a60a7dadd385fec3815cfa22d8e536a98f2e80d7bddb2c6c3276b68c33d9d8b8'
const res = await fetch('https://search.mapx.org/indexes/views_en/search', {
  method: 'POST',
  headers: { 'X-Meili-API-Key': KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ q: '', filters: null, facetFilters: [['projects_id:MX-0SA-E4R-H05-H6Z-F3O', 'projects_id:MX-L2W-HWZ-RIC-LM1-Y0V', 'projects_id:MX-A3M-LVK-V7S-XOT-J48']], facetsDistribution: ['source_keywords'], limit: 400 }),
})
console.log('status', res.status)
for (const [k, v] of res.headers) console.log(k, ':', v)