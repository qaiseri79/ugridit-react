const ports = [1337, 5173];
for (const p of ports) {
  try {
    const r = await fetch(`http://localhost:${p}/`, { redirect: 'manual' });
    const type = (r.headers.get('content-type') || '').slice(0, 60);
    const body = (await r.text()).slice(0, 160).replace(/\s+/g, ' ');
    console.log(p, r.status, type, body);
  } catch (e) {
    console.log(p, 'ERR', e.cause?.code ?? e.message);
  }
}