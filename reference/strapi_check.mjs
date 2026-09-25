const base = 'http://localhost:1337';

async function check() {
  const health = await fetch(`${base}/_health`).then((r) => r.text());
  console.log('HEALTH:', health);
  const portfolios = await fetch(`${base}/api/portfolios`).then(async (r) => ({
    status: r.status,
    body: await r.text(),
  }));
  console.log('PORTFOLIOS STATUS:', portfolios.status);
  console.log('PORTFOLIOS BODY:', portfolios.body.slice(0, 500));
  const init = await fetch(`${base}/admin/init`).then((r) => r.text());
  console.log('ADMIN INIT:', init.slice(0, 400));
  const counts = await fetch(`${base}/admin/users/count`).then(async (r) => ({
    status: r.status,
    body: await r.text(),
  }));
  console.log('ADMIN USERS COUNT STATUS:', counts.status, 'BODY:', counts.body);
}

check().catch((e) => {
  console.error('ERROR', e);
  process.exit(1);
});