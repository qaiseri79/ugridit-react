const fs = require('fs')
const html = fs.readFileSync('/tmp/detail_afghanistan.html', 'utf8')
// all stylesheet links
const c = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/g)].map((m) => m[0])
console.log(c.join('\n'))
// all css mentions
console.log('\nALL css refs:')
const r = [...html.matchAll(/[^"'\s]+\.css[^"'\s]*/g)].map((m) => m[0]).filter((x, i, a) => a.indexOf(x) === i)
console.log(r.join('\n'))