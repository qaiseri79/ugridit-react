const BASE = 'http://localhost:1337';

async function req(route, options = {}, token) {
  const headers = { ...(options.headers ?? {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${route}`, { ...options, headers });
  const text = await res.text();
  let j = null;
  try { j = JSON.parse(text); } catch { }
  if (!res.ok) throw new Error(`${options.method ?? 'GET'} ${route} -> ${res.status} ${text.slice(0, 300)}`);
  return j;
}

const login = await req('/admin/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'admin@ugridit.com', password: 'Admin@ugridit123!' }),
});
const admin = login.data.token;

const list = await req('/content-manager/collection-types/api::country.country?page=1&pageSize=100', {}, admin);
const total = list.pagination?.total ?? 0;
const results = [...list.results];
for (let p = 2; p <= Math.ceil(total / 100); p += 1) {
  const next = await req(`/content-manager/collection-types/api::country.country?page=${p}&pageSize=100`, {}, admin);
  results.push(...next.results);
}

const stale = results.filter((r) => !r.iso3);
console.log('stale (no iso3):', stale.length, stale.map((r) => `${r.slug} (${r.name})`).join('; '));
for (const r of stale) {
  await req(`/content-manager/collection-types/api::country.country/${r.documentId}`, { method: 'DELETE' }, admin);
  console.log('deleted', r.slug);
}

const after = await req('/content-manager/collection-types/api::country.country?page=1&pageSize=1', {}, admin);
console.log('remaining countries:', after.pagination?.total);