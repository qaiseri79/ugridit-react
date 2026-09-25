const fs = require('fs')
const css = fs.readFileSync('/tmp/detail_live_d4.css', 'utf8')
const out = []
// find all country-profile tab rules
const re = /[^{}@]*page-node-type-country-profile[^{}@]*\{[^@}]*\}/gs
let m
let count = 0
while ((m = re.exec(css)) !== null && count < 120) {
  out.push(m[0])
  count++
}
fs.writeFileSync('/tmp/detail_extract.css', out.join('\n\n'))
console.log('matched blocks:', count)
// Also grab .country-profile-content-secondary rules and tabs-country-profile anywhere
const re2 = /[^{}@]*(\.tabs-country-profile|\.tab-content|\.country-profile-content-secondary|\.commitment|\.summary-charts|\.select-country|\.print-country-profile|\.read-more|\.dashboard-toggle|\.sidebar-menu|\.website-layout)[^{}@]*\{[^@}]*\}/gs
let count2 = 0
const out2 = []
while ((m = re2.exec(css)) !== null && count2 < 300) { out2.push(m[0]); count2++ }
fs.writeFileSync('/tmp/detail_extract2.css', out2.join('\n\n'))
console.log('agg2 count:', count2)