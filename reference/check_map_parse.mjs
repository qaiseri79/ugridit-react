const url =
  'http://localhost:1337/api/countries?populate=*&filters[slug][$eq]=algeria'
const j = await (await fetch(url)).json()
const c = j.data[0]
const w = c.data.widgets.mapCountryOverview
const body = w.code
  .replace(/''/g, "'")
  .replace(/https:\/\/dash\.unccd\.unepgrid\.ch\/api/g, '/api/dataviz')
  .replace(/\[grid-dataviz:iso3cc\]/g, c.data.iso3 ? c.data.iso3.toUpperCase() : 'XXX')
try {
  new Function(body)
  console.log('map widget PARSE OK')
} catch (e) {
  console.log('PARSE FAIL', e.message)
}