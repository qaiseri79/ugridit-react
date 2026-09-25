/**
 * Seed script: creates the 195 country profile entries (name, slug, region)
 * sourced from the geogli.com country dropdown + UN M49 region codes.
 *
 * Run inside the backend dir while Strapi is running:
 *   node scripts/seed-countries.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.STRAPI_URL ?? 'http://localhost:1337';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@ugridit.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@ugridit123!';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COUNTRIES = JSON.parse(fs.readFileSync(path.join(__dirname, 'countries.json'), 'utf8'));

async function request(route, options = {}, token) {
  const headers = { ...(options.headers ?? {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${BASE}${route}`, { ...options, headers });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  if (!res.ok) {
    throw new Error(`${options.method ?? 'GET'} ${route} -> ${res.status} ${text.slice(0, 300)}`);
  }
  return json;
}

async function login() {
  const json = await request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  return json.data.token;
}

async function createApiToken(adminToken) {
  const existing = await request('/admin/api-tokens', {}, adminToken);
  for (const t of existing?.data ?? []) {
    await request(`/admin/api-tokens/${t.id}`, { method: 'DELETE' }, adminToken);
    console.log(`Deleted stale API token: ${t.name}`);
  }
  const json = await request('/admin/api-tokens', {
    method: 'POST',
    body: JSON.stringify({
      name: 'frontend-full-access',
      type: 'full-access',
      lifespan: null,
    }),
  }, adminToken);
  return json.data.accessKey;
}

async function listAllCountries(token, adminToken, pageSize = 100) {
  const all = [];
  const first = await request(
    `/content-manager/collection-types/api::country.country?page=1&pageSize=${pageSize}`,
    { method: 'GET' },
    adminToken,
  );
  for (const item of first?.results ?? []) all.push(item);
  const total = first?.pagination?.total ?? all.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  for (let p = 2; p <= pages; p += 1) {
    const next = await request(
      `/content-manager/collection-types/api::country.country?page=${p}&pageSize=${pageSize}`,
      { method: 'GET' },
      adminToken,
    );
    for (const item of next?.results ?? []) all.push(item);
  }
  return all;
}

async function main() {
  const adminToken = await login();
  console.log('Admin login OK.');

  const apiToken = await createApiToken(adminToken);
  const token = apiToken ?? process.env.STRAPI_API_TOKEN;
  if (!token) {
    throw new Error('Need a content API token for seeding.');
  }

  for (const item of await listAllCountries(token, adminToken)) {
    await request(
      `/content-manager/collection-types/api::country.country/${item.documentId}`,
      { method: 'DELETE' },
      adminToken,
    );
  }
  console.log(`Cleared existing countries (${(await listAllCountries(token, adminToken)).length} left).`);

  let created = 0;
  for (const c of COUNTRIES) {
    const payload = {
      data: {
        name: c.title,
        slug: c.slug,
        region: c.region,
        publishedAt: new Date().toISOString(),
      },
    };
    await request('/api/countries', { method: 'POST', body: JSON.stringify(payload) }, token);
    created += 1;
  }
  console.log(`Created ${created} countries.`);

  const list = await request('/api/countries?populate=*&sort=name');
  console.log(`Public API returned ${list.data.length} countries.`);
  const counts = {};
  for (const item of list.data) {
    const r = item.attributes?.region;
    counts[r] = (counts[r] ?? 0) + 1;
  }
  console.log('Region counts:', counts);
}

main().catch((err) => {
  console.error('SEED FAILED:', err.message);
  process.exit(1);
});