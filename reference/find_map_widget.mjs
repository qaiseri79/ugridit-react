import { readFileSync } from 'node:fs'
const p = JSON.parse(readFileSync('reference/pilot.json', 'utf8'))

const names = new Set()
function walk(o, parent) {
  if (Array.isArray(o)) { o.forEach((x) => walk(x, parent)); return }
  if (!o || typeof o !== 'object') return
  if (typeof o.name === 'string') {
    if (o.name.toLowerCase().includes('map')) {
      console.log('WIDGET name:', o.name, '| type:', o.type, '| parent:', parent && parent.name)
    }
    names.add(o.name)
  }
  for (const [k, v] of Object.entries(o)) {
    if (v && typeof v === 'object') walk(v, o)
  }
}
walk(p, null)
console.log('--- all widget names ---')
console.log([...names].sort().join('\n'))