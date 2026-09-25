const fs = require('fs');
const css = fs.readFileSync('reference/css2.css', 'utf8');
fs.writeFileSync('reference/css2.pretty.css', css.replace(/}/g, '}\n'));
console.log(fs.readFileSync('reference/css2.pretty.css', 'utf8').split('\n').length);