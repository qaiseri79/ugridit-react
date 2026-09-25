import { readFileSync } from 'node:fs'

const data = JSON.parse(readFileSync('./reference/pilot.json', 'utf8'))

const country = data.countries.find((x) => x.title === 'Algeria')
if (!country) {
  console.log('Algeria not found')
  process.exit(1)
}

console.log('country keys:', Object.keys(country).join(', '))

const which = process.argv[2]
const slots = which
  ? [which]
  : [
      'currentStateChart',
      'currentStateChart2',
      'threatsChart1',
      'threatsChart2',
      'trendsChart1',
      'trendsChart2',
      'trendsChart3',
      'impactsChart1',
      'impactsChart2',
      'solutionsChart1',
      'solutionsChart2',
      'mapCountryOverview',
    ]

const widgets = country

for (const slot of slots) {
  const v = widgets[slot]
  console.log('\n=============== ' + slot + ' ===============')
  if (!v) {
    console.log('(no widget)')
    continue
  }
  console.log('typeof:', typeof v, '| keys:', v && typeof v === 'object' ? Object.keys(v).join(',') : 'n/a')
  if (typeof v === 'string') console.log('STRING>', v.slice(0, 800))
  if (v && typeof v === 'object' && v.code) {
    const codes = v.code
    const scripts = codes.match(/<script>[\s\S]*?<\/script>/gi) || []
    for (const s of scripts) console.log('SCRIPT>', s.slice(0, 1500))
    const apiCalls = codes.match(/(?:getJSON|fetch|ajax)\([^)]{0,200}/gi) || []
    console.log('API CALLS>', apiCalls)
    console.log('HAS Highcharts:', /Highcharts/.test(codes))
    console.log('HTML head>', codes.slice(0, 300))
  }
}