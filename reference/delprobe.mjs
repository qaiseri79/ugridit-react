const BASE = 'http://localhost:1337';
const ADMIN_EMAIL = 'admin@ugridit.com';
const ADMIN_PASSWORD = 'Admin@ugridit123!';

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
  const login = await j('/admin/login', { method: 'POST', body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }) });
  const adminToken = login.data.token;

  const tokens = await j('/admin/api-tokens', {}, adminToken);
  const tok = tokens.data.find((t) => t.name === 'frontend-full-access');
  const apiToken = null;
  // create if needed
  let key;
  if (!tok) {
    const created = await j('/admin/api-tokens', { method: 'POST', body: JSON.stringify({ name: 'frontend-full-access', type: 'full-access', lifespan: null }) }, adminToken);
    key = created.data.accessKey;
  } else {
    console.log('existing token:', tok.name, tok.type);
    key = process.env.STRAPI_API_TOKEN;
  }
  if (!key) { console.log('no api key; create a test'); return; }

  // create test portfolio
  const created = await j('/api/portfolios', { method: 'POST', body: JSON.stringify({ data: { name: 'Test Person', slug: 'test-person', designation: 'Tester', publishedAt: new Date().toISOString() } }) }, key);
  const pid = created.data.documentId;
  const rid = created.data.id;
  console.log('created docId', pid, 'id', rid);

  // 1) delete via content-api
  const del = await j(`/api/portfolios/${rid}`, { method: 'DELETE' }, key);

  // inspect DB
}

main().catch((e) => { console.error(e.message); process.exit(1); });