import { execSync } from 'node:child_process'
const out = execSync(
  "cd /home/danielsudenfield/ugridit_react/ugridit_drupal && grep -rl --include=* 'white2' . 2>/dev/null | head -10",
  { maxBuffer: 10 * 1024 * 1024 },
)
console.log(String(out))