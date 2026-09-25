import { readFileSync } from 'node:fs'

const data = JSON.parse(readFileSync('./reference/pilot.json', 'utf8'))
const country = data.countries.find((x) => x.title === 'Algeria')
const iso3 = 'DZA'

const slots = [
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
]

const win = { $: ((el) => ({ html: (h) => (el.innerHTML = h), find: () => ({ append: () => {} }) })), Highcharts: { chart() {}, getJSON() {} } }
const oldGID = (globalThis.document = undefined)

for (const slot of slots) {
  const v = country[slot]
  if (!v || v.type !== 'code') {
    console.log(slot, '=> no code widget')
    continue
  }
  let body = v.code.replace(/''/g, "'").replace(/\[grid-dataviz:iso3cc\]/g, iso3)
  try {
    const fn = new Function('window', 'document', `var window=${JSON.stringify(win)},document={getElementById:()=>null};` + body)
    console.log(slot, '=> SYNTAX OK')
  } catch (e) {
    console.log(slot, '=> FAIL:', e.message)
  }
}

// also confirm all unique chart container ids on the Algeria summary page don't collide
const ids = new Set()
for (const slot of slots) {
  const v = country[slot]
  if (!v || v.type !== 'code') continue
  const m = v.code.match(/id="([^"]+)"/g) || []
  for (const x of m) {
    const id = x.slice(4, -1)
    if (ids.has(id)) console.log('DUPLICATE ID:', id)
    ids.add(id)
  }
}
console.log('unique ids:', [...ids].join(', '))