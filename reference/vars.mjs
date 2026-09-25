import { execSync } from 'node:child_process'
const out = execSync(
  "cd /home/danielsudenfield/ugridit_react/ugridit_drupal/web/themes/ugridt && grep -rhoE --include=*.pcss --include=*.html --include=*.css -E '@[a-zA-Z0-9-]+|--[a-zA-Z0-9-]+:[^;]+;' src index.html 2>/dev/null | sort -u",
  { maxBuffer: 10 * 1024 * 1024 },
)
const lines = String(out).split('\n').filter((l) => l.includes(':') && !l.includes('/'))
for (const l of lines) console.log(l.replace(/^.*?(@|--)/, '$1').slice(-120))