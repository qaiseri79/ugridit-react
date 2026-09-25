import { readFileSync } from 'node:fs'
const css = readFileSync('/home/danielsudenfield/ugridit_react/ugridit_drupal/web/themes/ugridt/assets/map/index.css', 'utf8')
const classes = [
  'h-app-mobile', 'h-app', 'h-header', 'shadow-map-mobile', 'presentation-map',
  'interact-with-map', 'interact-with-layer', 'interact-with-layer-2',
  'explore-list', 'workspace-button', 'active-help', 'interact-normal-theme',
  'interact-zoom-out', 'interact-zoom-in', 'interact-landscape', 'interact-globe',
  'interact-travel', 'interact-dark-theme', 'interact-map', 'interact-geocoder',
  'bg-form', 'bg-green2', 'bg-orange-2', 'bg-soil', 'bg-gray-7', 'border-secondary',
  'border-gray1', 'text-light', 'rounded-small', 'bg-green', 'text-h1', 'bg-blue',
  'text-gray-2', 'border-gray-2', 'bg-white-2', 'bg-green3',
]
const re = new RegExp(`\\.(${classes.join('|')})\\b[^{]*\\{[^}]*\\}`, 'g')
const seen = new Set()
let m
const out = []
while ((m = re.exec(css))) {
  const lines = m[0].split('\n')
  const first = lines.find((l) => l.trim().startsWith('.'))
  const key = (first || '').trim().split(/[ :{/]/)[0]
  if (seen.has(key)) continue
  seen.add(key)
  out.push(m[0])
}
console.log(out.join('\n\n'))