/**
 * One-time seed script: creates the first admin user (if none exists),
 * uploads the migrated team photos, and creates the portfolio entries
 * migrated from the Drupal site.
 *
 * Run inside the backend dir while Strapi is running:
 *   node scripts/seed.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.STRAPI_URL ?? 'http://localhost:1337';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@ugridit.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@ugridit123!';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTO_DIR = process.env.PHOTO_DIR ?? '/home/danielsudenfield/ugridit_react/reference/team_photos';

const MEMBERS = [
  {
    slug: 'andreea-becheru',
    name: 'Andreea Becheru',
    designation: 'Office Management',
    email: 'abecheru@unccd.int',
    photoFile: 'andrea.jpg',
    body: [
      'Andreea has both a Legal and Administrative Sciences and Business Administration master\u2019s degree.',
      'She also has over 20 years of professional experience in business administration and project management implementation in multicultural environments such as United Nations, European Commission, Government and Private Sector.',
      'She has been working in UN system for more than 11 years having the opportunity to provide comprehensive support to several global projects\u2019 implementation across UNV, UNICEF, UNFCCC and now to UNCCD.',
    ],
  },
  {
    slug: 'muralee-thummarukudy',
    name: 'Dr. Muralee Thummarukudy',
    designation: 'Director',
    email: 'mthummarukudy@unccd.int',
    photoFile: 'muralee.jpg',
    body: [
      'Dr. Thummarukudy brings to this position over three decades of progressive senior management experience and technical expertise in land restoration issues. He has most recently served as the acting Head of the Disasters and Conflicts Programme at the United Nations Environment Programme, where he implemented a portfolio of over 100 million USD, focusing on ecosystem-based disaster reduction and partnership development.',
      'An internationally renowned expert in disaster response, he played a key role in addressing the environmental aftermath of many major conflicts and disasters, implementing projects in over 35 countries. Prior to joining the United Nations, Dr. Thummarukudy served as Environmental Advisor to Shell Group in Southeast Asia and the Middle East.',
      'He has a Ph.D. in Environmental Engineering from Indian Institute of Technology Kanpur. He was also a Beahr\u2019s fellow at the University of California, Berkeley. Dr. Thummarukudy is also a well-known author in his native Malayalam language.',
    ],
  },
  {
    slug: 'mohamed-el-vilaly',
    name: 'Dr. Mohamed Abd salam EL Vilaly',
    designation: 'Programme Officer',
    email: 'avilaly@unccd.int',
    photoFile: 'abd.jpg',
    body: [
      'Dr. Mohamed Abd Salam EL Vilaly is a Programme Officer with the United Nations Convention to Combat Desertification (UNCCD) Secretariat in Bonn, leading Information Management for the G20 Global Land Initiative. Mohamed Abd Salam El Vilaly received a B.Sc. in water resources management from the University of Nouakchott, Mauritania in 2001, a Specialized M.Sc. degree (dipl\u00f4me d\u2019\u00e9tudes sup\u00e9rieures sp\u00e9cialis\u00e9es ) in groundwater management from the University of Grenoble, France in 2003, a Research M.Sc. degree (Dipl\u00f4me d\u2019\u00e9tudes approfondies ) in hydrology from the University of Avignon and the Vaucluse, France in 2004, and a Ph.D. degree in applied remote sensing for Earth Sciences from the University of Arizona, the United States, in 2013.',
      'Dr. Abd Salam has over 18 years of combined work experience from the United Nations, the humanitarian, academic, and private sectors. His research focuses on integrating and analysing multitemporal airborne and satellite remote sensing data with GIS technologies to monitor and model human-environment interactions across a wide range of spatial and temporal scales. More specifically, Abd Salam\u2019s work intersects the concepts of big data analytics, decision-making, planning and management, and the development of online data and knowledge exploration tools and platforms.',
      'Prior to joining the United Nations Convention to Combat Desertification(UNCCD) as a Program Officer (Information Management), Dr Abd Salam worked for the International Food Policy Research Institute(IFPRI) in Washington DC, AfricaRice in Cotonou, Benin, United Nations Population Fund(UNFPA) in Johannesburg, South Africa and in New York, USA, and United Nations Economic and Social Commission for Western Asia(UN-ESCWA) in Beirut, Lebanon .',
    ],
  },
  {
    slug: 'devashree-niraula',
    name: 'Devashree Niraula',
    designation: 'Research and Outreach Specialist',
    email: 'dniraula@unccd.int',
    photoFile: 'devashree.jpg',
    body: [
      'Devashree is a research associate at the G20 global initiative on land and hails from Kathmandu, Nepal.',
      'She is a graduate of Gothenburg University, Sweden with a major in climate and ecosystem.',
      'Devashree has a solid academic background in research, climate data and geospatial analysis.',
      'Prior to her involvement with UNCCD, she was an intern at United Nations Environment Programme (UNEP) as a climate and security intern. In this capacity, Devashree had been supporting the unit with research, data analysis and coordination.',
      'Devashree\u2019s interests lie in interdisciplinary work of anthropogenic impacts research and using that research to inform policy on all levels.',
    ],
  },
  {
    slug: 'ebenezer-attua-odoi',
    name: 'Ebenezer Attua Odoi Jnr',
    designation: 'GIS Developer',
    email: 'eodoi@unccd.int',
    photoFile: 'ebenezer.png',
    body: [
      'Ebenezer is a Geographic Information System (GIS) Developer at the G20 global initiative on land from Tallahassee, Florida.',
      'Ebenezer\u2019s research interests include GIS automation, Databases, Web, and mobile application development.',
    ],
  },
];

function paragraphsToBlocks(paragraphs) {
  return paragraphs.map((text) => ({
    type: 'paragraph',
    children: [{ type: 'text', text }],
  }));
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

async function registerAdminIfNeeded() {
  try {
    await request('/admin/register-admin', {
      method: 'POST',
      body: JSON.stringify({
        firstname: 'Admin',
        lastname: 'User',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });
    console.log(`Created first admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } catch (err) {
    if (err.message.includes('You cannot register a new super admin')) {
      console.log('Admin already exists — skipping registration.');
    } else {
      throw err;
    }
  }
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
  console.log('Created full-access API token.');
  return json.data.accessKey;
}

async function uploadPhoto(fileName, token) {
  const p = path.join(PHOTO_DIR, fileName);
  const buf = fs.readFileSync(p);
  const fd = new FormData();
  fd.append('files', new Blob([buf]), fileName);
  const json = await request('/api/upload', { method: 'POST', body: fd }, token);
  return json[0].id;
}

async function listAllPortfolios(token, adminToken, pageSize = 100) {
  const all = [];
  const first = await request(
    `/content-manager/collection-types/api::portfolio.portfolio?page=1&pageSize=${pageSize}`,
    { method: 'GET' },
    adminToken,
  );
  for (const item of first?.results ?? []) all.push(item);
  const total = first?.pagination?.total ?? all.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  for (let p = 2; p <= pages; p += 1) {
    const next = await request(
      `/content-manager/collection-types/api::portfolio.portfolio?page=${p}&pageSize=${pageSize}`,
      { method: 'GET' },
      adminToken,
    );
    for (const item of next?.results ?? []) all.push(item);
  }
  return all;
}

async function main() {
  await registerAdminIfNeeded();
  const adminToken = await login();
  console.log('Admin login OK.');

  const apiToken = await createApiToken(adminToken);
  const token = apiToken ?? process.env.STRAPI_API_TOKEN;
  if (!token) {
    throw new Error('Need a content API token for seeding (create one, set STRAPI_API_TOKEN).');
  }

  // Idempotency: clear existing portfolios and media before seeding.
  // Content-manager (admin) delete handles v5 draft/publish versions correctly.
  for (const item of await listAllPortfolios(token, adminToken)) {
    await request(
      `/content-manager/collection-types/api::portfolio.portfolio/${item.documentId}`,
      { method: 'DELETE' },
      adminToken,
    );
    console.log(`Removed existing portfolio: ${item.name ?? item.id}`);
  }
  const files = await request('/api/upload/files?pagination[pageSize]=100', { method: 'GET' }, token);
  for (const file of files ?? []) {
    await request(`/api/upload/files/${file.id}`, { method: 'DELETE' }, token);
  }
  console.log('Cleared existing media library.');

  for (const member of MEMBERS) {
    const photoId = await uploadPhoto(member.photoFile, token);
    const payload = {
      data: {
        name: member.name,
        slug: member.slug,
        designation: member.designation,
        email: member.email,
        summary: member.body[0],
        body: paragraphsToBlocks(member.body),
        photo: photoId,
        publishedAt: new Date().toISOString(),
      },
    };
    await request('/api/portfolios', { method: 'POST', body: JSON.stringify(payload) }, token);
    console.log(`Created portfolio: ${member.name} (photo ${photoId})`);
  }

  const list = await request('/api/portfolios?populate=*');
  console.log(`Public API returned ${list.data.length} portfolios.`);
  for (const item of list.data) {
    const photo = item.attributes?.photo;
    const url =
      photo?.data?.attributes?.url ??
      photo?.attributes?.url ??
      photo?.url ??
      '(no url)';
    console.log(`  - ${item.attributes?.name} [${item.attributes?.slug}] photo=${url}`);
  }
}

main().catch((err) => {
  console.error('SEED FAILED:', err.message);
  process.exit(1);
});