import { execSync } from 'node:child_process'
const out = execSync(
  "cd /home/danielsudenfield/ugridit_react/ugridit_drupal && grep -rhoE --include=*.css --include=*.pcss -E '--[a-zA-Z0-9-]+:[^;]+;' . 2>/dev/null | sort -u | grep -iE 'white[0-9]?|dark|form|soil|gray' | head -50",
  { maxBuffer: 30 * 1024 * 1024 },
)
console.log(String(out))