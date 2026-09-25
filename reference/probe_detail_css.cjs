const https = require('https')
const fs = require('fs')
const url = 'https://www.geogli.com/sites/default/files/css/css_0bsMMR1InSYCUNHHMxfCz8EgOMG79leHFq-aO4CRZ8k.css'
https.get(url, (res) => {
  let data = ''
  res.on('data', (c) => (data += c))
  res.on('end', () => {
    fs.writeFileSync('/tmp/detail_live.css', data)
    console.log('status', res.statusCode, 'bytes', data.length)
  })
}).on('error', (e) => console.log('ERR', e.message))