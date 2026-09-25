const Database = require('/home/danielsudenfield/ugridit_react/backend/node_modules/better-sqlite3');
const db = new Database('/home/danielsudenfield/ugridit_react/backend/.tmp/data.db', { readonly: true });
console.log('TABLES with portfolio:', db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%portfolio%'").all().map(r => r.name));
for (const t of ['portfolios', 'portfolios_localizations']) {
  try {
    const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name).join(',');
    console.log(`--- ${t} cols: ${cols}`);
    const rows = db.prepare(`SELECT id, name, slug, published_at FROM ${t}`).all();
    console.log(rows);
  } catch (e) {
    console.log(`err ${t}: ${e.message}`);
  }
}