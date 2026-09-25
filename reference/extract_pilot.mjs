import { spawn } from 'node:child_process';
import fs from 'node:fs';

const DUMP = '/home/danielsudenfield/ugridit_react/ugridit_drupal/backup-2025-07-18T11-18-06.mysql.gz';
const OUT = '/home/danielsudenfield/ugridit_react/reference/pilot.json';

const stream = spawn('gzip', ['-dc', DUMP], { stdio: ['ignore', 'pipe', 'inherit'] });
const buf = [];
stream.stdout.on('data', (chunk) => buf.push(chunk));
stream.stdout.on('end', () => main(Buffer.concat(buf).toString('utf8')));

function parseCols(createSql) {
  const m = createSql.match(/^CREATE TABLE `[a-z_0-9]+` \(([\s\S]*?)(?:PRIMARY KEY|UNIQUE KEY|KEY|CONSTRAINT|DEFAULT CHARSET|ENGINE=)/);
  const block = m ? m[1] : createSql;
  const list = [...block.matchAll(/`([a-z_0-9]+)`/g)].map((mm) => mm[1]);
  return { list, idx: Object.fromEntries(list.map((n, i) => [n, i])) };
}

function splitTuples(vals, colCount) {
  const out = [];
  let row = [];
  let cur = '';
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = 0; i < vals.length; i++) {
    const ch = vals[i];
    if (inStr) {
      if (esc) { cur += ch; esc = false; continue; }
      if (ch === '\\') { cur += ch; esc = true; continue; }
      if (ch === "'") { cur += ch; inStr = false; continue; }
      cur += ch;
      continue;
    }
    if (ch === "'") { cur += ch; inStr = true; continue; }
    if (ch === '(') {
      depth++;
      if (depth === 1) { row = []; cur = ''; continue; }
      cur += ch;
      continue;
    }
    if (ch === ')') {
      depth--;
      if (depth === 0) {
        row.push(cur);
        if (row.length === colCount) out.push(row);
        continue;
      }
      cur += ch;
      continue;
    }
    if (depth === 0) continue;
    if (ch === ',') { row.push(cur); cur = ''; continue; }
    cur += ch;
  }
  return out;
}

function unescape(v) {
  if (typeof v !== 'string' || !v.startsWith("'")) return v;
  const inner = v.slice(1, -1);
  return inner.replace(/\\(.)/g, (_m, c) => {
    switch (c) {
      case 'n': return '\n';
      case 'r': return '\r';
      case 't': return '\t';
      case '0': return '\0';
      case 'b': return '\b';
      case 'Z': return '\u001a';
      default: return c;
    }
  });
}

function subTokens(text, params) {
  return text.replace(/\[grid-dataviz:([a-zA-Z0-9_-]+)\]/g, (m, key) => params[key] ?? m);
}

class Dump {
  constructor(text) {
    this.lines = text.split('\n');
    this.tables = new Map();
    const createHeaders = new Map();
    const insertTable = new Map();
    for (const l of this.lines) {
      const c = l.match(/^CREATE TABLE `([a-z_0-9]+)`/);
      if (c) createHeaders.set(c[1], l);
      const i = l.match(/^INSERT INTO `([a-z_0-9]+)` VALUES/i);
      if (i) insertTable.set(i[1], (insertTable.get(i[1]) ?? '') + l.slice(l.indexOf('VALUES') + 6));
    }
    this.createHeaders = createHeaders;
    this.insertPayloads = insertTable;
  }
  rows(table) {
    if (this.tables.has(table)) return this.tables.get(table);
    const create = this.createHeaders.get(table);
    if (!create) return [];
    const { idx, list } = parseCols(create);
    const payload = this.insertPayloads.get(table);
    const rows = payload ? splitTuples(payload, list.length) : [];
    const out = rows.map((r) => Object.fromEntries(list.map((n, i) => [n, unescape(r[i])])));
    out.__idx = idx;
    this.tables.set(table, out);
    return out;
  }
}

async function main(text) {
  const d = new Dump(text);

  // node title map
  const nodeFieldData = d.rows('node_field_data');
  const countryNodes = nodeFieldData.filter((r) => r.type === 'country_profile');
  console.log('country_profile nodes in dump:', countryNodes.length);
  console.log('  sample:', JSON.stringify(countryNodes[0]));
  const iso3Rows = d.rows('taxonomy_term__field_country_iso3');
  console.log('  iso3 table sample ids:', iso3Rows.slice(0, 4).map((r) => `${r.entity_id}=${r.field_country_iso3_value}`).join(' '));
  const parRows = d.rows('node__field_country_profile_content');
  console.log('  paragraph-ref sample:', parRows.slice(0, 4).map((r) => `${r.entity_id}->${r.field_country_profile_content_target_id}`).join(' '));
  const titleByNid = {};
  for (const r of nodeFieldData) {
    if (r.type === 'country_profile') titleByNid[r.nid] = r.title;
  }

  const iso3ByPar = {};
  for (const r of d.rows('taxonomy_term__field_country_iso3')) {
    iso3ByPar[r.entity_id] = r.field_country_iso3_value;
  }
  const ISO3 = iso3ByPar;
  const iso3Val = (r) => r.field_country_iso3_value;

  const parByNid = {};
  for (const r of d.rows('node__field_country_profile_content')) {
    if (r.deleted === '0') parByNid[r.entity_id] = r.field_country_profile_content_target_id;
  }

  // media catalog: iframe urls + custom code, latest revision per media
  const iframeUrl = {};
  for (const r of d.rows('media_revision__field_media_dv_iframe')) {
    const cur = iframeUrl[r.entity_id];
    if (!cur || Number(r.revision_id) > Number(cur.rev)) iframeUrl[r.entity_id] = { rev: r.revision_id, url: r.field_media_dv_iframe_url };
  }
  const codeByMid = {};
  for (const r of d.rows('media_revision__field_media_custom_code')) {
    const cur = codeByMid[r.entity_id];
    if (!cur || Number(r.revision_id) > Number(cur.rev)) codeByMid[r.entity_id] = { rev: r.revision_id, code: r.field_media_custom_code_code, libs: r.field_media_custom_code_libraries };
  }
  const media = {};
  for (const r of d.rows('media_field_data')) {
    if (r.status !== '1') continue;
    if (r.bundle === 'dataviz_iframe' && iframeUrl[r.mid]) {
      media[r.mid] = { mid: r.mid, type: 'iframe', name: r.name, url: iframeUrl[r.mid].url };
    } else if (r.bundle === 'dataviz_custom_code' && codeByMid[r.mid]) {
      media[r.mid] = { mid: r.mid, type: 'code', name: r.name, code: codeByMid[r.mid].code };
    }
  }

  // field table config: strapiSlot -> [table, valueColumn]
  const fieldMap = {
    mapCountryOverview: ['node__field_map_country_overview', 'field_map_country_overview_target_id'],
    currentStateLandStatus: ['node__field_current_state_land_status', 'field_current_state_land_status_target_id'],
    currentStateSocioEconomics: ['node__field_current_state_socio_econom', 'field_current_state_socio_econom_target_id'],
    threatsFires: ['node__field_threats_fires', 'field_threats_fires_target_id'],
    threatsClimateHazards: ['node__field_threats_climate_hazards', 'field_threats_climate_hazards_target_id'],
    threatsSocioEconomics: ['node__field_threats_socio_economics', 'field_threats_socio_economics_target_id'],
    impactsFoodHealth: ['node__field_impacts_food_health', 'field_impacts_food_health_target_id'],
    impactsLandStatus: ['node__field_impacts_land_status', 'field_impacts_land_status_target_id'],
    impactsClimateRelated: ['node__field_impacts_climate_related', 'field_impacts_climate_related_target_id'],
    trendsClimateRelated: ['node__field_trends_climate_related', 'field_trends_climate_related_target_id'],
    trendsLandStatus: ['node__field_trends_land_status', 'field_trends_land_status_target_id'],
    trendsSocioEconomics: ['node__field_trends_socio_economics', 'field_trends_socio_economics_target_id'],
    solutionsLandManagement: ['node__field_solutions_land_management', 'field_solutions_land_management_target_id'],
    solutionsSocioEconomics: ['node__field_solutions_socio_economics', 'field_solutions_socio_economics_target_id'],
    solutionsCommitments: ['node__field_solutions_commitments', 'field_solutions_commitments_target_id'],
    treaties: ['node__field_treateas', 'field_treateas_target_id'],
    currentStateChart: ['node__field_current_state_graph_chart', 'field_current_state_graph_chart_target_id'],
    currentStateChart2: ['node__field_current_state_graph_chart2', 'field_current_state_graph_chart2_target_id'],
    threatsChart1: ['node__field_threats_graphic_chart_1', 'field_threats_graphic_chart_1_target_id'],
    threatsChart2: ['node__field_threats_graphic_chart_2', 'field_threats_graphic_chart_2_target_id'],
    trendsChart1: ['node__field_trends_graphic_chart_1', 'field_trends_graphic_chart_1_target_id'],
    trendsChart2: ['node__field_trends_graphic_chart_2', 'field_trends_graphic_chart_2_target_id'],
    trendsChart3: ['node__field_trends_graphic_chart_3', 'field_trends_graphic_chart_3_target_id'],
    impactsChart1: ['node__field_impacts_graphic_chart_1', 'field_impacts_graphic_chart_1_target_id'],
    impactsChart2: ['node__field_impacts_graphic_chart_2', 'field_impacts_graphic_chart_2_target_id'],
    solutionsChart1: ['node__field_solutions_graphic_chart_1', 'field_solutions_graphic_chart_1_target_id'],
    solutionsChart2: ['node__field_solutions_graphic_chart_2', 'field_solutions_graphic_chart_2_target_id'],
    commitmentsLdn: ['node__field_commitments_ldn', 'field_commitments_ldn_value'],
    commitmentsNbsap: ['node__field_commitments_nbsap', 'field_commitments_nbsap_value'],
    commitmentsNdc: ['node__field_commitments_ndc', 'field_commitments_ndc_value'],
    commitmentsBonnChallenge: ['node__field_commitments_bonn_challenge', 'field_commitments_bonn_challenge_value'],
    overview: ['node__field_cp_overview', 'field_cp_overview_value'],
    slmPractices: ['node__field_solutions_slm_practices', 'field_solutions_slm_practices_value'],
    shortSummary: ['node__field_short_summary', 'field_short_summary_value'],
  };

  const slotRefs = {};
  for (const [slot, [table, col]] of Object.entries(fieldMap)) {
    slotRefs[slot] = slotRefs[slot] ?? {};
    for (const r of d.rows(table)) {
      if (r.deleted !== '0') continue;
      slotRefs[slot][r.entity_id] = r[col];
    }
  }

  // region map from backend/scripts/countries.json (title -> region)
  const countriesJson = JSON.parse(fs.readFileSync('/home/danielsudenfield/ugridit_react/backend/scripts/countries.json', 'utf8'));
  const regionByTitle = Object.fromEntries(countriesJson.map((c) => [c.title, c.region]));

  const countries = [];
  for (const [nid, title] of Object.entries(titleByNid)) {
    const par = parByNid[nid];
    const iso3 = par ? ISO3[par] : null;
    const c = {
      nid,
      title,
      iso3: iso3 || null,
      region: regionByTitle[title] ?? null,
    };
    for (const slot of Object.keys(fieldMap)) {
      c[slot] = slotRefs[slot][nid] ?? null;
    }
    countries.push(c);
  }

  // Resolve media refs into {type,url|code,name} for section/chart slots
  function c2resolve(country, slot) {
    const targetId = country[slot];
    if (!targetId) return null;
    const m = media[targetId];
    if (!m) return { type: 'unknown', mid: targetId };
    if (m.type === 'iframe') return { type: 'iframe', name: m.name, url: m.url };
    return { type: 'code', name: m.name, code: m.code };
  }

  const sectionSlots = [
    'mapCountryOverview', 'currentStateLandStatus', 'currentStateSocioEconomics',
    'threatsFires', 'threatsClimateHazards', 'threatsSocioEconomics',
    'impactsFoodHealth', 'impactsLandStatus', 'impactsClimateRelated',
    'trendsClimateRelated', 'trendsLandStatus', 'trendsSocioEconomics',
    'solutionsLandManagement', 'solutionsSocioEconomics', 'solutionsCommitments', 'treaties',
  ];
  const chartSlots = [
    'currentStateChart', 'currentStateChart2', 'threatsChart1', 'threatsChart2',
    'trendsChart1', 'trendsChart2', 'trendsChart3', 'impactsChart1', 'impactsChart2',
    'solutionsChart1', 'solutionsChart2',
  ];
  const textSlots = ['overview', 'slmPractices', 'shortSummary', 'commitmentsLdn', 'commitmentsNbsap', 'commitmentsNdc', 'commitmentsBonnChallenge'];

  const final = countries
    .filter((c) => c.iso3)
    .map((c) => {
      const out = { nid: c.nid, title: c.title, iso3: c.iso3, region: c.region };
      for (const slot of sectionSlots) out[slot] = c2resolve(c, slot);
      for (const slot of chartSlots) out[slot] = c2resolve(c, slot);
      for (const slot of textSlots) {
        out[slot] = c[slot] && c[slot] !== '' && c[slot] !== '0' ? c[slot] : null;
      }
      return out;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  // pick pilot: needs overview + >=1 commitment + >=4 iframe widgets
  const pilots = final.filter(
    (c) =>
      c.overview &&
      (c.commitmentsLdn || c.commitmentsNbsap || c.commitmentsNdc || c.commitmentsBonnChallenge) &&
      [c.currentStateLandStatus, c.threatsFires, c.trendsLandStatus, c.impactsFoodHealth].filter(Boolean).length >= 2,
  );
  const pilot = pilots.slice(0, 4);

  const out = {
    generatedAt: new Date().toISOString(),
    notes: {
      media: {
        totalIframe: Object.values(media).filter((m) => m.type === 'iframe').length,
        totalCode: Object.values(media).filter((m) => m.type === 'code').length,
      },
      iso3Mapping: `paragraph -> iso3 from taxonomy_term__field_country_iso3 (${Object.keys(ISO3).length} rows)`,
      token: 'URLs still carry [grid-dataviz:iso3cc] tokens; substitute with country iso3',
    },
    mediaCatalog: media,
    countries: final,
    pilot,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log(`media: ${Object.keys(media).length} dataviz (iframe=${out.notes.media.totalIframe}, code=${out.notes.media.totalCode})`);
  console.log(`countries: ${final.length} total, pilots: ${pilot.length}`);
  for (const p of pilot) {
    const iframes = [p.currentStateLandStatus, p.threatsFires, p.trendsLandStatus, p.impactsFoodHealth].filter(Boolean).length;
    console.log(`  #${p.nid} ${p.title} (${p.iso3}, ${p.region}) overview=${!!p.overview} commits=${!!p.commitmentsLdn || !!p.commitmentsNbsap} iframeSections=${iframes}`);
  }
  console.log(`\nextra details: sample section -> `);
  const s = pilot[0];
  if (s) console.log(JSON.stringify({ currentStateLandStatus: s.currentStateLandStatus, currentStateChart: s.currentStateChart }, null, 2));

  // reachability probe of first iframe URL with iso3 substituted
  if (pilot[0]) {
    const probe = pilot[0].currentStateLandStatus?.url;
    if (probe) {
      const url = subTokens(probe, { iso3cc: pilot[0].iso3 });
      console.log(`\nprobe: ${url}`);
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 15000);
        const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
        clearTimeout(t);
        console.log(`dash reachable? HTTP ${res.status}`);
      } catch (e) {
        console.log(`dash NOT reachable: ${e.message}`);
      }
    }
  }
}

function objectKeys(arr) {
  return arr;
}