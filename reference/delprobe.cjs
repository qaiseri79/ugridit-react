const BASE = 'http://localhost:1337';
const ADMIN_EMAIL = 'admin@ugridit.com';
const ADMIN_PASSWORD = 'Admin@ugridit123!';
const Database = require('/home/danielsudenfield/ugridit_react/backend/node_modules/better-sqlite3');
const db = new Database('/home/danielsudenfield/ugridit_react/backend/.tmp/data.db', { readonly: false });

function rows() {
  return db.prepare('SELECT id, document_id, name, slug, published_at FROM portfolios').all();
}

async function j(route, opts = {}, token) {
  const headers = { ...(opts.headers ?? {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${route}`, { ...opts, headers });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  console.log(`${opts.method ?? 'GET'} ${route} -> ${res.status}`);
  if (!res.ok) console.log('   ', text.slice(0, 200));
  return json;
}

async function main() {
  console.log('BEFORE:', rows());
  const login = await j('/admin/login', { method: 'POST', body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }) });
  const adminToken = login.data.token;

  const tokenRes = await j('/admin/api-tokens', {}, adminToken);
  const key = tokenRes.data.find((t) => t.name === 'frontend-full-access')?.accessKey
    || 'not-found';

  const target = rows()[0];
  console.log('target row', target);

  if (target) {
    // Try content-api delete first
    const del = await j(`/api/portfolios/${target.id}`, { method: 'DELETE' }, key);
    console.log('AFTER content-api delete:', rows());

    const target2 = rows()[0];
    if (target2) {
      // Try content-manager delete with documentId via admin JWT
      const cmDel = await j(`/content-manager/collection-types/api::portfolio.portfolio/${target2.document_id}`, { method: 'DELETE' }, adminToken);
      console.log('AFTER content-manager delete:', rows());
    }
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });