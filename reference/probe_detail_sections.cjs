const fs = require('fs')
const html = fs.readFileSync('/tmp/detail_afghanistan.html', 'utf8')

function section(id, len = 3500) {
  const i = html.indexOf(`id="${id}"`)
  if (i === -1) return `NOT FOUND: ${id}\n`
  return `\n=== ${id} ===\n${html.slice(i, i + len)}\n`
}

let out = ''
// map overview content
out += section('map_overview', 2500)
// overview section title + read more structure
out += section('overview_section_title', 2600)
// a text tab (current state land status)
out += section('current-state-land-status', 2000)
// secondary area: chart section title + current state chart
out += section('chart_section_title', 1500)
out += section('current_state_chart', 3500)
// commitments
out += section('commitment_section_title', 1200)
out += section('all-commitment', 4000)
// treaties
out += section('treaties_section_title', 500)
// select country modal content + a country pill list example
out += section('country-list', 1200)
fs.writeFileSync('/tmp/detail_sections.txt', out)
console.log('written', out.length)
// also grab the dataviz wrapper sample for a chart
const ci = html.indexOf('grid-dataviz-custom-code')
console.log('\nDATAVIZ sample:', html.slice(ci, ci + 800))