const data = await fetch('http://localhost:1337/api/portfolios?populate=*').then((r) => r.json());
for (const item of data.data) {
  const p = item.photo;
  console.log(item.slug, 'photo type=', Array.isArray(p) ? 'array' : typeof p, p ? JSON.stringify(p).slice(0, 200) : p);
}
const one = await fetch(`http://localhost:1337/api/portfolios/one/${data.data[0].documentId}?populate=*`).then((r) => r.json());
console.log('--- findOne (documentId) keys:', Object.keys(one.data ?? {}));