const https = require('https')
const fs = require('fs')
const urls = [
  ['/tmp/detail_live_d2.css', 'https://www.geogli.com/sites/default/files/css/css_l3Wl4sddi38EKk8irNxGR8WozExSroeE2hjLuv8fO5g.css'],
  ['/tmp/detail_live_d4.css', 'https://www.geogli.com/sites/default/files/css/css_uDIPkn3YQJdvDDuFomqXE0QnoNyZLe66GNVXIWqhK7I.css'],
]
function get(file, url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => {
        fs.writeFileSync(file, data)
        console.log(file, res.statusCode, data.length)
        resolve()
      })
    }).on('error', (e) => { console.log('ERR', e.message); resolve() })
  })
}
;(async () => {
  for (const [f, u] of urls) await get(f, u)
})()