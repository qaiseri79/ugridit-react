const pageSize = 100;
const all = [];
let page = 1;
for (;;) {
  const res = await fetch(`http://localhost:1337/api/countries?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=name`);
  const j = await res.json();
  all.push(...j.data);
  if (page >= j.meta.pagination.pageCount) break;
  page += 1;
}
const withIso = all.filter((c) => c.iso3);
const withOverview = all.filter((c) => c.cpOverview && c.cpOverview.length > 0);
const withWidgets = all.filter((c) => Object.keys(c.data?.widgets ?? {}).length > 0);
const iframeCount = all.reduce((n, c) => n + Object.values(c.data?.widgets ?? {}).filter((w) => w?.type === 'iframe').length, 0);
const published = all.filter((c) => c.publishedAt).length;

console.log('total:', all.length, '| published:', published);
console.log('with iso3:', withIso.length);
console.log('with overview:', withOverview.length);
console.log('with widgets:', withWidgets.length, `(${iframeCount} iframes)`);
const noWidget = all.filter((c) => Object.keys(c.data?.widgets ?? {}).length === 0).map((c) => c.name);
console.log('no widgets:', noWidget.length ? noWidget.join(', ') : '(none)');