const url =
  'http://localhost:1337/api/countries?populate=*&filters[slug][$eq]=algeria'
const j = await (await fetch(url)).json()
const c = j.data[0]
const w = c.data.widgets.mapCountryOverview
console.log('name:', w.name, '| type:', w.type)
console.log('--- code (first 3000 chars) ---')
console.log(w.code.slice(0, 3000))
console.log('--- code length:', w.code.length)