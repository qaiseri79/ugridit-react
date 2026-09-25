import { readFileSync } from 'node:fs'

const data = JSON.parse(readFileSync('./reference/pilot.json', 'utf8'))
const country = data.countries.find((x) => x.title === 'Algeria')

const slot = process.argv[2] || 'currentStateChart'
const v = country[slot]
console.log('=== name:', v?.name, '| slot:', slot, '===')
console.log(v?.code)