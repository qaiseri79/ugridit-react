/**
 * Seed pilot countries with the rich Drupal-extracted country profile data:
 * ISO3, overview/slmPractices texts, commitments, and per-section/chart
 * data-visualization widgets (Superset iframes + Highcharts custom code)
 * stored in the Country `data` JSON field.
 *
 * Uses backend/scripts/countries.json for canonical names/slugs/regions and
 * reference/pilot.json for the extracted Drupal content.
 *
 * Run while Strapi is running:
 *   node scripts/seed-country-pilot.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.STRAPI_URL ?? 'http://localhost:1337';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@ugridit.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@ugridit123!';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COUNTRIES = JSON.parse(fs.readFileSync(path.join(__dirname, 'countries.json'), 'utf8'));
const PILOT = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../reference/pilot.json'), 'utf8'),
);

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
    console.log(`Deleted stale API token: ${t.name}`);
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

async function main() {
  const adminToken = await login();
  console.log('Admin login OK.');
  const apiToken = await createApiToken(adminToken);
  const token = apiToken ?? process.env.STRAPI_API_TOKEN;
  if (!token) throw new Error('Need a content API token for seeding.');

  const existing = await listCountries(adminToken);
  const bySlug = new Map(existing.map((c) => [c.slug, c]));

  const metaByName = new Map(COUNTRIES.map((c) => [c.title, c]));

  let created = 0;
  let updated = 0;
  for (const c of PILOT.pilot) {
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

    const payload = {
      data: {
        name: c.title,
        slug,
        iso3: c.iso3,
        region: c.region,
        cpOverview: c.overview ?? null,
        slmPractices: c.slmPractices ?? null,
        commitmentsLdn: c.commitmentsLdn ?? null,
        commitmentsNbsap: c.commitmentsNbsap ?? null,
        commitmentsNdc: c.commitmentsNdc ?? null,
        commitmentsBonnChallenge: c.commitmentsBonnChallenge ?? null,
        data: { iso3: c.iso3, widgets },
        publishedAt: new Date().toISOString(),
      },
    };

    const prev = bySlug.get(slug);
    if (prev) {
      // Content-manager update expects UNWRAPPED attributes.
      await request(`/content-manager/collection-types/api::country.country/${prev.documentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: c.title,
          slug,
          iso3: c.iso3,
          region: c.region,
          cpOverview: c.overview ?? null,
          slmPractices: c.slmPractices ?? null,
          commitmentsLdn: c.commitmentsLdn ?? null,
          commitmentsNbsap: c.commitmentsNbsap ?? null,
          commitmentsNdc: c.commitmentsNdc ?? null,
          commitmentsBonnChallenge: c.commitmentsBonnChallenge ?? null,
          data: { iso3: c.iso3, widgets },
        }),
      }, adminToken);
      // Publish so the public API serves the draft.
      await request(
        `/content-manager/collection-types/api::country.country/${prev.documentId}/actions/publish`,
        { method: 'POST', body: JSON.stringify({}) },
        adminToken,
      ).catch((e) => console.warn(`publish ${slug}: ${e.message}`));
      updated += 1;
      console.log(`Updated ${slug} (${c.iso3})`);
    } else {
      const created = await request('/api/countries', { method: 'POST', body: JSON.stringify(payload) }, token);
      const docId = created?.data?.documentId;
      if (docId) {
        await request(
          `/content-manager/collection-types/api::country.country/${docId}/actions/publish`,
          { method: 'POST', body: JSON.stringify({}) },
          adminToken,
        ).catch((e) => console.warn(`publish ${slug}: ${e.message}`));
      }
      created += 1;
      console.log(`Created ${slug} (${c.iso3})`);
    }
  }

  console.log(`\nSeeded ${PILOT.pilot.length} countries (${created} created, ${updated} updated).`);
  for (const c of PILOT.pilot) {
    const iframes = WIDGET_SLOTS.filter((s) => c[s]?.type === 'iframe').length;
    const codes = WIDGET_SLOTS.filter((s) => c[s]?.type === 'code').length;
    console.log(`  ${c.title}: ${iframes} iframes / ${codes} code widgets`);
  }
}

main().catch((err) => {
  console.error('SEED FAILED:', err.message);
  process.exit(1);
});