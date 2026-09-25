const query = {
  datasource: { id: 13, type: 'table' },
  force: false,
  queries: [
    {
      time_range: 'No filter',
      filters: [
        { col: 'indicator_uid', op: 'IN', val: ['8425', '8427', '8422'] },
        { col: 'code_iso3', op: '==', val: 'DZA' },
      ],
      extras: { time_grain_sqla: 'P1D', having: '', having_druid: [] },
      applied_time_extras: {},
      annotation_layers: [],
      groupby: [],
      columns: ['indicator_name_label_metric', 'indicator_value'],
      metrics: [],
      order_desc: true,
      orderby: [],
      row_limit: 10000,
      timeseries_limit: 0,
      url_params: {},
    },
  ],
  result_format: 'json',
  result_type: 'full',
}

const res = await fetch('http://localhost:5173/api/dataviz/v1/chart/data', {
  method: 'POST',
  headers: { accept: 'application/json', 'Content-Type': 'application/json' },
  body: JSON.stringify(query),
})
console.log('proxy-status', res.status)
const j = await res.json()
console.log('rows:', j.result?.[0]?.data?.length ?? 'n/a')