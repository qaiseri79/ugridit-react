const url =
  'http://localhost:1337/api/countries?populate=*&filters[slug][$eq]=algeria'
const j = await (await fetch(url)).json()
const c = j.data[0]
for (const slot of ['currentStateChart', 'currentStateChart2', 'threatsChart1', 'trendsChart1']) {
  const w = c.data.widgets[slot]
  const body = w.code.replace(/''/g, "'")
  const m = body.match(/const html\s*=\s*`([\s\S]*?)`;/)
  console.log('==== ', slot, w.name, ' ====')
  console.log((m ? m[1] : '(no html template)').trim().slice(0, 400))
}