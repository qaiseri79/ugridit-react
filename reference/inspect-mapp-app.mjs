import { readFileSync } from 'node:fs'

const base = '/home/danielsudenfield/ugridit_react/ugridit_drupal/web/themes/ugridt/src/map'
const d = JSON.parse(readFileSync(`${base}/data_json/data_unccd_map.json`, 'utf8'))
console.log('rows', d.length)
console.log('keys', Object.keys(d[0]))
console.log(JSON.stringify(d[0], null, 1).slice(0, 800))
const add = JSON.parse(readFileSync(`${base}/data_json/additional_views.json`, 'utf8'))
console.log('---ADDITIONAL---')
console.log('rows', add.length)
console.log('keys', Object.keys(add[0]))
console.log(JSON.stringify(add[0], null, 1).slice(0, 600))