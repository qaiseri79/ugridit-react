const fs = require('fs')
const html = fs.readFileSync('/tmp/detail_afghanistan.html', 'utf8')
const hrefs = [...html.matchAll(/href="([^"]+\.css[^"]*)"/g)].map((m) => m[1]).filter((x, i, a) => a.indexOf(x) === i)
console.log(hrefs.join('\n'))