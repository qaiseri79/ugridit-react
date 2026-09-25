const KEY = 'a60a7dadd385fec3815cfa22d8e536a98f2e80d7bddb2c6c3276b68c33d9d8b8'
const url = 'https://search.mapx.org/indexes/views_en/search'
const res = await fetch(url, {
  method: 'OPTIONS',
  headers: {
    Origin: 'http://localhost:5173',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'x-meili-api-key,content-type',
  },
})
console.log('OPTIONS status', res.status)
for (const [k, v] of res.headers) console.log(k, ':', v)