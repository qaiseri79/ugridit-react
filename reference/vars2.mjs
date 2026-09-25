import { execSync } from 'node:child_process'
const out = execSync(
  "cd /home/danielsudenfield/ugridit_react/ugridit_drupal/web/themes/ugridt && grep -rhoE --include=*.pcss --include=*.html --include=*.css -E '--[a-zA-Z0-9-]+:[^;]+;' src index.html 2>/dev/null | sort -u",
  { maxBuffer: 10 * 1024 * 1024 },
)
const pats = ['white2', 'white3', 'white4', 'dark', 'red', 'soil', 'green', 'blue']
const lines = String(out).split('\n')
for (const l of lines) {
  const name = (l.match(/^--([a-zA-Z0-9-]+):/) || [])[1]
  if (name && pats.some((p) => name.toLowerCase().includes(p.toLowerCase()))) console.log(l)
}