const url =
  'http://localhost:1337/api/countries?populate=*&filters[slug][$eq]=algeria'
const j = await (await fetch(url)).json()
const c = j.data[0]
const w = c.data.widgets.currentStateChart2
console.log('name:', w.name, '| type:', w.type)
const body = w.code.replace(/''/g, "'")
console.log('--- code ---')
console.log(body.slice(0, 6000))