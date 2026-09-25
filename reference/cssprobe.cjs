const fs = require('fs');
const s = fs.readFileSync('/home/danielsudenfield/ugridit_react/reference/css2.css', 'utf8');
for (const key of ['.view-portfolio', '.views-view-responsive-grid__item', '--views-responsive']) {
  let idx = s.indexOf(key);
  console.log('=== ' + key + ' === at ' + idx);
  while (idx >= 0) {
    console.log(s.slice(Math.max(0, idx - 80), idx + 340).replace(/\s+/g, ' '));
    console.log('---');
    idx = s.indexOf(key, idx + 1);
    if (idx > 400000) break;
  }
}