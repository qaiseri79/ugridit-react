import { execSync } from 'node:child_process'
const out = execSync(
  "cd /home/danielsudenfield/ugridit_react/ugridit_drupal/web && grep -rhoE --include=*.css --include=*.pcss -E '--(white[0-9]?|dark|form|soil)[a-z0-9-]*:[^;]+;' . 2>/dev/null | sort -u | head -40",
  { maxBuffer: 20 * 1024 * 1024 },
)
console.log(String(out))