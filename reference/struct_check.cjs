const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');

// Show body classes
const bodyM = html.match(/<body[^>]*class="([^"]*)"/);
console.log('BODY CLASS:', bodyM ? bodyM[1] : '');

// banner paragraph block
const banner = html.match(/<div class="relative paragraph paragraph--type--banner[\s\S]*?<\/div>\s*<\/div>/);
if (banner) {
  console.log('\n=== BANNER PARAGRAPH ===');
  console.log(banner[0].replace(/\s+/g, ' ').slice(0, 1200));
}

// field items
const fi = html.match(/<div class="mb-4 field__item">[\s\S]*?<\/div>\s*<\/div>/g);
if (fi) {
  console.log('\n=== FIELD ITEMS (' + fi.length + ') ===');
  fi.forEach((f, i) => console.log('--- item ' + i + ':', f.replace(/\s+/g, ' ').slice(0, 500)));
}

// glossary view block
const g = html.match(/<div class="views-element-container block[\s\S]*?country-profile-glossary[\s\S]*?<\/div>\s*<\/div>/);
if (g) {
  console.log('\n=== GLOSSARY VIEW BLOCK ===');
  console.log(g[0].replace(/\s+/g, ' ').slice(0, 2500));
}

// countries-count
const cc = html.match(/<div[^>]*class="[^"]*countries-count[^"]*"[\s\S]*?<\/div>/);
if (cc) {
  console.log('\n=== COUNTRIES COUNT ===');
  console.log(cc[0].replace(/\s+/g, ' ').slice(0, 600));
}

// search/dropdown block
const sd = html.match(/<div class="search">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
if (sd) {
  console.log('\n=== SEARCH / DROPDOWN ===');
  console.log(sd[0].replace(/\s+/g, ' ').slice(0, 900));
}

// bg-gradient
const bg = html.match(/<div class='bg-gradient-custom'><\/div>/);
console.log('\nBG GRADIENT DIV:', bg ? bg[0] : 'NOT FOUND');

// main content wrapper classes
const w = html.match(/<main role="main">[\s\S]*?<div class="container mt-4">[\s\S]*?<div class=[^>]*country-page[^>]*>/);
console.log('\nMAIN/COUNTRY WRAPPER:', w ? w[0].replace(/\s+/g, ' ').slice(0, 400) : 'NOT FOUND');