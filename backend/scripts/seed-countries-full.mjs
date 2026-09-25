/**
 * Seeds ALL 196 countries with the full Drupal-extracted country profile data:
 * ISO3, overview/slmPractices texts, commitments, and per-section/chart
 * data-visualization widgets (Superset iframes + Highcharts custom code).
 *
 * Idempotent: updates existing entries by slug, creates missing ones.
 *
 * Run while Strapi is running:
 *   node scripts/seed-countries-full.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.STRAPI_URL ?? 'http://localhost:1337';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@ugridit.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@ugridit123!';
const LIMIT = Number(process.env.SEED_LIMIT ?? 0);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COUNTRIES = JSON.parse(fs.readFileSync(path.join(__dirname, 'countries.json'), 'utf8'));
const PILOT = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../reference/pilot.json'), 'utf8'),
);

const REGION_M49 = {
  2: 'Africa',
  9: 'Oceania',
  19: 'Americas',
  142: 'Asia',
  150: 'Europe',
};
const UG = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../ugridit_drupal/web/modules/custom/ugrid/data/countries.json'), 'utf8'),
);
const regionByIso3 = {};
for (const row of UG.countries) {
  const r = REGION_M49[Number(row.region_m49)];
  if (r) regionByIso3[row.iso3] = r;
}

const WIDGET_SLOTS = [
  'mapCountryOverview', 'currentStateLandStatus', 'currentStateSocioEconomics',
  'threatsFires', 'threatsClimateHazards', 'threatsSocioEconomics',
  'impactsFoodHealth', 'impactsLandStatus', 'impactsClimateRelated',
  'trendsClimateRelated', 'trendsLandStatus', 'trendsSocioEconomics',
  'solutionsLandManagement', 'solutionsSocioEconomics', 'solutionsCommitments',
  'treaties',
  'currentStateChart', 'currentStateChart2', 'threatsChart1', 'threatsChart2',
  'trendsChart1', 'trendsChart2', 'trendsChart3', 'impactsChart1', 'impactsChart2',
  'solutionsChart1', 'solutionsChart2',
];

function subTokens(text, params) {
  return text.replace(/\[grid-dataviz:([a-zA-Z0-9_-]+)\]/g, (m, key) => params[key] ?? m);
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

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
  }
  const json = await request('/admin/api-tokens', {
    method: 'POST',
    body: JSON.stringify({ name: 'frontend-full-access', type: 'full-access', lifespan: null }),
  }, adminToken);
  return json.data.accessKey;
}

async function listCountries(adminToken, pageSize = 100) {
  const first = await request(
    `/content-manager/collection-types/api::country.country?page=1&pageSize=${pageSize}`,
    { method: 'GET' },
    adminToken,
  );
  const total = first?.pagination?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const all = [...(first?.results ?? [])];
  for (let p = 2; p <= pages; p += 1) {
    const next = await request(
      `/content-manager/collection-types/api::country.country?page=${p}&pageSize=${pageSize}`,
      { method: 'GET' },
      adminToken,
    );
    all.push(...(next?.results ?? []));
  }
  return all;
}

async function publish(uid, adminToken) {
  return request(
    `/content-manager/collection-types/api::country.country/${uid}/actions/publish`,
    { method: 'POST', body: JSON.stringify({}) },
    adminToken,
  ).catch((e) => console.warn(`  publish: ${e.message}`));
}

async function main() {
  const adminToken = await login();
  console.log('Admin login OK.');
  const apiToken = await createApiToken(adminToken);
  const token = apiToken ?? process.env.STRAPI_API_TOKEN;
  if (!token) throw new Error('Need a content API token for seeding.');

  const existing = await listCountries(adminToken);
  const bySlug = new Map(existing.map((c) => [c.slug, c]));
  const metaByName = new Map(COUNTRIES.map((c) => [c.title, c]));

  let list = PILOT.countries;
  if (LIMIT > 0) list = list.slice(0, LIMIT);
  console.log(`Seeding ${list.length} countries...`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  for (const c of list) {
    const meta = metaByName.get(c.title);
    const slug = meta?.slug ?? slugify(c.title);

    const widgets = {};
    for (const slot of WIDGET_SLOTS) {
      const w = c[slot];
      if (!w) continue;
      if (w.type === 'iframe') {
        widgets[slot] = { type: 'iframe', name: w.name, url: subTokens(w.url, { iso3cc: c.iso3 }) };
      } else if (w.type === 'code') {
        widgets[slot] = { type: 'code', name: w.name, code: w.code };
      }
    }

    const attrs = {
      name: c.title,
      slug,
      iso3: c.iso3,
      region: c.region ?? regionByIso3[c.iso3] ?? null,
      cpOverview: c.overview ?? null,
      slmPractices: c.slmPractices ?? null,
      commitmentsLdn: c.commitmentsLdn ?? null,
      commitmentsNbsap: c.commitmentsNbsap ?? null,
      commitmentsNdc: c.commitmentsNdc ?? null,
      commitmentsBonnChallenge: c.commitmentsBonnChallenge ?? null,
      data: { iso3: c.iso3, widgets },
    };

    if (!attrs.region) {
      console.warn(`  SKIP ${slug}: no region for iso3 ${c.iso3}`);
      skipped += 1;
      continue;
    }

    const prev = bySlug.get(slug);
    if (prev) {
      if (prev.cpOverview && prev.iso3) {
        skipped += 1;
        if (LIMIT <= 0) continue;
      }
      await request(`/content-manager/collection-types/api::country.country/${prev.documentId}`, {
        method: 'PUT',
        body: JSON.stringify(attrs),
      }, adminToken);
      await publish(prev.documentId, adminToken);
      updated += 1;
    } else {
      const createdRec = await request('/api/countries', { method: 'POST', body: JSON.stringify({ data: attrs }) }, token);
      const docId = createdRec?.data?.documentId;
      if (docId) await publish(docId, adminToken);
      created += 1;
    }
    process.stdout.write(`  ${updated + created + skipped}/${list.length} ${slug}\r`);
  }

  console.log(`\nDone. ${created} created, ${updated} updated, ${skipped} skipped (already rich).`);
}

main().catch((err) => {
  console.error('SEED FAILED:', err.message);
  process.exit(1);
});