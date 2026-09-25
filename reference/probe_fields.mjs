import { spawn } from 'node:child_process';

const DUMP = '/home/danielsudenfield/ugridit_react/ugridit_drupal/backup-2025-07-18T11-18-06.mysql.gz';

const tables = [
  'node__field_country_profile_content',
  'node__field_cp_overview',
  'node__field_cp_threats',
  'node__field_map_country_overview',
  'node__field_current_state_land_status',
  'node__field_current_state_socio_econom',
  'node__field_threats_fires',
  'node__field_threats_climate_hazards',
  'node__field_threats_socio_economics',
  'node__field_treateas',
  'node__field_impacts_land_status',
  'node__field_impacts_food_health',
  'node__field_impacts_climate_related',
  'node__field_trends_land_status',
  'node__field_trends_climate_related',
  'node__field_trends_socio_economics',
  'node__field_solutions_land_management',
  'node__field_solutions_socio_economics',
  'node__field_solutions_commitments',
  'node__field_solutions_slm_practices',
  'node__field_current_state_graph_chart',
  'node__field_current_state_graph_chart2',
  'node__field_threats_graphic_chart_1',
  'node__field_threats_graphic_chart_2',
  'node__field_trends_graphic_chart_1',
  'node__field_trends_graphic_chart_2',
  'node__field_trends_graphic_chart_3',
  'node__field_impacts_graphic_chart_1',
  'node__field_impacts_graphic_chart_2',
  'node__field_solutions_graphic_chart_1',
  'node__field_solutions_graphic_chart_2',
  'node__field_commitments_ldn',
  'node__field_commitments_nbsap',
  'node__field_commitments_ndc',
  'node__field_commitments_bonn_challenge',
  'node__field_short_summary',
  'node__body',
];

const stream = spawn('gzip', ['-dc', DUMP], { stdio: ['ignore', 'pipe', 'inherit'] });
const buf = [];
stream.stdout.on('data', (chunk) => buf.push(chunk));
stream.stdout.on('end', () => analyze(Buffer.concat(buf).toString('utf8')));

function analyze(text) {
  const lines = text.split('\n');
  for (const table of tables) {
    const inserts = lines
      .filter((l) => l.includes(`INSERT INTO \`${table}\``))
      .map((l) => l.slice(0, 400));
    const creates = lines
      .filter((l) => l.includes(`CREATE TABLE \`${table}\``))
      .map((l) => l.slice(0, 900));
    const colNames = [...new Set(creates.flatMap((c) => [...c.matchAll(/`([a-z_0-9]+)`/g)].map((m) => m[1])))];
    console.log(`\n===== ${table} =====`);
    console.log(`cols: ${colNames.join(', ')}`);
    console.log(`inserts: ${inserts.length}`);
    for (const i of inserts.slice(0, 3)) console.log('  ' + i.replace(/\r\n/g, '¶'));
  }
}